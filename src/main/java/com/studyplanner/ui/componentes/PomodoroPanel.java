package com.studyplanner.ui.componentes;

import com.studyplanner.dto.MateriaResumo;
import com.studyplanner.service.MateriaService;
import com.studyplanner.service.PomodoroService;
import com.studyplanner.ui.util.Toasts;
import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.DetachEvent;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.UIDetachedException;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.tabs.Tab;
import com.vaadin.flow.component.tabs.Tabs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ScheduledFuture;

/**
 * Timer Pomodoro 100% em Java: o servidor conta o tempo e empurra o relogio para a tela (server push).
 * Fica no menu lateral, entao continua rodando enquanto o usuario navega entre as paginas.
 * Cada foco concluido e gravado e alimenta as estatisticas do painel.
 */
public class PomodoroPanel extends Div {

    private static final Logger log = LoggerFactory.getLogger(PomodoroPanel.class);
    private static final int FOCOS_ATE_PAUSA_LONGA = 4;

    private enum Modo {
        FOCO("Foco", 25), PAUSA("Pausa", 5), LONGA("Longa", 15);

        private final String rotulo;
        private final int minutos;

        Modo(String rotulo, int minutos) {
            this.rotulo = rotulo;
            this.minutos = minutos;
        }

        long milissegundos() {
            return minutos * 60_000L;
        }
    }

    private final String email;
    private final PomodoroService pomodoro;
    private final MateriaService materias;
    private final TaskScheduler agendador;

    private final Map<Modo, Tab> abas = new EnumMap<>(Modo.class);
    private final Tabs seletorDeModo = new Tabs();
    private final Span relogio = new Span();
    private final ProgressBar barra = new ProgressBar(0, 1, 0);
    private final Button iniciar = new Button();
    private final Select<MateriaResumo> materia = new Select<>();
    private final Div pontos = new Div();

    private Modo modo = Modo.FOCO;
    private long restanteMs = Modo.FOCO.milissegundos();
    private boolean ativo;
    private Instant fimEm;
    private int focosConcluidos;
    private ScheduledFuture<?> tarefa;
    private UI ui;

    public PomodoroPanel(String email, PomodoroService pomodoro, MateriaService materias, TaskScheduler agendador) {
        this.email = email;
        this.pomodoro = pomodoro;
        this.materias = materias;
        this.agendador = agendador;
        addClassName("pomodoro");

        for (Modo m : Modo.values()) {
            Tab aba = new Tab(m.rotulo);
            abas.put(m, aba);
            seletorDeModo.add(aba);
        }
        seletorDeModo.addClassName("pomodoro__modos");
        seletorDeModo.addSelectedChangeListener(e -> {
            if (e.isFromClient()) {
                irPara(modoDaAba(e.getSelectedTab()));
            }
        });

        relogio.addClassName("pomodoro__relogio");
        relogio.getElement().setAttribute("role", "timer");
        barra.addClassName("pomodoro__barra");

        materia.setPlaceholder("Matéria (opcional)");
        materia.setEmptySelectionAllowed(true);
        materia.setItemLabelGenerator(MateriaResumo::nome);
        materia.addClassName("pomodoro__materia");
        materia.setWidthFull();

        iniciar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        iniciar.addClassName("pomodoro__iniciar");
        iniciar.addClickListener(e -> alternar());

        Button reiniciar = new Button(VaadinIcon.REFRESH.create(), e -> irPara(modo));
        reiniciar.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON);
        reiniciar.setAriaLabel("Reiniciar");
        reiniciar.addClassName("pomodoro__aux");

        Button pular = new Button(VaadinIcon.STEP_FORWARD.create(), e -> irPara(modo == Modo.FOCO ? Modo.PAUSA : Modo.FOCO));
        pular.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON);
        pular.setAriaLabel("Pular para a próxima etapa"); // pular nao conta como foco
        pular.addClassName("pomodoro__aux");

        Div controles = new Div(iniciar, reiniciar, pular);
        controles.addClassName("pomodoro__controles");
        pontos.addClassName("pomodoro__ciclos");

        add(seletorDeModo, relogio, barra, materia, controles, pontos);
        render();
    }

    @Override
    protected void onAttach(AttachEvent evento) {
        ui = evento.getUI();
        List<MateriaResumo> itens = new ArrayList<>();
        materias.listar(email).forEach(m -> itens.add(m.resumo()));
        MateriaResumo escolhida = materia.getValue();
        materia.setItems(itens);
        if (escolhida != null) {
            itens.stream().filter(m -> m.id().equals(escolhida.id())).findFirst().ifPresent(materia::setValue);
        }
    }

    @Override
    protected void onDetach(DetachEvent evento) {
        cancelarTick();
    }

    // ---------- controle do timer ----------

    private void alternar() {
        if (ativo) {
            pausar();
        } else {
            iniciar();
        }
    }

    private void iniciar() {
        fimEm = Instant.now().plusMillis(restanteMs);
        ativo = true;
        UI alvo = ui;
        tarefa = agendador.scheduleAtFixedRate(() -> {
            try {
                alvo.access(this::tick);
            } catch (UIDetachedException ex) {
                cancelarTick();
            }
        }, Duration.ofSeconds(1));
        render();
    }

    private void pausar() {
        restanteMs = Math.max(0, Duration.between(Instant.now(), fimEm).toMillis());
        ativo = false;
        cancelarTick();
        render();
    }

    private void irPara(Modo novo) {
        cancelarTick();
        ativo = false;
        modo = novo;
        restanteMs = novo.milissegundos();
        render();
    }

    private void tick() {
        if (!ativo) {
            return;
        }
        long restante = Duration.between(Instant.now(), fimEm).toMillis();
        if (restante <= 0) {
            concluir();
        } else {
            restanteMs = restante;
            render();
        }
    }

    private void concluir() {
        cancelarTick();
        ativo = false;
        if (modo == Modo.FOCO) {
            try {
                MateriaResumo m = materia.getValue();
                pomodoro.registrarFoco(email, m == null ? null : m.id(), Modo.FOCO.minutos);
            } catch (RuntimeException ex) {
                log.warn("Não foi possível gravar o foco: {}", ex.getMessage());
                Toasts.erro("O foco terminou, mas não foi possível salvá-lo no histórico.");
            }
            focosConcluidos++;
            Toasts.sucesso("Foco concluído! Hora de descansar.");
            irPara(focosConcluidos % FOCOS_ATE_PAUSA_LONGA == 0 ? Modo.LONGA : Modo.PAUSA);
        } else {
            Toasts.info("Pausa encerrada. Vamos focar?");
            irPara(Modo.FOCO);
        }
    }

    private void cancelarTick() {
        if (tarefa != null) {
            tarefa.cancel(false);
            tarefa = null;
        }
    }

    // ---------- tela ----------

    private Modo modoDaAba(Tab aba) {
        return abas.entrySet().stream().filter(e -> e.getValue() == aba).map(Map.Entry::getKey)
                .findFirst().orElse(Modo.FOCO);
    }

    private void render() {
        long total = modo.milissegundos();
        long segundos = (long) Math.ceil(restanteMs / 1000.0);
        relogio.setText(String.format("%02d:%02d", segundos / 60, segundos % 60));
        barra.setValue(Math.min(1.0, Math.max(0.0, 1.0 - restanteMs / (double) total)));

        seletorDeModo.setSelectedTab(abas.get(modo));
        getElement().setAttribute("modo", modo == Modo.FOCO ? "foco" : "pausa");
        materia.setVisible(modo == Modo.FOCO);

        if (ativo) {
            iniciar.setText("Pausar");
            iniciar.setIcon(VaadinIcon.PAUSE.create());
        } else {
            iniciar.setText(restanteMs < total ? "Continuar" : "Iniciar");
            iniciar.setIcon(VaadinIcon.PLAY.create());
        }

        pontos.removeAll();
        int noCiclo = focosConcluidos % FOCOS_ATE_PAUSA_LONGA;
        for (int i = 0; i < FOCOS_ATE_PAUSA_LONGA; i++) {
            Span ponto = new Span();
            ponto.addClassName("pomodoro__ponto");
            if (i < noCiclo) {
                ponto.addClassName("pomodoro__ponto--cheio");
            }
            pontos.add(ponto);
        }
        pontos.getElement().setAttribute("title", focosConcluidos + " foco(s) nesta visita");
    }
}
