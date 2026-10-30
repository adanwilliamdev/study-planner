package com.studyplanner.ui.componentes;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;

/** Moldura das telas de login e cadastro: painel de marca de um lado, formulario do outro. */
public final class AuthShell {

    private AuthShell() {
    }

    public static Div criar(Component formulario) {
        Span marca = new Span(VaadinIcon.BOOK.create(), new Span("Study Planner"));
        marca.addClassName("auth__logo");

        H2 chamada = new H2("Estude com ritmo, não na correria.");
        chamada.addClassName("auth__chamada");
        Paragraph texto = new Paragraph(
                "Matérias, tarefas com prazo, cronograma semanal e um Pomodoro que registra o seu foco. Tudo num lugar só.");
        texto.addClassName("auth__texto");

        Div lateral = new Div(marca, chamada, texto);
        lateral.addClassName("auth__lateral");

        Div conteudo = new Div(formulario);
        conteudo.addClassName("auth__form");

        Div raiz = new Div(lateral, conteudo);
        raiz.addClassName("auth");
        return raiz;
    }
}
