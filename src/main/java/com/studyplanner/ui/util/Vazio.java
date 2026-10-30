package com.studyplanner.ui.util;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;

/** Estado vazio: icone, titulo, explicacao e (opcionalmente) uma acao. */
public final class Vazio {

    private Vazio() {
    }

    public static Div criar(VaadinIcon icone, String titulo, String texto, Component acao) {
        Div div = new Div();
        div.addClassName("vazio");
        Span icon = new Span(icone.create());
        icon.addClassName("vazio__icone");
        Span t = new Span(titulo);
        t.addClassName("vazio__titulo");
        Paragraph p = new Paragraph(texto);
        p.addClassName("vazio__texto");
        div.add(icon, t, p);
        if (acao != null) {
            div.add(acao);
        }
        return div;
    }
}
