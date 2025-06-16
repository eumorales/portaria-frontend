package com.gilbertomorales.portaria.dto;

import jakarta.validation.constraints.NotBlank;

public record ReservaRequestDTO(
    @NotBlank(message = "ID do item obrigatório")
    String itemId,
    
    @NotBlank(message = "Matrícula do usuário é obrigatória")
    String matriculaUsuario
) {}
