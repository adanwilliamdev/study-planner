package com.studyplanner.dto;

import com.studyplanner.entity.Cronograma;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record CronogramaResponse(Long id, DayOfWeek diaDaSemana, LocalTime horarioInicio, LocalTime horarioFim,
                                 Cronograma.StatusCronograma status, MateriaResumo materia) {
    public static CronogramaResponse de(Cronograma c) {
        return new CronogramaResponse(c.getId(), c.getDiaDaSemana(), c.getHorarioInicio(),
                c.getHorarioFim(), c.getStatus(), MateriaResumo.de(c.getMateria()));
    }
}
