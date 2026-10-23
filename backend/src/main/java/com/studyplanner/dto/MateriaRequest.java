package com.studyplanner.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MateriaRequest(
        @NotBlank(message = "Informe o nome da matéria") @Size(max = 100, message = "Nome muito longo") String nome,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Cor inválida (use o formato #RRGGBB)") String cor,
        @Min(value = 0, message = "A carga horária não pode ser negativa") Integer cargaHoraria) {
}
