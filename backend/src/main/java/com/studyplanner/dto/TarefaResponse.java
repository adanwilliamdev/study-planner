package com.studyplanner.dto;

import com.studyplanner.entity.Tarefa;
import java.time.LocalDate;

public record TarefaResponse(Long id, String titulo, String descricao, LocalDate dataEntrega,
                             Tarefa.Prioridade prioridade, Tarefa.StatusTarefa status,
                             MateriaResumo materia) {
    public static TarefaResponse de(Tarefa t) {
        return new TarefaResponse(t.getId(), t.getTitulo(), t.getDescricao(), t.getDataEntrega(),
                t.getPrioridade(), t.getStatus(), MateriaResumo.de(t.getMateria()));
    }
}
