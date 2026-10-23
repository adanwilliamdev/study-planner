package com.studyplanner.service;

import com.studyplanner.dto.MateriaRequest;
import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.entity.Materia;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MateriaService {

    private static final String COR_PADRAO = "#3b82f6";

    private final MateriaRepository materiaRepository;
    private final TarefaRepository tarefaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final MaterialRepository materialRepository;
    private final UsuarioAtualService usuarioAtual;

    public MateriaService(MateriaRepository materiaRepository, TarefaRepository tarefaRepository,
                          CronogramaRepository cronogramaRepository, MaterialRepository materialRepository,
                          UsuarioAtualService usuarioAtual) {
        this.materiaRepository = materiaRepository;
        this.tarefaRepository = tarefaRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.materialRepository = materialRepository;
        this.usuarioAtual = usuarioAtual;
    }

    /** Busca a materia garantindo que pertence ao usuario (usado tambem pelos outros services). */
    Materia buscarDoUsuario(Long id, Long usuarioId) {
        return materiaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<MateriaResponse> listar(String email) {
        return materiaRepository.findByUsuarioIdOrderByNomeAsc(usuarioAtual.obter(email).getId())
                .stream().map(MateriaResponse::de).toList();
    }

    @Transactional
    public MateriaResponse criar(MateriaRequest req, String email) {
        Materia m = Materia.builder()
                .nome(req.nome().trim())
                .cor(req.cor() != null ? req.cor() : COR_PADRAO)
                .cargaHoraria(req.cargaHoraria() != null ? req.cargaHoraria() : 0)
                .usuario(usuarioAtual.obter(email))
                .build();
        return MateriaResponse.de(materiaRepository.save(m));
    }

    @Transactional
    public MateriaResponse atualizar(Long id, MateriaRequest req, String email) {
        Materia m = buscarDoUsuario(id, usuarioAtual.obter(email).getId());
        m.setNome(req.nome().trim());
        m.setCor(req.cor() != null ? req.cor() : COR_PADRAO);
        m.setCargaHoraria(req.cargaHoraria() != null ? req.cargaHoraria() : 0);
        return MateriaResponse.de(materiaRepository.save(m));
    }

    /** Remove a materia e tudo que depende dela (evita erro de chave estrangeira). */
    @Transactional
    public void deletar(Long id, String email) {
        Materia m = buscarDoUsuario(id, usuarioAtual.obter(email).getId());
        tarefaRepository.deleteByMateriaId(m.getId());
        cronogramaRepository.deleteByMateriaId(m.getId());
        materialRepository.deleteByMateriaId(m.getId());
        materiaRepository.delete(m);
    }
}
