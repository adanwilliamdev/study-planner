package com.studyplanner.dto;

import com.studyplanner.entity.Materia;

public record MateriaResponse(Long id, String nome, String cor, Integer cargaHoraria) {
    public static MateriaResponse de(Materia m) {
        return new MateriaResponse(m.getId(), m.getNome(), m.getCor(), m.getCargaHoraria());
    }
}
