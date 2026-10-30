package com.studyplanner.ui.util;

import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;

/** Mensagens rapidas no canto da tela. */
public final class Toasts {

    private Toasts() {
    }

    public static void sucesso(String mensagem) {
        mostrar(mensagem, NotificationVariant.LUMO_SUCCESS);
    }

    public static void erro(String mensagem) {
        mostrar(mensagem, NotificationVariant.LUMO_ERROR);
    }

    public static void info(String mensagem) {
        mostrar(mensagem, NotificationVariant.LUMO_PRIMARY);
    }

    private static void mostrar(String mensagem, NotificationVariant variante) {
        Notification n = Notification.show(mensagem, 4000, Notification.Position.BOTTOM_END);
        n.addThemeVariants(variante);
    }
}
