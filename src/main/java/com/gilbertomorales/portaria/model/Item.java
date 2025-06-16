package com.gilbertomorales.portaria.model;

import com.gilbertomorales.portaria.model.enums.TipoItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "items")
public class Item {

    @Id
    private String id;

    @NotBlank(message = "Nome do item é obrigatório")
    private String nome;

    @NotNull(message = "Tipo do item é obrigatório")
    private TipoItem tipo;

    @NotNull(message = "Status de disponibilidade é obrigatório")
    private Boolean disponivel = true;

    @NotBlank(message = "Localização é obrigatória")
    private String localizacao;
}
