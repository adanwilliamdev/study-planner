package com.studyplanner.dto;

import com.studyplanner.entity.MaterialEstudo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MaterialRequest(
        @NotNull(message = "Selecione a matéria") Long materiaId,
        @NotBlank(message = "Informe o título") @Size(max = 150, message = "Título muito longo") String titulo,
        @NotNull(message = "Informe o tipo do material") MaterialEstudo.TipoMaterial tipo,
        @Size(max = 1000, message = "Conteúdo muito longo") String urlOuCaminho) {
}
