package com.gilbertomorales.portaria.dto;

import jakarta.validation.constraints.NotBlank;

public record RetiradaDevolucaoDTO(
    @NotBlank(message = "Matrícula do usuário é obrigatória")
    String matriculaUsuario
) {}
