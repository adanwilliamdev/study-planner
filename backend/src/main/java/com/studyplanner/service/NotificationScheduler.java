package com.studyplanner.service;

import com.studyplanner.entity.Tarefa;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationScheduler {

    @Autowired private TarefaRepository tarefaRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 3600000)
    public void checkTarefasVencendo() {
        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);
        List<Tarefa> tarefas = tarefaRepository.findTarefasVencendo(hoje, amanha);
        for (Tarefa t : tarefas) {
            String msg = String.format("⚠️ Tarefa '%s' vence em %s", t.getTitulo(), t.getDataEntrega());
            messagingTemplate.convertAndSend("/topic/notifications", msg);
        }
    }
}