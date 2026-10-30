package com.studyplanner.ui.util;

import com.studyplanner.entity.MaterialEstudo.TipoMaterial;
import com.studyplanner.entity.Tarefa.Prioridade;
import com.studyplanner.entity.Tarefa.StatusTarefa;

/** Textos em portugues para os enums. */
public final class Rotulos {

    private Rotulos() {
    }

    public static String prioridade(Prioridade p) {
        return switch (p) {
            case ALTA -> "Alta";
            case MEDIA -> "Média";
            case BAIXA -> "Baixa";
        };
    }

    public static String status(StatusTarefa s) {
        return switch (s) {
            case A_FAZER -> "A fazer";
            case EM_ANDAMENTO -> "Em andamento";
            case CONCLUIDO -> "Concluída";
        };
    }

    public static String tipoMaterial(TipoMaterial t) {
        return switch (t) {
            case PDF -> "PDF";
            case LINK -> "Link";
            case RESUMO -> "Resumo";
        };
    }
}
