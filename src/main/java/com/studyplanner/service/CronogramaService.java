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

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class CronogramaService {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

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

    /** Ordenado por dia da semana (seg a dom) e horario. A ordenacao e em Java porque o dia e salvo como texto. */
    @Transactional(readOnly = true)
    public List<CronogramaResponse> listar(String email) {
        return cronogramaRepository.listarDoUsuario(usuarioAtual.obter(email).getId()).stream()
                .sorted(Comparator.comparing(Cronograma::getDiaDaSemana)
                        .thenComparing(Cronograma::getHorarioInicio))
                .map(CronogramaResponse::de).toList();
    }

    @Transactional
    public CronogramaResponse criar(CronogramaRequest req, String email) {
        Long usuarioId = usuarioAtual.obter(email).getId();
        if (!req.horarioFim().isAfter(req.horarioInicio())) {
            throw new RegraDeNegocioException("O horário de término deve ser depois do início");
        }
        Materia m = materiaRepository.findByIdAndUsuarioId(req.materiaId(), usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));

        // sessoes que se sobrepoem no mesmo dia; encostar (fim == inicio) e permitido
        cronogramaRepository.doUsuarioNoDia(usuarioId, req.diaDaSemana()).stream()
                .filter(c -> req.horarioInicio().isBefore(c.getHorarioFim())
                        && req.horarioFim().isAfter(c.getHorarioInicio()))
                .findFirst()
                .ifPresent(c -> {
                    throw new RegraDeNegocioException(String.format(
                            "Conflito de horário com %s (%s – %s)", c.getMateria().getNome(),
                            c.getHorarioInicio().format(HORA), c.getHorarioFim().format(HORA)));
                });

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
    public CronogramaResponse alterarConclusao(Long id, boolean concluida, String email) {
        Cronograma c = doUsuario(id, usuarioAtual.obter(email).getId());
        c.setStatus(concluida ? Cronograma.StatusCronograma.CONCLUIDO : Cronograma.StatusCronograma.PENDENTE);
        return CronogramaResponse.de(c);
    }

    @Transactional
    public void deletar(Long id, String email) {
        cronogramaRepository.delete(doUsuario(id, usuarioAtual.obter(email).getId()));
    }

    /** Chamado pelo agendador na virada da semana. */
    @Transactional
    public int reiniciarSemana() {
        return cronogramaRepository.reiniciarSemana();
    }
}
