package com.studyplanner.service;

import com.studyplanner.dto.EstatisticasResponse;
import com.studyplanner.repository.CronogramaRepository;
import com.studyplanner.repository.SessaoFocoRepository;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class EstatisticasService {

    private static final int JANELA_SEQUENCIA_DIAS = 365;

    private final SessaoFocoRepository sessaoFocoRepository;
    private final TarefaRepository tarefaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final UsuarioAtualService usuarioAtual;

    public EstatisticasService(SessaoFocoRepository sessaoFocoRepository, TarefaRepository tarefaRepository,
                               CronogramaRepository cronogramaRepository, UsuarioAtualService usuarioAtual) {
        this.sessaoFocoRepository = sessaoFocoRepository;
        this.tarefaRepository = tarefaRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.usuarioAtual = usuarioAtual;
    }

    @Transactional(readOnly = true)
    public EstatisticasResponse obter(String email, int dias) {
        int periodo = Math.min(Math.max(dias, 1), 90);
        Long usuarioId = usuarioAtual.obter(email).getId();
        LocalDate hoje = LocalDate.now();
        return EstatisticasCalculador.calcular(
                sessaoFocoRepository.findDesde(usuarioId, hoje.minusDays(JANELA_SEQUENCIA_DIAS)),
                sessaoFocoRepository.totalMinutos(usuarioId),
                tarefaRepository.findByUsuarioId(usuarioId),
                cronogramaRepository.findByMateriaUsuarioIdOrderByDiaDaSemanaAscHorarioInicioAsc(usuarioId),
                hoje, periodo);
    }
}
