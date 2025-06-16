package com.gilbertomorales.portaria.service;

import com.gilbertomorales.portaria.dto.ReservaRequestDTO;
import com.gilbertomorales.portaria.dto.ReservaResponseDTO;
import com.gilbertomorales.portaria.dto.RetiradaDevolucaoDTO;
import com.gilbertomorales.portaria.model.Item;
import com.gilbertomorales.portaria.model.Reserva;
import com.gilbertomorales.portaria.model.User;
import com.gilbertomorales.portaria.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UserService userService;
    private final ItemService itemService;

    public List<ReservaResponseDTO> findAll() {
        return reservaRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaResponseDTO> findByItemId(String itemId) {
        return reservaRepository.findByItemId(itemId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaResponseDTO> findByMatricula(String matricula) {
        return reservaRepository.findByMatriculaUsuario(matricula).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public ReservaResponseDTO criarReserva(ReservaRequestDTO request) {
        // Buscar usuário pela matrícula
        User usuario = userService.findByMatricula(request.matriculaUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com a matrícula: " + request.matriculaUsuario()));

        // Buscar item
        Item item = itemService.findById(request.itemId())
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        // Verificar se o item está disponível
        if (!item.getDisponivel()) {
            throw new RuntimeException("Item não está disponível para reserva");
        }

        // Verificar se já existe uma reserva ativa para este item
        Optional<Reserva> reservaAtiva = reservaRepository.findByItemIdAndDataDevolucaoIsNull(request.itemId());
        if (reservaAtiva.isPresent()) {
            throw new RuntimeException("Item já possui uma reserva ativa");
        }

        // Criar a reserva
        Reserva reserva = new Reserva();
        reserva.setItemId(item.getId());
        reserva.setUsuarioId(usuario.getId());
        reserva.setDataReserva(LocalDateTime.now());
        reserva.setNomeItem(item.getNome());
        reserva.setNomeUsuario(usuario.getNome());
        reserva.setMatriculaUsuario(usuario.getMatricula());

        // Marcar item como indisponível
        itemService.marcarComoIndisponivel(item.getId());

        Reserva reservaSalva = reservaRepository.save(reserva);
        return convertToResponseDTO(reservaSalva);
    }

    public ReservaResponseDTO registrarRetirada(String reservaId, RetiradaDevolucaoDTO request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

        // Verificar se a matrícula ta certa
        if (!reserva.getMatriculaUsuario().equals(request.matriculaUsuario())) {
            throw new RuntimeException("Matrícula não confere com a reserva");
        }

        // Verificar se já foi retirado
        if (reserva.getDataRetirada() != null) {
            throw new RuntimeException("Item já foi retirado");
        }

        reserva.setDataRetirada(LocalDateTime.now());
        Reserva reservaAtualizada = reservaRepository.save(reserva);

        return convertToResponseDTO(reservaAtualizada);
    }

    public ReservaResponseDTO registrarDevolucao(String reservaId, RetiradaDevolucaoDTO request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

        // Verificar se a matrícula ta certa
        if (!reserva.getMatriculaUsuario().equals(request.matriculaUsuario())) {
            throw new RuntimeException("Matrícula não confere com a reserva");
        }

        // Verificar se foi retirado
        if (reserva.getDataRetirada() == null) {
            throw new RuntimeException("Item ainda não foi retirado");
        }

        // Verificar se já foi devolvido
        if (reserva.getDataDevolucao() != null) {
            throw new RuntimeException("Item já foi devolvido");
        }

        reserva.setDataDevolucao(LocalDateTime.now());
        Reserva reservaAtualizada = reservaRepository.save(reserva);

        // Marcar item como disponível novamente
        itemService.marcarComoDisponivel(reserva.getItemId());

        return convertToResponseDTO(reservaAtualizada);
    }

    public List<ReservaResponseDTO> findReservasAtivasByMatricula(String matricula) {
        return reservaRepository.findByMatriculaUsuarioAndDataDevolucaoIsNull(matricula).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    private ReservaResponseDTO convertToResponseDTO(Reserva reserva) {
        // Determinar status do item
        String status;
        if (reserva.getDataDevolucao() != null) {
            status = "DEVOLVIDO";
        } else if (reserva.getDataRetirada() != null) {
            status = "RETIRADO";
        } else {
            status = "RESERVADO";
        }

        return new ReservaResponseDTO(
            reserva.getId(),
            reserva.getItemId(),
            reserva.getNomeItem(),
            reserva.getUsuarioId(),
            reserva.getNomeUsuario(),
            reserva.getMatriculaUsuario(),
            reserva.getDataReserva(),
            reserva.getDataRetirada(),
            reserva.getDataDevolucao(),
            status
        );
    }
}
