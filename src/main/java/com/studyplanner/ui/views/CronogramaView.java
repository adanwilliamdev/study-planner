package com.studyplanner.ui.views;

import com.studyplanner.dto.CronogramaRequest;
import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.dto.MateriaResumo;
import com.studyplanner.service.CronogramaService;
import com.studyplanner.service.MateriaService;
import com.studyplanner.ui.MainLayout;
import com.studyplanner.ui.util.Confirmar;
import com.studyplanner.ui.util.Cores;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.util.Toasts;
import com.studyplanner.ui.util.ValidadorForm;
import com.studyplanner.ui.util.Vazio;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.timepicker.TimePicker;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.spring.security.AuthenticationContext;
import jakarta.annotation.security.PermitAll;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/** Semana de estudos: uma coluna por dia, com as sessoes recorrentes de cada materia. */
@Route(value = "cronograma", layout = MainLayout.class)
@PageTitle("Cronograma")
@PermitAll
public class CronogramaView extends Div {

    private final String email;
    private final CronogramaService cronograma;
    private final MateriaService materias;
    private final ValidadorForm validador;
    private final Clock relogio;

    private final Div resumo = new Div();
    private final Div semana = new Div();

    public CronogramaView(AuthenticationContext autenticacao, CronogramaService cronograma, MateriaService materias,
                          ValidadorForm validador, Clock relogio) {
        this.email = autenticacao.getPrincipalName().orElseThrow();
        this.cronograma = cronograma;
        this.materias = materias;
        this.validador = validador;
        this.relogio = relogio;
        addClassName("pagina");

        Button nova = new Button("Nova sessão", VaadinIcon.PLUS.create(), e -> abrirFormulario(null));
        nova.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        resumo.addClassName("cronograma__resumo");
        Div topo = new Div(resumo, nova);
        topo.addClassName("pagina__topo");

        semana.addClassName("semana");
        add(topo, semana);
        carregar();
    }

    private void carregar() {
        List<CronogramaResponse> sessoes = cronograma.listar(email);
        DayOfWeek hoje = LocalDate.now(relogio).getDayOfWeek();

        long feitas = sessoes.stream().filter(CronogramaResponse::concluida).count();
        resumo.removeAll();
        Span texto = new Span(sessoes.isEmpty()
                ? "Monte a sua semana de estudos: as sessões se repetem toda semana."
                : feitas + " de " + sessoes.size() + " sessões concluídas nesta semana");
        texto.addClassName("texto-mudo");
        resumo.add(texto);
        if (!sessoes.isEmpty()) {
            ProgressBar barra = new ProgressBar(0, 1, feitas / (double) sessoes.size());
            barra.setAriaLabel("Sessões concluídas na semana");
            barra.addClassName("cronograma__barra");
            resumo.add(barra);
        }

        semana.removeAll();
        if (sessoes.isEmpty()) {
            Button criar = new Button("Criar a primeira sessão", e -> abrirFormulario(null));
            criar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
            semana.add(Vazio.criar(VaadinIcon.CALENDAR_CLOCK, "Semana em branco",
                    "Cadastre as sessões de estudo de cada matéria e acompanhe o que já foi feito.", criar));
            return;
        }
        for (DayOfWeek dia : DayOfWeek.values()) {
            semana.add(criarDia(dia, dia == hoje, sessoes.stream().filter(s -> s.diaDaSemana() == dia).toList()));
        }
    }

    private Div criarDia(DayOfWeek dia, boolean ehHoje, List<CronogramaResponse> sessoes) {
        Span nome = new Span(Datas.nomeDia(dia));
        nome.addClassName("dia__nome");
        Button adicionar = new Button(VaadinIcon.PLUS.create(), e -> abrirFormulario(dia));
        adicionar.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL);
        adicionar.setAriaLabel("Adicionar sessão na " + Datas.nomeDia(dia));
        Div cabecalho = new Div(nome, adicionar);
        cabecalho.addClassName("dia__cabecalho");

        Div coluna = new Div(cabecalho);
        coluna.addClassName("dia");
        if (ehHoje) {
            coluna.addClassName("dia--hoje");
        }
        if (sessoes.isEmpty()) {
            Span livre = new Span("Livre");
            livre.addClassNames("texto-mudo", "dia__livre");
            coluna.add(livre);
        }
        sessoes.forEach(s -> coluna.add(criarSessao(s)));
        return coluna;
    }

    private Div criarSessao(CronogramaResponse s) {
        Span nome = new Span(s.materia().nome());
        nome.addClassName("sessao__nome");
        Span horas = new Span(Datas.hora(s.horarioInicio()) + " – " + Datas.hora(s.horarioFim()));
        horas.addClassNames("texto-mudo", "sessao__horas");
        Div texto = new Div(nome, horas);
        texto.addClassName("sessao__texto");

        Button concluir = new Button((s.concluida() ? VaadinIcon.ROTATE_LEFT : VaadinIcon.CHECK).create(), e -> {
            cronograma.alterarConclusao(s.id(), !s.concluida(), email);
            carregar();
        });
        concluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL);
        concluir.setAriaLabel((s.concluida() ? "Reabrir sessão de " : "Concluir sessão de ") + s.materia().nome());
        Button excluir = new Button(VaadinIcon.TRASH.create(), e -> Confirmar.exclusao("Excluir sessão",
                "Excluir a sessão de " + s.materia().nome() + " (" + Datas.nomeDia(s.diaDaSemana()) + ")?", () -> {
                    cronograma.deletar(s.id(), email);
                    Toasts.sucesso("Sessão excluída");
                    carregar();
                }));
        excluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL,
                ButtonVariant.LUMO_ERROR);
        excluir.setAriaLabel("Excluir sessão de " + s.materia().nome());
        Div acoes = new Div(concluir, excluir);
        acoes.addClassName("sessao__acoes");

        Div cartao = new Div(texto, acoes);
        cartao.addClassName("sessao");
        if (s.concluida()) {
            cartao.addClassName("sessao--feita");
        }
        cartao.getStyle().set("border-left-color", Cores.seguro(s.materia().cor()));
        return cartao;
    }

    private void abrirFormulario(DayOfWeek diaInicial) {
        List<MateriaResumo> itens = materias.listar(email).stream().map(MateriaResponse::resumo).toList();
        if (itens.isEmpty()) {
            Toasts.info("Cadastre uma matéria antes de montar o cronograma.");
            return;
        }

        Dialog dialogo = new Dialog();
        dialogo.setHeaderTitle("Nova sessão de estudo");
        dialogo.setWidth("440px");
        dialogo.setMaxWidth("96vw");

        Select<MateriaResumo> materia = new Select<>();
        materia.setLabel("Matéria");
        materia.setItems(itens);
        materia.setItemLabelGenerator(MateriaResumo::nome);
        materia.setWidthFull();

        Select<DayOfWeek> dia = new Select<>();
        dia.setLabel("Dia da semana");
        dia.setItems(DayOfWeek.values());
        dia.setItemLabelGenerator(Datas::nomeDia);
        dia.setValue(diaInicial != null ? diaInicial : LocalDate.now(relogio).getDayOfWeek());
        dia.setWidthFull();

        TimePicker inicio = new TimePicker("Início");
        inicio.setStep(Duration.ofMinutes(15));
        inicio.setLocale(Datas.PT_BR);
        inicio.setValue(LocalTime.of(19, 0));
        TimePicker fim = new TimePicker("Término");
        fim.setStep(Duration.ofMinutes(15));
        fim.setLocale(Datas.PT_BR);
        fim.setValue(LocalTime.of(20, 0));
        Div horarios = new Div(inicio, fim);
        horarios.addClassName("form-linha");

        Div form = new Div(materia, dia, horarios);
        form.addClassName("form-coluna");
        dialogo.add(form);

        Button cancelar = new Button("Cancelar", e -> dialogo.close());
        cancelar.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        Button salvar = new Button("Salvar", e -> {
            MateriaResumo m = materia.getValue();
            CronogramaRequest req = new CronogramaRequest(m == null ? null : m.id(), dia.getValue(),
                    inicio.getValue(), fim.getValue());
            if (!validador.validar(req, Map.of("materiaId", materia, "diaDaSemana", dia,
                    "horarioInicio", inicio, "horarioFim", fim))) {
                return;
            }
            cronograma.criar(req, email); // conflito de horario vira mensagem e o dialogo continua aberto
            dialogo.close();
            Toasts.sucesso("Sessão adicionada");
            carregar();
        });
        salvar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        dialogo.getFooter().add(cancelar, salvar);
        dialogo.open();
    }
}
