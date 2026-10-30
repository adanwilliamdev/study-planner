package com.studyplanner.dto;

import java.util.List;

public record DashboardResponse(
        long tarefasAbertas,
        long tarefasConcluidas,
        long atrasadas,
        long vencemHoje,
        List<TarefaResponse> proximasTarefas,
        List<CronogramaResponse> sessoesHoje,
        List<ProgressoMateria> progresso,
        EstatisticasFoco foco) {

    public record ProgressoMateria(MateriaResumo materia, long total, long concluidas) {
        public int percentual() {
            return total == 0 ? 0 : (int) Math.round(concluidas * 100.0 / total);
        }
    }

    public long totalTarefas() {
        return tarefasAbertas + tarefasConcluidas;
    }

    public int percentualConcluido() {
        long total = totalTarefas();
        return total == 0 ? 0 : (int) Math.round(tarefasConcluidas * 100.0 / total);
    }
}
