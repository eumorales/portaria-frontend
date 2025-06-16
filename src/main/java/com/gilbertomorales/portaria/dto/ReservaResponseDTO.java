package com.gilbertomorales.portaria.dto;

import java.time.LocalDateTime;

public record ReservaResponseDTO(
    String id,
    String itemId,
    String nomeItem,
    String usuarioId,
    String nomeUsuario,
    String matriculaUsuario,
    LocalDateTime dataReserva,
    LocalDateTime dataRetirada,
    LocalDateTime dataDevolucao,
    String status // RESERVADO, RETIRADO, DEVOLVIDO
) {}
