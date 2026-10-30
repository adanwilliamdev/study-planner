package com.studyplanner.ui.util;

import com.studyplanner.dto.MateriaResumo;
import com.studyplanner.entity.Tarefa.Prioridade;
import com.studyplanner.entity.Tarefa.StatusTarefa;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;

/** Etiquetas pequenas reaproveitadas nas telas (as cores ficam no CSS do tema). */
public final class Chips {

    private Chips() {
    }

    public static Span chip(String texto, String classeTom) {
        Span s = new Span(texto);
        s.addClassNames("chip", classeTom);
        return s;
    }

    public static Span prazo(Datas.Prazo prazo) {
        return chip(prazo.texto(), prazo.tom().classeCss());
    }

    public static Span prioridade(Prioridade p) {
        String tom = switch (p) {
            case ALTA -> "chip--ruim";
            case MEDIA -> "chip--aviso";
            case BAIXA -> "chip--neutro";
        };
        return chip(Rotulos.prioridade(p), tom);
    }

    public static Span status(StatusTarefa s) {
        String tom = switch (s) {
            case A_FAZER -> "chip--neutro";
            case EM_ANDAMENTO -> "chip--marca";
            case CONCLUIDO -> "chip--ok";
        };
        return chip(Rotulos.status(s), tom);
    }

    /** Bolinha colorida + nome da materia. */
    public static Div materia(MateriaResumo m) {
        Span ponto = new Span();
        ponto.addClassName("chip-materia__ponto");
        ponto.getStyle().set("background-color", Cores.seguro(m.cor()));
        Span nome = new Span(m.nome());
        nome.addClassName("chip-materia__nome");
        Div div = new Div(ponto, nome);
        div.addClassName("chip-materia");
        return div;
    }
}
