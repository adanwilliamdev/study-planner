package com.studyplanner.dto;

import com.studyplanner.entity.Tarefa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TarefaRequest(
        @NotBlank(message = "Informe o título da tarefa") @Size(max = 150, message = "Título muito longo") String titulo,
        @Size(max = 1000, message = "Descrição muito longa") String descricao,
        LocalDate dataEntrega,
        Tarefa.Prioridade prioridade,
        Tarefa.StatusTarefa status,
        Long materiaId) {
}
