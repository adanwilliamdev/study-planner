package com.studyplanner.service;

import com.studyplanner.dto.CronogramaRequest;
import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.Materia;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.repository.CronogramaRepository;
import com.studyplanner.repository.MateriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CronogramaService {

    private final CronogramaRepository cronogramaRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioAtualService usuarioAtual;

    public CronogramaService(CronogramaRepository cronogramaRepository, MateriaRepository materiaRepository,
                             UsuarioAtualService usuarioAtual) {
        this.cronogramaRepository = cronogramaRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioAtual = usuarioAtual;
    }

    private Cronograma doUsuario(Long id, Long usuarioId) {
        return cronogramaRepository.findByIdAndMateriaUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sessão não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<CronogramaResponse> listar(String email) {
        return cronogramaRepository
                .findByMateriaUsuarioIdOrderByDiaDaSemanaAscHorarioInicioAsc(usuarioAtual.obter(email).getId())
                .stream().map(CronogramaResponse::de).toList();
    }

    @Transactional
    public CronogramaResponse criar(CronogramaRequest req, String email) {
        Long usuarioId = usuarioAtual.obter(email).getId();
        if (!req.horarioFim().isAfter(req.horarioInicio())) {
            throw new RegraDeNegocioException("O horário de término deve ser depois do início");
        }
        Materia m = materiaRepository.findByIdAndUsuarioId(req.materiaId(), usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
        Cronograma c = Cronograma.builder()
                .materia(m)
                .diaDaSemana(req.diaDaSemana())
                .horarioInicio(req.horarioInicio())
                .horarioFim(req.horarioFim())
                .status(Cronograma.StatusCronograma.PENDENTE)
                .build();
        return CronogramaResponse.de(cronogramaRepository.save(c));
    }

    @Transactional
    public CronogramaResponse concluir(Long id, String email) {
        Cronograma c = doUsuario(id, usuarioAtual.obter(email).getId());
        c.setStatus(Cronograma.StatusCronograma.CONCLUIDO);
        return CronogramaResponse.de(cronogramaRepository.save(c));
    }

    @Transactional
    public void deletar(Long id, String email) {
        cronogramaRepository.delete(doUsuario(id, usuarioAtual.obter(email).getId()));
    }
}
