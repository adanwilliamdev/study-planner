package com.studyplanner.service;

import com.studyplanner.dto.EstatisticasResponse;
import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.SessaoFoco;
import com.studyplanner.entity.Tarefa;

import java.time.LocalDate;
import java.util.*;

/** Calculo puro das estatisticas (sem acesso a banco), o que o torna facil de testar. */
final class EstatisticasCalculador {

    private EstatisticasCalculador() {}

    static EstatisticasResponse calcular(List<SessaoFoco> sessoes, long focoTotalMin, List<Tarefa> tarefas,
                                         List<Cronograma> cronogramas, LocalDate hoje, int dias) {
        LocalDate inicio = hoje.minusDays(dias - 1L);

        Map<LocalDate, Integer> focoPorData = new HashMap<>();
        Map<LocalDate, Integer> tarefasPorData = new HashMap<>();
        Map<Long, int[]> porMateriaMin = new LinkedHashMap<>();   // id (ou -1) -> [minutos]
        Map<Long, SessaoFoco> exemploMateria = new HashMap<>();
        Set<LocalDate> diasComFoco = new HashSet<>();

        int focoPeriodo = 0, sessoesPeriodo = 0;
        for (SessaoFoco s : sessoes) {
            diasComFoco.add(s.getData());
            focoPorData.merge(s.getData(), s.getMinutos(), Integer::sum);
            if (!s.getData().isBefore(inicio) && !s.getData().isAfter(hoje)) {
                focoPeriodo += s.getMinutos();
                sessoesPeriodo++;
                Long chave = s.getMateria() == null ? -1L : s.getMateria().getId();
                porMateriaMin.computeIfAbsent(chave, k -> new int[1])[0] += s.getMinutos();
                exemploMateria.putIfAbsent(chave, s);
            }
        }

        int concluidasPeriodo = 0, abertas = 0, atrasadas = 0;
        for (Tarefa t : tarefas) {
            if (t.getStatus() == Tarefa.StatusTarefa.CONCLUIDO) {
                LocalDate c = t.getConcluidaEm();
                if (c != null) {
                    tarefasPorData.merge(c, 1, Integer::sum);
                    if (!c.isBefore(inicio) && !c.isAfter(hoje)) concluidasPeriodo++;
                }
            } else {
                abertas++;
                if (t.getDataEntrega() != null && t.getDataEntrega().isBefore(hoje)) atrasadas++;
            }
        }

        int concluidasSemana = 0;
        for (Cronograma c : cronogramas) {
            if (c.statusEfetivo(hoje) == Cronograma.StatusCronograma.CONCLUIDO) concluidasSemana++;
        }

        List<EstatisticasResponse.Dia> porDia = new ArrayList<>();
        for (int i = dias - 1; i >= 0; i--) {
            LocalDate d = hoje.minusDays(i);
            porDia.add(new EstatisticasResponse.Dia(d, focoPorData.getOrDefault(d, 0), tarefasPorData.getOrDefault(d, 0)));
        }

        List<EstatisticasResponse.PorMateria> porMateria = new ArrayList<>();
        porMateriaMin.forEach((id, min) -> {
            SessaoFoco ex = exemploMateria.get(id);
            if (id == -1L) porMateria.add(new EstatisticasResponse.PorMateria(null, "Sem matéria", null, min[0]));
            else porMateria.add(new EstatisticasResponse.PorMateria(id, ex.getMateria().getNome(), ex.getMateria().getCor(), min[0]));
        });
        porMateria.sort(Comparator.comparingInt(EstatisticasResponse.PorMateria::focoMin).reversed());

        return new EstatisticasResponse(dias, focoPorData.getOrDefault(hoje, 0), focoPeriodo, focoTotalMin,
                sessoesPeriodo, sequencia(diasComFoco, hoje), concluidasPeriodo, abertas, atrasadas,
                cronogramas.size(), concluidasSemana, porDia, porMateria);
    }

    /** Dias seguidos com foco. Se hoje ainda nao teve foco, a sequencia de ontem continua valendo. */
    static int sequencia(Set<LocalDate> diasComFoco, LocalDate hoje) {
        LocalDate d = diasComFoco.contains(hoje) ? hoje : hoje.minusDays(1);
        int n = 0;
        while (diasComFoco.contains(d)) { n++; d = d.minusDays(1); }
        return n;
    }
}
