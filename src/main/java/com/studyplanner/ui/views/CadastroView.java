package com.studyplanner.ui.views;

import com.studyplanner.dto.RegisterRequest;
import com.studyplanner.service.AuthService;
import com.studyplanner.ui.componentes.AuthShell;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.util.Toasts;
import com.studyplanner.ui.util.ValidadorForm;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.server.auth.AnonymousAllowed;

import java.util.Map;

@Route("cadastro")
@PageTitle("Criar conta | Study Planner")
@AnonymousAllowed
public class CadastroView extends Div {

    private final TextField nome = new TextField("Nome");
    private final EmailField email = new EmailField("E-mail");
    private final PasswordField senha = new PasswordField("Senha (mín. 8 caracteres)");
    private final PasswordField confirmar = new PasswordField("Confirmar senha");

    public CadastroView(AuthService authService, ValidadorForm validador) {
        UI.getCurrent().setLocale(Datas.PT_BR);
        setSizeFull();

        nome.setMaxLength(100);
        email.setMaxLength(150);
        senha.setMaxLength(72);
        nome.setWidthFull();
        email.setWidthFull();
        senha.setWidthFull();
        confirmar.setWidthFull();

        Button criar = new Button("Criar conta");
        criar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        criar.setWidthFull();
        criar.addClickShortcut(com.vaadin.flow.component.Key.ENTER);
        criar.addClickListener(e -> {
            RegisterRequest req = new RegisterRequest(nome.getValue(), email.getValue(), senha.getValue());
            boolean ok = validador.validar(req, Map.of("nome", nome, "email", email, "senha", senha));
            if (!senha.getValue().equals(confirmar.getValue())) {
                confirmar.setErrorMessage("As senhas não conferem");
                confirmar.setInvalid(true);
                ok = false;
            } else {
                confirmar.setInvalid(false);
            }
            if (!ok) {
                return;
            }
            authService.registrar(req); // e-mail repetido vira mensagem na tela (ErrosVaadinInit)
            Toasts.sucesso("Conta criada! Entre com seu e-mail e senha.");
            UI.getCurrent().navigate(LoginView.class);
        });

        H2 titulo = new H2("Criar conta");
        titulo.addClassName("auth__titulo");
        VerticalLayout form = new VerticalLayout(titulo, nome, email, senha, confirmar, criar);
        form.setPadding(false);

        Div rodape = new Div(new Span("Já tem conta? "), new RouterLink("Entrar", LoginView.class));
        rodape.addClassName("auth__rodape");

        add(AuthShell.criar(new Div(form, rodape)));
    }
}
