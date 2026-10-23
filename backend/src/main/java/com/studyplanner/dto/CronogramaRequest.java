package com.studyplanner.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record CronogramaRequest(
        @NotNull(message = "Selecione a matéria") Long materiaId,
        @NotNull(message = "Selecione o dia da semana") DayOfWeek diaDaSemana,
        @NotNull(message = "Informe o horário de início") LocalTime horarioInicio,
        @NotNull(message = "Informe o horário de término") LocalTime horarioFim) {
}
