package com.studyplanner.ui.views;

import com.studyplanner.ui.componentes.AuthShell;
import com.studyplanner.ui.util.Datas;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.login.LoginForm;
import com.vaadin.flow.component.login.LoginI18n;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Route("login")
@PageTitle("Entrar | Study Planner")
@AnonymousAllowed
public class LoginView extends Div implements BeforeEnterObserver {

    private final LoginForm formulario = new LoginForm();

    public LoginView() {
        UI.getCurrent().setLocale(Datas.PT_BR);
        setSizeFull();

        LoginI18n i18n = LoginI18n.createDefault();
        i18n.getForm().setTitle("Entrar");
        i18n.getForm().setUsername("E-mail");
        i18n.getForm().setPassword("Senha");
        i18n.getForm().setSubmit("Entrar");
        i18n.getErrorMessage().setTitle("Não foi possível entrar");
        i18n.getErrorMessage().setMessage(
                "Confira o e-mail e a senha. Após 5 tentativas erradas a conta fica bloqueada por 15 minutos.");
        formulario.setI18n(i18n);
        formulario.setAction("login"); // POST tratado pelo Spring Security
        formulario.setForgotPasswordButtonVisible(false);

        Span semConta = new Span("Ainda não tem conta? ");
        RouterLink cadastro = new RouterLink("Criar conta", CadastroView.class);
        Div rodape = new Div(semConta, cadastro);
        rodape.addClassName("auth__rodape");

        Div bloco = new Div(formulario, rodape);
        add(AuthShell.criar(bloco));
    }

    @Override
    public void beforeEnter(BeforeEnterEvent evento) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            evento.forwardTo(DashboardView.class); // ja esta logado
            return;
        }
        if (evento.getLocation().getQueryParameters().getParameters().containsKey("error")) {
            formulario.setError(true);
        }
    }
}
