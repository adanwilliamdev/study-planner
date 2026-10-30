package com.studyplanner.service;

import com.studyplanner.dto.NotificacaoResponse;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.entity.Tarefa.StatusTarefa;
import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.TarefaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertaVencimentoServiceTest {

    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");
    // 30/10/2026 23:30 em Sao Paulo = 31/10 02:30 UTC: "hoje" deve seguir o fuso da aplicacao
    private final Clock relogio = Clock.fixed(Instant.parse("2026-10-31T02:30:00Z"), SAO_PAULO);
    private final LocalDate hoje = LocalDate.of(2026, 10, 30);

    @Mock TarefaRepository tarefaRepository;
    @Mock NotificacaoService notificacaoService;

    @Test
    void geraAlertaGravadoEMarcaATarefa() {
        Usuario ana = Usuario.builder().id(1L).email("ana@exemplo.com").build();
        Tarefa amanha = Tarefa.builder().id(1L).titulo("Lista 3").usuario(ana)
                .dataEntrega(hoje.plusDays(1)).status(StatusTarefa.A_FAZER).build();
        when(tarefaRepository.findTarefasVencendo(hoje, hoje.plusDays(1), StatusTarefa.CONCLUIDO))
                .thenReturn(List.of(amanha));
        when(notificacaoService.criar(eq(ana), anyString())).thenAnswer(inv ->
                new NotificacaoResponse(7L, inv.getArgument(1), LocalDateTime.now(relogio), false));

        AlertaVencimentoService servico = new AlertaVencimentoService(tarefaRepository, notificacaoService, relogio);
        List<AlertaVencimentoService.Alerta> alertas = servico.gerarAlertas();

        assertThat(alertas).hasSize(1);
        assertThat(alertas.get(0).email()).isEqualTo("ana@exemplo.com");
        assertThat(alertas.get(0).notificacao().mensagem()).contains("Lista 3").contains("vence amanhã");
        assertThat(amanha.getUltimaNotificacao()).isEqualTo(hoje);
    }

    @Test
    void semTarefasNaoGeraNada() {
        when(tarefaRepository.findTarefasVencendo(any(), any(), any())).thenReturn(List.of());

        AlertaVencimentoService servico = new AlertaVencimentoService(tarefaRepository, notificacaoService, relogio);

        assertThat(servico.gerarAlertas()).isEmpty();
    }
}
