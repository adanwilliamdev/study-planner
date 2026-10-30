package com.studyplanner.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FocoRequest(
        @NotNull(message = "Informe a duração do foco")
        @Min(value = 1, message = "A duração mínima é 1 minuto")
        @Max(value = 180, message = "A duração máxima é 180 minutos") Integer minutos,
        Long materiaId) {
}
