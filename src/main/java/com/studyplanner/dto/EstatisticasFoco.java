package com.studyplanner.dto;

import java.time.LocalDate;
import java.util.Map;

/** Resumo dos focos de Pomodoro. {@code ultimosDias} vai do dia mais antigo ate hoje. */
public record EstatisticasFoco(int hojeMin, int semanaMin, int sequenciaDias, Map<LocalDate, Integer> ultimosDias) {
}
