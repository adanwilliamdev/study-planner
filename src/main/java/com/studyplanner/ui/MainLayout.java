package com.studyplanner.ui;

import com.studyplanner.entity.Usuario;
import com.studyplanner.service.MateriaService;
import com.studyplanner.service.NotificacaoBroadcaster;
import com.studyplanner.service.NotificacaoService;
import com.studyplanner.service.PerfilService;
import com.studyplanner.service.PomodoroService;
import com.studyplanner.service.UsuarioAtualService;
import com.studyplanner.ui.componentes.NotificacoesBotao;
import com.studyplanner.ui.componentes.PomodoroPanel;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.views.CronogramaView;
import com.studyplanner.ui.views.DashboardView;
import com.studyplanner.ui.views.MateriasView;
import com.studyplanner.ui.views.TarefasView;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.applayout.DrawerToggle;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.Icon;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.sidenav.SideNav;
import com.vaadin.flow.component.sidenav.SideNavItem;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.spring.security.AuthenticationContext;
import com.vaadin.flow.theme.lumo.Lumo;
import org.springframework.scheduling.TaskScheduler;

/** Moldura do app: menu lateral (com Pomodoro), barra superior (titulo, sino e tema). */
public class MainLayout extends AppLayout {

    private final PerfilService perfil;
    private final String email;
    private final H1 titulo = new H1();
    private final Button botaoTema = new Button();
    private String temaAtual;

    public MainLayout(AuthenticationContext autenticacao, UsuarioAtualService usuarios, PerfilService perfil,
                      NotificacaoService notificacoes, NotificacaoBroadcaster broadcaster,
                      MateriaService materias, PomodoroService pomodoro, TaskScheduler agendador) {
        this.perfil = perfil;
        this.email = autenticacao.getPrincipalName().orElseThrow();
        Usuario usuario = usuarios.obter(email);

        UI.getCurrent().setLocale(Datas.PT_BR);
        aplicarTema(perfil.tema(email));

        setPrimarySection(Section.DRAWER);
        addToNavbar(criarBarra(notificacoes, broadcaster));
        addToDrawer(criarGaveta(usuario, autenticacao, materias, pomodoro, agendador));
    }

    private HorizontalLayout criarBarra(NotificacaoService notificacoes, NotificacaoBroadcaster broadcaster) {
        DrawerToggle alternarMenu = new DrawerToggle();
        alternarMenu.setAriaLabel("Abrir ou fechar o menu");
        titulo.addClassName("app-titulo");

        botaoTema.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_CONTRAST);
        botaoTema.addClickListener(e -> {
            aplicarTema(PerfilService.ESCURO.equals(temaAtual) ? PerfilService.CLARO : PerfilService.ESCURO);
            perfil.salvarTema(email, temaAtual);
        });

        HorizontalLayout barra = new HorizontalLayout(alternarMenu, titulo,
                new NotificacoesBotao(email, notificacoes, broadcaster), botaoTema);
        barra.setWidthFull();
        barra.setAlignItems(FlexComponent.Alignment.CENTER);
        barra.expand(titulo);
        barra.addClassName("app-barra");
        return barra;
    }

    private VerticalLayout criarGaveta(Usuario usuario, AuthenticationContext autenticacao, MateriaService materias,
                                       PomodoroService pomodoro, TaskScheduler agendador) {
        Span marcaNome = new Span("Study Planner");
        marcaNome.addClassName("marca__nome");
        Div marca = new Div(new Span(VaadinIcon.BOOK.create()), marcaNome);
        marca.addClassName("marca");

        SideNav menu = new SideNav();
        menu.addItem(
                new SideNavItem("Painel", DashboardView.class, VaadinIcon.DASHBOARD.create()),
                new SideNavItem("Matérias", MateriasView.class, VaadinIcon.BOOK.create()),
                new SideNavItem("Tarefas", TarefasView.class, VaadinIcon.TASKS.create()),
                new SideNavItem("Cronograma", CronogramaView.class, VaadinIcon.CALENDAR_CLOCK.create()));

        PomodoroPanel painelPomodoro = new PomodoroPanel(email, pomodoro, materias, agendador);

        Span nome = new Span(usuario.getNome());
        nome.addClassName("usuario__nome");
        Button sair = new Button("Sair", new Icon(VaadinIcon.SIGN_OUT), e -> autenticacao.logout());
        sair.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_SMALL);
        Div usuarioLinha = new Div(nome, sair);
        usuarioLinha.addClassName("usuario");

        VerticalLayout gaveta = new VerticalLayout(marca, menu, painelPomodoro, usuarioLinha);
        gaveta.setSizeFull();
        gaveta.setPadding(false);
        gaveta.setSpacing(false);
        gaveta.expand(menu);
        gaveta.addClassName("gaveta");
        return gaveta;
    }

    private void aplicarTema(String tema) {
        temaAtual = tema;
        var temas = UI.getCurrent().getElement().getThemeList();
        boolean escuro = PerfilService.ESCURO.equals(tema);
        if (escuro) {
            temas.add(Lumo.DARK);
        } else {
            temas.remove(Lumo.DARK);
        }
        botaoTema.setIcon(escuro ? VaadinIcon.SUN_O.create() : VaadinIcon.MOON_O.create());
        botaoTema.setAriaLabel(escuro ? "Usar tema claro" : "Usar tema escuro");
    }

    @Override
    protected void afterNavigation() {
        super.afterNavigation();
        PageTitle pagina = getContent() == null ? null : getContent().getClass().getAnnotation(PageTitle.class);
        titulo.setText(pagina == null ? "" : pagina.value());
    }
}
