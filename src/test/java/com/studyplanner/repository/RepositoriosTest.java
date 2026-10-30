package com.studyplanner.repository;

import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.entity.Tarefa.Prioridade;
import com.studyplanner.entity.Tarefa.StatusTarefa;
import com.studyplanner.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Roda as migracoes do Flyway no H2 e deixa o Hibernate validar o esquema contra as entidades
 * (ddl-auto=validate); depois exercita as consultas mais importantes.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RepositoriosTest {

    @Autowired TestEntityManager em;
    @Autowired TarefaRepository tarefaRepository;
    @Autowired CronogramaRepository cronogramaRepository;

    private Usuario ana;
    private Usuario bia;
    private final LocalDate hoje = LocalDate.of(2026, 10, 30);

    @BeforeEach
    void preparar() {
        ana = em.persist(Usuario.builder().nome("Ana").email("ana@exemplo.com").senha("x").build());
        bia = em.persist(Usuario.builder().nome("Bia").email("bia@exemplo.com").senha("x").build());
    }

    private Tarefa tarefa(Usuario dono, String titulo, LocalDate prazo, StatusTarefa status) {
        return em.persist(Tarefa.builder().titulo(titulo).usuario(dono).dataEntrega(prazo)
                .status(status).prioridade(Prioridade.MEDIA).build());
    }

    @Test
    void listaAbertasPrimeiroPorPrazoESemPrazoNoFimDasAbertas() {
        tarefa(ana, "concluida", hoje.minusDays(3), StatusTarefa.CONCLUIDO);
        tarefa(ana, "sem prazo", null, StatusTarefa.A_FAZER);
        tarefa(ana, "depois", hoje.plusDays(5), StatusTarefa.EM_ANDAMENTO);
        tarefa(ana, "antes", hoje.plusDays(1), StatusTarefa.A_FAZER);
        em.flush();
        em.clear();

        List<Tarefa> lista = tarefaRepository.listarOrdenadas(ana.getId(), StatusTarefa.CONCLUIDO);

        assertThat(lista).extracting(Tarefa::getTitulo)
                .containsExactly("antes", "depois", "sem prazo", "concluida");
    }

    @Test
    void cadaUsuarioSoVeAsPropriasTarefas() {
        tarefa(ana, "da Ana", hoje, StatusTarefa.A_FAZER);
        Tarefa daBia = tarefa(bia, "da Bia", hoje, StatusTarefa.A_FAZER);
        em.flush();
        em.clear();

        assertThat(tarefaRepository.listarOrdenadas(ana.getId(), StatusTarefa.CONCLUIDO))
                .extracting(Tarefa::getTitulo).containsExactly("da Ana");
        assertThat(tarefaRepository.findByIdAndUsuarioId(daBia.getId(), ana.getId())).isEmpty();
    }

    @Test
    void tarefasVencendoIgnoraConcluidasEJaAvisadasHoje() {
        tarefa(ana, "vence hoje", hoje, StatusTarefa.A_FAZER);
        tarefa(ana, "vence amanha", hoje.plusDays(1), StatusTarefa.EM_ANDAMENTO);
        tarefa(ana, "vence depois", hoje.plusDays(2), StatusTarefa.A_FAZER);
        tarefa(ana, "ja concluida", hoje, StatusTarefa.CONCLUIDO);
        Tarefa avisada = tarefa(ana, "ja avisada", hoje, StatusTarefa.A_FAZER);
        avisada.setUltimaNotificacao(hoje);
        Tarefa avisadaOntem = tarefa(ana, "avisada ontem", hoje, StatusTarefa.A_FAZER);
        avisadaOntem.setUltimaNotificacao(hoje.minusDays(1));
        em.flush();
        em.clear();

        List<Tarefa> vencendo = tarefaRepository.findTarefasVencendo(hoje, hoje.plusDays(1), StatusTarefa.CONCLUIDO);

        assertThat(vencendo).extracting(Tarefa::getTitulo)
                .containsExactlyInAnyOrder("vence hoje", "vence amanha", "avisada ontem");
    }

    @Test
    void reiniciarSemanaDeixaTudoPendente() {
        Materia m = em.persist(Materia.builder().nome("Cálculo").cor("#4A44E0").usuario(ana).build());
        Cronograma feita = em.persist(Cronograma.builder().materia(m).diaDaSemana(DayOfWeek.MONDAY)
                .horarioInicio(LocalTime.of(19, 0)).horarioFim(LocalTime.of(20, 0))
                .status(Cronograma.StatusCronograma.CONCLUIDO).build());
        em.flush();
        em.clear();

        int alteradas = cronogramaRepository.reiniciarSemana();
        em.clear();

        assertThat(alteradas).isEqualTo(1);
        assertThat(cronogramaRepository.findById(feita.getId()).orElseThrow().getStatus())
                .isEqualTo(Cronograma.StatusCronograma.PENDENTE);
    }
}
