package com.studyplanner.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Tarefas periodicas: alertas de prazo (de hora em hora) e virada semanal do cronograma. */
@Component
public class NotificationScheduler {

    private final AlertaVencimentoService alertas;
    private final NotificacaoService notificacoes;
    private final NotificacaoBroadcaster broadcaster;
    private final CronogramaService cronograma;

    public NotificationScheduler(AlertaVencimentoService alertas, NotificacaoService notificacoes,
                                 NotificacaoBroadcaster broadcaster, CronogramaService cronograma) {
        this.alertas = alertas;
        this.notificacoes = notificacoes;
        this.broadcaster = broadcaster;
        this.cronograma = cronograma;
    }

    @Scheduled(initialDelay = 30_000, fixedRate = 3_600_000)
    public void verificarPrazos() {
        // 1) grava (transacao propria)  2) so depois avisa quem esta online
        alertas.gerarAlertas().forEach(a -> broadcaster.enviar(a.email(), a.notificacao()));
        notificacoes.limparAntigas();
    }

    /** Segunda-feira, 00:05 no fuso da aplicacao: as sessoes da semana voltam a ficar pendentes. */
    @Scheduled(cron = "0 5 0 * * MON", zone = "${app.timezone}")
    public void reiniciarSemana() {
        cronograma.reiniciarSemana();
    }
}
