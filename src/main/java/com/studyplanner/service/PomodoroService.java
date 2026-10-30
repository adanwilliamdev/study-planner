package com.studyplanner.service;

import com.studyplanner.dto.EstatisticasFoco;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.SessaoPomodoro;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.SessaoPomodoroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PomodoroService {

    private static final int DIAS_GRAFICO = 7;
    private static final int DIAS_HISTORICO = 90; // teto da sequencia de dias

    private final SessaoPomodoroRepository repository;
    private final MateriaRepository materiaRepository;
    private final UsuarioAtualService usuarioAtual;
    private final Clock clock;

    public PomodoroService(SessaoPomodoroRepository repository, MateriaRepository materiaRepository,
                           UsuarioAtualService usuarioAtual, Clock clock) {
        this.repository = repository;
        this.materiaRepository = materiaRepository;
        this.usuarioAtual = usuarioAtual;
        this.clock = clock;
    }

    /** Registra um foco concluido; a materia (opcional) precisa pertencer ao usuario. */
    @Transactional
    public void registrarFoco(String email, Long materiaId, int minutos) {
        Usuario u = usuarioAtual.obter(email);
        Materia materia = null;
        if (materiaId != null) {
            materia = materiaRepository.findByIdAndUsuarioId(materiaId, u.getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
        }
        repository.save(SessaoPomodoro.builder()
                .usuario(u)
                .materia(materia)
                .minutos(minutos)
                .concluidaEm(LocalDateTime.now(clock))
                .build());
    }

    @Transactional(readOnly = true)
    public EstatisticasFoco estatisticas(Long usuarioId) {
        LocalDate hoje = LocalDate.now(clock);
        List<SessaoPomodoro> sessoes = repository.findByUsuarioIdAndConcluidaEmGreaterThanEqual(
                usuarioId, hoje.minusDays(DIAS_HISTORICO).atStartOfDay());

        Map<LocalDate, Integer> porDia = new LinkedHashMap<>();
        for (SessaoPomodoro s : sessoes) {
            porDia.merge(s.getConcluidaEm().toLocalDate(), s.getMinutos(), Integer::sum);
        }

        Map<LocalDate, Integer> ultimos = new LinkedHashMap<>();
        int semana = 0;
        for (int i = DIAS_GRAFICO - 1; i >= 0; i--) {
            LocalDate dia = hoje.minusDays(i);
            int min = porDia.getOrDefault(dia, 0);
            ultimos.put(dia, min);
            semana += min;
        }

        // sequencia: dias seguidos com algum foco; se hoje ainda nao teve, conta a partir de ontem
        int sequencia = 0;
        LocalDate dia = porDia.containsKey(hoje) ? hoje : hoje.minusDays(1);
        while (porDia.containsKey(dia) && sequencia < DIAS_HISTORICO) {
            sequencia++;
            dia = dia.minusDays(1);
        }
        return new EstatisticasFoco(porDia.getOrDefault(hoje, 0), semana, sequencia, ultimos);
    }
}
