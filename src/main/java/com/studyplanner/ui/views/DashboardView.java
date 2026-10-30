package com.studyplanner.ui.views;

import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.dto.DashboardResponse;
import com.studyplanner.dto.DashboardResponse.ProgressoMateria;
import com.studyplanner.dto.EstatisticasFoco;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.service.DashboardService;
import com.studyplanner.service.UsuarioAtualService;
import com.studyplanner.ui.MainLayout;
import com.studyplanner.ui.util.Chips;
import com.studyplanner.ui.util.Cores;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.util.Vazio;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.spring.security.AuthenticationContext;
import jakarta.annotation.security.PermitAll;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Route(value = "", layout = MainLayout.class)
@PageTitle("Painel")
@PermitAll
public class DashboardView extends Div {

    public DashboardView(AuthenticationContext autenticacao, DashboardService servico,
                         UsuarioAtualService usuarios, Clock relogio) {
        addClassName("pagina");
        String email = autenticacao.getPrincipalName().orElseThrow();
        DashboardResponse d = servico.resumo(email);
        LocalDate hoje = LocalDate.now(relogio);
        LocalTime agora = LocalTime.now(relogio);

        String primeiroNome = usuarios.obter(email).getNome().trim().split("\\s+")[0];
        H2 saudacao = new H2("Olá, " + primeiroNome);
        saudacao.addClassName("dash__saudacao");
        Span data = new Span(Datas.extenso(hoje));
        data.addClassName("texto-mudo");
        Div cabecalho = new Div(saudacao, data);
        cabecalho.addClassName("dash__cabecalho");

        Div kpis = new Div(
                kpi(String.valueOf(d.tarefasAbertas()), "tarefas abertas", null),
                kpi(String.valueOf(d.vencemHoje()), "vencem hoje", d.vencemHoje() > 0 ? "kpi--aviso" : null),
                kpi(String.valueOf(d.atrasadas()), "atrasadas", d.atrasadas() > 0 ? "kpi--ruim" : null),
                kpi(Datas.duracao(d.foco().hojeMin()), "de foco hoje", null));
        kpis.addClassName("dash__kpis");

        Div grade = new Div(painelProgresso(d), painelPrazos(d, hoje), painelHoje(d, agora), painelFoco(d.foco()));
        grade.addClassName("dash__grade");

        add(cabecalho, kpis, grade);
    }

    private static Div kpi(String valor, String rotulo, String extra) {
        Span v = new Span(valor);
        v.addClassName("kpi__valor");
        Span r = new Span(rotulo);
        r.addClassName("kpi__rotulo");
        Div div = new Div(v, r);
        div.addClassName("kpi");
        if (extra != null) {
            div.addClassName(extra);
        }
        return div;
    }

    private static Div painel(String titulo, Component... conteudo) {
        H2 t = new H2(titulo);
        t.addClassName("painel__titulo");
        Div div = new Div(t);
        div.addClassName("painel");
        div.add(conteudo);
        return div;
    }

    private Div painelProgresso(DashboardResponse d) {
        Span legenda = new Span(d.tarefasConcluidas() + " de " + d.totalTarefas() + " tarefas concluídas ("
                + d.percentualConcluido() + "%)");
        legenda.addClassName("texto-mudo");
        ProgressBar geral = new ProgressBar(0, 1, d.percentualConcluido() / 100.0);
        geral.setAriaLabel("Progresso geral das tarefas");

        Div painel = painel("Progresso", legenda, geral);
        if (d.totalTarefas() == 0) {
            painel.add(Vazio.criar(VaadinIcon.TASKS, "Nenhuma tarefa ainda",
                    "Crie tarefas para acompanhar o seu progresso.", new RouterLink("Ir para tarefas", TarefasView.class)));
            return painel;
        }
        for (ProgressoMateria p : d.progresso()) {
            ProgressBar barra = new ProgressBar(0, 1, p.percentual() / 100.0);
            barra.getStyle().set("--progresso-cor", Cores.seguro(p.materia().cor()));
            barra.addClassName("progresso-materia__barra");
            barra.setAriaLabel("Progresso em " + p.materia().nome());
            Span contagem = new Span(p.concluidas() + "/" + p.total());
            contagem.addClassName("texto-mudo");
            Div linha = new Div(Chips.materia(p.materia()), contagem);
            linha.addClassName("progresso-materia__linha");
            Div bloco = new Div(linha, barra);
            bloco.addClassName("progresso-materia");
            painel.add(bloco);
        }
        return painel;
    }

    private Div painelPrazos(DashboardResponse d, LocalDate hoje) {
        Div painel = painel("Próximos prazos");
        if (d.proximasTarefas().isEmpty()) {
            painel.add(Vazio.criar(VaadinIcon.CHECK_CIRCLE_O, "Sem prazos à vista",
                    "Nenhuma tarefa aberta com data de entrega.", null));
            return painel;
        }
        Div lista = new Div();
        lista.addClassName("lista");
        for (TarefaResponse t : d.proximasTarefas()) {
            Span titulo = new Span(t.titulo());
            titulo.addClassName("item__titulo");
            Div corpo = new Div(titulo);
            corpo.addClassName("item__corpo");
            if (t.materia() != null) {
                corpo.add(Chips.materia(t.materia()));
            }
            Div item = new Div(corpo, Chips.prazo(Datas.prazo(t.dataEntrega(), hoje)));
            item.addClassName("item");
            lista.add(item);
        }
        painel.add(lista);
        return painel;
    }

    private Div painelHoje(DashboardResponse d, LocalTime agora) {
        Div painel = painel("Hoje no cronograma");
        if (d.sessoesHoje().isEmpty()) {
            painel.add(Vazio.criar(VaadinIcon.CALENDAR_CLOCK, "Dia livre",
                    "Nenhuma sessão de estudo marcada para hoje.", new RouterLink("Abrir cronograma", CronogramaView.class)));
            return painel;
        }
        Div lista = new Div();
        lista.addClassName("lista");
        for (CronogramaResponse c : d.sessoesHoje()) {
            boolean emCurso = !c.concluida() && !agora.isBefore(c.horarioInicio()) && agora.isBefore(c.horarioFim());
            Span horas = new Span(Datas.hora(c.horarioInicio()) + " – " + Datas.hora(c.horarioFim()));
            horas.addClassName("item__horas");
            Span nome = new Span(c.materia().nome());
            nome.addClassName("item__titulo");
            if (c.concluida()) {
                nome.addClassName("item__titulo--feito");
            }
            Div corpo = new Div(horas, nome);
            corpo.addClassName("item__corpo");
            Div item = new Div(corpo);
            item.addClassName("item");
            item.getStyle().set("border-left", "4px solid " + Cores.seguro(c.materia().cor()));
            if (c.concluida()) {
                item.add(Chips.chip("Concluída", "chip--ok"));
            } else if (emCurso) {
                item.add(Chips.chip("Agora", "chip--marca"));
            }
            lista.add(item);
        }
        painel.add(lista);
        return painel;
    }

    private Div painelFoco(EstatisticasFoco f) {
        Div painel = painel("Foco nos últimos 7 dias");
        int maximo = f.ultimosDias().values().stream().mapToInt(Integer::intValue).max().orElse(0);

        Div grafico = new Div();
        grafico.addClassName("grafico");
        for (Map.Entry<LocalDate, Integer> e : f.ultimosDias().entrySet()) {
            int pct = maximo == 0 ? 0 : Math.max(e.getValue() > 0 ? 6 : 0, (int) Math.round(e.getValue() * 100.0 / maximo));
            Div preenchimento = new Div();
            preenchimento.addClassName("grafico__preenchimento");
            preenchimento.getStyle().set("height", pct + "%");
            Div trilho = new Div(preenchimento);
            trilho.addClassName("grafico__trilho");
            Span rotulo = new Span(Datas.diaCurto(e.getKey()));
            rotulo.addClassName("grafico__rotulo");
            Div coluna = new Div(trilho, rotulo);
            coluna.addClassName("grafico__coluna");
            coluna.getElement().setAttribute("title", Datas.data(e.getKey()) + ": " + Datas.duracao(e.getValue()));
            grafico.add(coluna);
        }

        Paragraph resumo = new Paragraph(Datas.duracao(f.semanaMin()) + " de foco na semana · sequência de "
                + f.sequenciaDias() + (f.sequenciaDias() == 1 ? " dia" : " dias"));
        resumo.addClassName("texto-mudo");
        painel.add(grafico, resumo);
        if (f.semanaMin() == 0) {
            Paragraph dica = new Paragraph("Inicie um Pomodoro no menu lateral: cada foco concluído aparece aqui.");
            dica.addClassName("texto-mudo");
            painel.add(dica);
        }
        return painel;
    }
}
