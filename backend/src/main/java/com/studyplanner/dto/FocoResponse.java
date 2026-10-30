package com.studyplanner.dto;

import com.studyplanner.entity.SessaoFoco;
import java.time.LocalDate;

public record FocoResponse(Long id, int minutos, LocalDate data, MateriaResumo materia) {
    public static FocoResponse de(SessaoFoco s) {
        return new FocoResponse(s.getId(), s.getMinutos(), s.getData(), MateriaResumo.de(s.getMateria()));
    }
}
