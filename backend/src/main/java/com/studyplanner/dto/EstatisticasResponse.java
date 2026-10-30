package com.studyplanner.dto;

import java.time.LocalDate;
import java.util.List;

/** Resumo de produtividade. Os minutos de foco e as tarefas concluidas cobrem o periodo pedido. */
public record EstatisticasResponse(
        int periodoDias,
        int focoHojeMin,
        int focoPeriodoMin,
        long focoTotalMin,
        int sessoesFocoPeriodo,
        int sequenciaDias,
        int tarefasConcluidasPeriodo,
        int tarefasAbertas,
        int tarefasAtrasadas,
        int sessoesPlanejadasSemana,
        int sessoesConcluidasSemana,
        List<Dia> porDia,
        List<PorMateria> porMateria) {

    public record Dia(LocalDate data, int focoMin, int tarefasConcluidas) {}

    /** materiaId nulo = foco sem materia. */
    public record PorMateria(Long materiaId, String nome, String cor, int focoMin) {}
}
