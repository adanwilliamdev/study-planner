package com.studyplanner.service;

import com.studyplanner.entity.Tarefa;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationScheduler {

    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TarefaRepository tarefaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationScheduler(TarefaRepository tarefaRepository, SimpMessagingTemplate messagingTemplate) {
        this.tarefaRepository = tarefaRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /** A cada hora avisa cada usuario (e somente ele) sobre tarefas que vencem hoje ou amanha. */
    @Scheduled(initialDelay = 30000, fixedRate = 3600000)
    @Transactional
    public void checkTarefasVencendo() {
        LocalDate hoje = LocalDate.now();
        List<Tarefa> tarefas = tarefaRepository.findTarefasVencendo(
                hoje, hoje.plusDays(1), Tarefa.StatusTarefa.CONCLUIDO);

        for (Tarefa t : tarefas) {
            String quando = t.getDataEntrega().equals(hoje) ? "vence hoje" : "vence amanhã";
            String msg = String.format("Tarefa \"%s\" %s (%s)", t.getTitulo(), quando,
                    t.getDataEntrega().format(FORMATO));
            // entregue apenas ao dono, em /user/queue/notifications
            messagingTemplate.convertAndSendToUser(t.getUsuario().getEmail(), "/queue/notifications", msg);
            t.setUltimaNotificacao(hoje);
        }
    }
}
