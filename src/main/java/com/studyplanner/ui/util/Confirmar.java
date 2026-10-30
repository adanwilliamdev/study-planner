package com.studyplanner.ui.util;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Paragraph;

public final class Confirmar {

    private Confirmar() {
    }

    /** Caixa de confirmacao para acoes destrutivas. */
    public static void exclusao(String titulo, String mensagem, Runnable aoConfirmar) {
        Dialog dialogo = new Dialog();
        dialogo.setHeaderTitle(titulo);
        Paragraph texto = new Paragraph(mensagem);
        texto.addClassName("dialogo-texto");
        dialogo.add(texto);

        Button cancelar = new Button("Cancelar", e -> dialogo.close());
        cancelar.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        Button excluir = new Button("Excluir", e -> {
            dialogo.close();
            aoConfirmar.run();
        });
        excluir.addThemeVariants(ButtonVariant.LUMO_PRIMARY, ButtonVariant.LUMO_ERROR);
        dialogo.getFooter().add(cancelar, excluir);
        dialogo.open();
    }
}
