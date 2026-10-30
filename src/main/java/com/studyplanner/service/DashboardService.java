package com.studyplanner.service;

import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.dto.DashboardResponse;
import com.studyplanner.dto.DashboardResponse.ProgressoMateria;
import com.studyplanner.dto.MateriaResumo;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.CronogramaRepository;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TarefaRepository tarefaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final PomodoroService pomodoroService;
    private final UsuarioAtualService usuarioAtual;
    private final Clock clock;

    public DashboardService(TarefaRepository tarefaRepository, CronogramaRepository cronogramaRepository,
                            PomodoroService pomodoroService, UsuarioAtualService usuarioAtual, Clock clock) {
        this.tarefaRepository = tarefaRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.pomodoroService = pomodoroService;
        this.usuarioAtual = usuarioAtual;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse resumo(String email) {
        Usuario u = usuarioAtual.obter(email);
        LocalDate hoje = LocalDate.now(clock);

        List<Tarefa> tarefas = tarefaRepository.listarOrdenadas(u.getId(), Tarefa.StatusTarefa.CONCLUIDO);
        List<Tarefa> abertas = tarefas.stream().filter(t -> t.getStatus() != Tarefa.StatusTarefa.CONCLUIDO).toList();

        long atrasadas = abertas.stream()
                .filter(t -> t.getDataEntrega() != null && t.getDataEntrega().isBefore(hoje)).count();
        long vencemHoje = abertas.stream().filter(t -> hoje.equals(t.getDataEntrega())).count();

        List<TarefaResponse> proximas = abertas.stream()
                .filter(t -> t.getDataEntrega() != null)
                .sorted(Comparator.comparing(Tarefa::getDataEntrega))
                .limit(5).map(TarefaResponse::de).toList();

        List<CronogramaResponse> sessoesHoje = cronogramaRepository.listarDoUsuario(u.getId()).stream()
                .filter(c -> c.getDiaDaSemana() == hoje.getDayOfWeek())
                .sorted(Comparator.comparing(Cronograma::getHorarioInicio))
                .map(CronogramaResponse::de).toList();

        // progresso por materia (tarefas sem materia ficam de fora)
        Map<Long, long[]> contagem = new LinkedHashMap<>();
        Map<Long, MateriaResumo> materias = new LinkedHashMap<>();
        for (Tarefa t : tarefas) {
            if (t.getMateria() == null) {
                continue;
            }
            Long id = t.getMateria().getId();
            materias.putIfAbsent(id, MateriaResumo.de(t.getMateria()));
            long[] c = contagem.computeIfAbsent(id, k -> new long[2]);
            c[0]++;
            if (t.getStatus() == Tarefa.StatusTarefa.CONCLUIDO) {
                c[1]++;
            }
        }
        List<ProgressoMateria> progresso = contagem.entrySet().stream()
                .map(e -> new ProgressoMateria(materias.get(e.getKey()), e.getValue()[0], e.getValue()[1]))
                .sorted(Comparator.comparingLong(ProgressoMateria::total).reversed())
                .toList();

        return new DashboardResponse(abertas.size(), tarefas.size() - abertas.size(), atrasadas, vencemHoje,
                proximas, sessoesHoje, progresso, pomodoroService.estatisticas(u.getId()));
    }
}
