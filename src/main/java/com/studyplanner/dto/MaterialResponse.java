package com.studyplanner.dto;

import com.studyplanner.entity.MaterialEstudo;

public record MaterialResponse(Long id, String titulo, MaterialEstudo.TipoMaterial tipo,
                               String urlOuCaminho, MateriaResumo materia) {
    public static MaterialResponse de(MaterialEstudo m) {
        return new MaterialResponse(m.getId(), m.getTitulo(), m.getTipo(), m.getUrlOuCaminho(),
                MateriaResumo.de(m.getMateria()));
    }
}
