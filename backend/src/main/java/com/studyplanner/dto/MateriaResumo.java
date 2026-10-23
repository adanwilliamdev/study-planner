package com.studyplanner.dto;

import com.studyplanner.entity.Materia;

/** Visao enxuta da materia, embutida em tarefas, cronogramas e materiais. */
public record MateriaResumo(Long id, String nome, String cor) {
    public static MateriaResumo de(Materia m) {
        return m == null ? null : new MateriaResumo(m.getId(), m.getNome(), m.getCor());
    }
}
