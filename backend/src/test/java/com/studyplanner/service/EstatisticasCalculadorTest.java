package com.studyplanner.service;

import com.studyplanner.dto.EstatisticasResponse;
import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.SessaoFoco;
import com.studyplanner.entity.Tarefa;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class EstatisticasCalculadorTest {

    // quinta-feira
    private static final LocalDate HOJE = LocalDate.of(2026, 10, 29);

    private static SessaoFoco foco(LocalDate data, int minutos, Materia m) {
        return SessaoFoco.builder().data(data).minutos(minutos).materia(m).build();
    }

    private static Materia materia(long id, String nome) {
        return Materia.builder().id(id).nome(nome).cor("#112233").build();
    }

    @Test
    void somaFocoDoPeriodoEDeHoje() {
        Materia mat = materia(1, "Cálculo");
        List<SessaoFoco> sessoes = List.of(
                foco(HOJE, 25, mat), foco(HOJE, 25, null),
                foco(HOJE.minusDays(2), 50, mat),
                foco(HOJE.minusDays(20), 100, mat)); // fora do periodo de 7 dias

        EstatisticasResponse r = EstatisticasCalculador.calcular(sessoes, 200, List.of(), List.of(), HOJE, 7);

        assertEquals(50, r.focoHojeMin());
        assertEquals(100, r.focoPeriodoMin());
        assertEquals(3, r.sessoesFocoPeriodo());
        assertEquals(200, r.focoTotalMin());
        assertEquals(7, r.porDia().size());
        assertEquals(HOJE, r.porDia().get(6).data());
        assertEquals(50, r.porDia().get(6).focoMin());
    }

    @Test
    void agrupaPorMateriaOrdenadoPeloMaior() {
        Materia a = materia(1, "A"), b = materia(2, "B");
        List<SessaoFoco> sessoes = List.of(foco(HOJE, 25, a), foco(HOJE, 60, b), foco(HOJE, 10, null));

        List<EstatisticasResponse.PorMateria> pm =
                EstatisticasCalculador.calcular(sessoes, 95, List.of(), List.of(), HOJE, 7).porMateria();

        assertEquals(3, pm.size());
        assertEquals("B", pm.get(0).nome());
        assertEquals(60, pm.get(0).focoMin());
        assertEquals("Sem matéria", pm.get(2).nome());
        assertNull(pm.get(2).materiaId());
    }

    @Test
    void sequenciaContaDiasSeguidosEPerdoaHojeSemFoco() {
        assertEquals(3, EstatisticasCalculador.sequencia(
                Set.of(HOJE, HOJE.minusDays(1), HOJE.minusDays(2), HOJE.minusDays(4)), HOJE));
        // hoje ainda sem foco: a sequencia de ontem continua
        assertEquals(2, EstatisticasCalculador.sequencia(Set.of(HOJE.minusDays(1), HOJE.minusDays(2)), HOJE));
        // ontem tambem sem foco: zerou
        assertEquals(0, EstatisticasCalculador.sequencia(Set.of(HOJE.minusDays(2)), HOJE));
    }

    @Test
    void contaTarefasConcluidasAbertasEAtrasadas() {
        List<Tarefa> tarefas = List.of(
                Tarefa.builder().status(Tarefa.StatusTarefa.CONCLUIDO).concluidaEm(HOJE).build(),
                Tarefa.builder().status(Tarefa.StatusTarefa.CONCLUIDO).concluidaEm(HOJE.minusDays(30)).build(),
                Tarefa.builder().status(Tarefa.StatusTarefa.A_FAZER).dataEntrega(HOJE.minusDays(1)).build(),
                Tarefa.builder().status(Tarefa.StatusTarefa.EM_ANDAMENTO).dataEntrega(HOJE.plusDays(3)).build(),
                Tarefa.builder().status(Tarefa.StatusTarefa.A_FAZER).build());

        EstatisticasResponse r = EstatisticasCalculador.calcular(List.of(), 0, tarefas, List.of(), HOJE, 7);

        assertEquals(1, r.tarefasConcluidasPeriodo());
        assertEquals(3, r.tarefasAbertas());
        assertEquals(1, r.tarefasAtrasadas());
        assertEquals(1, r.porDia().get(6).tarefasConcluidas());
    }

    @Test
    void sessaoDeCronogramaConcluidaEmSemanaAnteriorVoltaAPendente() {
        LocalDate segundaDestaSemana = LocalDate.of(2026, 10, 26);
        Cronograma desta = Cronograma.builder().diaDaSemana(DayOfWeek.MONDAY)
                .status(Cronograma.StatusCronograma.CONCLUIDO).concluidaEm(segundaDestaSemana).build();
        Cronograma antiga = Cronograma.builder().diaDaSemana(DayOfWeek.MONDAY)
                .status(Cronograma.StatusCronograma.CONCLUIDO).concluidaEm(segundaDestaSemana.minusDays(1)).build();
        Cronograma pendente = Cronograma.builder().diaDaSemana(DayOfWeek.TUESDAY).build();

        EstatisticasResponse r = EstatisticasCalculador.calcular(
                List.of(), 0, List.of(), List.of(desta, antiga, pendente), HOJE, 7);

        assertEquals(3, r.sessoesPlanejadasSemana());
        assertEquals(1, r.sessoesConcluidasSemana());
    }
}
