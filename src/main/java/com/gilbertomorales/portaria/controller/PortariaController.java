package com.gilbertomorales.portaria.controller;

import com.gilbertomorales.portaria.dto.ReservaRequestDTO;
import com.gilbertomorales.portaria.dto.ReservaResponseDTO;
import com.gilbertomorales.portaria.dto.RetiradaDevolucaoDTO;
import com.gilbertomorales.portaria.model.Item;
import com.gilbertomorales.portaria.model.User;
import com.gilbertomorales.portaria.service.ItemService;
import com.gilbertomorales.portaria.service.ReservaService;
import com.gilbertomorales.portaria.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portaria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PortariaController {

    private final UserService userService;
    private final ItemService itemService;
    private final ReservaService reservaService;
    /**
     * Busca usuário por matrícula
     */
    @GetMapping("/cracha/{matricula}")
    public ResponseEntity<User> lerCracha(@PathVariable String matricula) {
        return userService.findByMatricula(matricula)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria reserva via matrícula
     */
    @PostMapping("/cracha/{matricula}/reservar/{itemId}")
    public ResponseEntity<ReservaResponseDTO> reservarPorCracha(
            @PathVariable String matricula,
            @PathVariable String itemId) {
        try {
            ReservaRequestDTO request = new ReservaRequestDTO(itemId, matricula);
            ReservaResponseDTO reserva = reservaService.criarReserva(request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Retirada via matrícula
     */
    @PostMapping("/cracha/{matricula}/retirar/{reservaId}")
    public ResponseEntity<ReservaResponseDTO> retirarPorCracha(
            @PathVariable String matricula,
            @PathVariable String reservaId) {
        try {
            RetiradaDevolucaoDTO request = new RetiradaDevolucaoDTO(matricula);
            ReservaResponseDTO reserva = reservaService.registrarRetirada(reservaId, request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Devolução via matrícula
     */
    @PostMapping("/cracha/{matricula}/devolver/{reservaId}")
    public ResponseEntity<ReservaResponseDTO> devolverPorCracha(
            @PathVariable String matricula,
            @PathVariable String reservaId) {
        try {
            RetiradaDevolucaoDTO request = new RetiradaDevolucaoDTO(matricula);
            ReservaResponseDTO reserva = reservaService.registrarDevolucao(reservaId, request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Consultar reservas ativas via matrícula
     */
    @GetMapping("/cracha/{matricula}/reservas-ativas")
    public ResponseEntity<List<ReservaResponseDTO>> consultarReservasAtivasPorCracha(@PathVariable String matricula) {
        List<ReservaResponseDTO> reservas = reservaService.findReservasAtivasByMatricula(matricula);
        return ResponseEntity.ok(reservas);
    }

    /**
     * Dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        List<Item> itensDisponiveis = itemService.findDisponiveis();
        List<ReservaResponseDTO> todasReservas = reservaService.findAll();

        long reservasAtivas = todasReservas.stream()
                .filter(r -> r.dataDevolucao() == null)
                .count();

        Map<String, Object> dashboard = Map.of(
                "itensDisponiveis", itensDisponiveis.size(),
                "totalItens", itemService.findAll().size(),
                "reservasAtivas", reservasAtivas,
                "totalReservas", todasReservas.size()
        );

        return ResponseEntity.ok(dashboard);
    }
}
