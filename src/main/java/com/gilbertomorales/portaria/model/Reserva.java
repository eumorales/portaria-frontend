package com.gilbertomorales.portaria.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reservas")
public class Reserva {

    @Id
    private String id;

    @NotBlank(message = "ID do item é obrigatório")
    private String itemId;

    @NotBlank(message = "ID do usuário é obrigatório")
    private String usuarioId;

    @NotNull(message = "Data da reserva é obrigatória")
    private LocalDateTime dataReserva;

    private LocalDateTime dataRetirada;

    private LocalDateTime dataDevolucao;

    private String nomeItem;
    private String nomeUsuario;
    private String matriculaUsuario;
}
