package com.studyplanner.service;

import com.studyplanner.dto.NotificacaoResponse;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Gera (e grava) um alerta para cada tarefa aberta que vence hoje ou amanha.
 * Como o alerta fica no banco, quem estava offline o encontra ao entrar.
 */
@Service
public class AlertaVencimentoService {

    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public record Alerta(String email, NotificacaoResponse notificacao) {
    }

    private final TarefaRepository tarefaRepository;
    private final NotificacaoService notificacaoService;
    private final Clock clock;

    public AlertaVencimentoService(TarefaRepository tarefaRepository, NotificacaoService notificacaoService,
                                   Clock clock) {
        this.tarefaRepository = tarefaRepository;
        this.notificacaoService = notificacaoService;
        this.clock = clock;
    }

    @Transactional
    public List<Alerta> gerarAlertas() {
        LocalDate hoje = LocalDate.now(clock);
        List<Alerta> alertas = new ArrayList<>();
        for (Tarefa t : tarefaRepository.findTarefasVencendo(hoje, hoje.plusDays(1), Tarefa.StatusTarefa.CONCLUIDO)) {
            String quando = t.getDataEntrega().equals(hoje) ? "vence hoje" : "vence amanhã";
            String mensagem = String.format("Tarefa \"%s\" %s (%s)", t.getTitulo(), quando,
                    t.getDataEntrega().format(FORMATO));
            NotificacaoResponse n = notificacaoService.criar(t.getUsuario(), mensagem);
            t.setUltimaNotificacao(hoje);
            alertas.add(new Alerta(t.getUsuario().getEmail(), n));
        }
        return alertas;
    }
}
