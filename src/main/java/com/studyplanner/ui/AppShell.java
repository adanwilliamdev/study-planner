package com.studyplanner.ui;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.component.page.Push;
import com.vaadin.flow.theme.Theme;

/**
 * Configuracao global da interface: tema (pasta frontend/themes/studyplanner)
 * e server push, usado para notificacoes em tempo real e para o timer do Pomodoro.
 */
@Push
@Theme("studyplanner")
public class AppShell implements AppShellConfigurator {
}
