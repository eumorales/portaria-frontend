package com.gilbertomorales.portaria.controller;

import com.gilbertomorales.portaria.dto.ReservaRequestDTO;
import com.gilbertomorales.portaria.dto.ReservaResponseDTO;
import com.gilbertomorales.portaria.dto.RetiradaDevolucaoDTO;
import com.gilbertomorales.portaria.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaResponseDTO>> getAllReservas() {
        List<ReservaResponseDTO> reservas = reservaService.findAll();
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ReservaResponseDTO>> getReservasByItem(@PathVariable String itemId) {
        List<ReservaResponseDTO> reservas = reservaService.findByItemId(itemId);
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/usuario/matricula/{matricula}")
    public ResponseEntity<List<ReservaResponseDTO>> getReservasByMatricula(@PathVariable String matricula) {
        List<ReservaResponseDTO> reservas = reservaService.findByMatricula(matricula);
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/ativas/matricula/{matricula}")
    public ResponseEntity<List<ReservaResponseDTO>> getReservasAtivasByMatricula(@PathVariable String matricula) {
        List<ReservaResponseDTO> reservas = reservaService.findReservasAtivasByMatricula(matricula);
        return ResponseEntity.ok(reservas);
    }

    @PostMapping
    public ResponseEntity<ReservaResponseDTO> criarReserva(@Valid @RequestBody ReservaRequestDTO request) {
        try {
            ReservaResponseDTO reserva = reservaService.criarReserva(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{reservaId}/retirada")
    public ResponseEntity<ReservaResponseDTO> registrarRetirada(
            @PathVariable String reservaId,
            @Valid @RequestBody RetiradaDevolucaoDTO request) {
        try {
            ReservaResponseDTO reserva = reservaService.registrarRetirada(reservaId, request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{reservaId}/devolucao")
    public ResponseEntity<ReservaResponseDTO> registrarDevolucao(
            @PathVariable String reservaId,
            @Valid @RequestBody RetiradaDevolucaoDTO request) {
        try {
            ReservaResponseDTO reserva = reservaService.registrarDevolucao(reservaId, request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
