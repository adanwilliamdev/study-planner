package com.studyplanner.service;

import com.studyplanner.dto.TarefaRequest;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioAtualService usuarioAtual;

    public TarefaService(TarefaRepository tarefaRepository, MateriaRepository materiaRepository,
                         UsuarioAtualService usuarioAtual) {
        this.tarefaRepository = tarefaRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioAtual = usuarioAtual;
    }

    private Materia materiaDoUsuario(Long materiaId, Long usuarioId) {
        if (materiaId == null) {
            return null;
        }
        return materiaRepository.findByIdAndUsuarioId(materiaId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
    }

    private Tarefa doUsuario(Long id, Long usuarioId) {
        return tarefaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));
    }

    /** Abertas primeiro, depois por prazo (sem prazo por ultimo); a ordenacao e feita no banco. */
    @Transactional(readOnly = true)
    public List<TarefaResponse> listar(String email) {
        return tarefaRepository
                .listarOrdenadas(usuarioAtual.obter(email).getId(), Tarefa.StatusTarefa.CONCLUIDO)
                .stream().map(TarefaResponse::de).toList();
    }

    @Transactional
    public TarefaResponse criar(TarefaRequest req, String email) {
        Usuario u = usuarioAtual.obter(email);
        Tarefa t = Tarefa.builder().usuario(u).build();
        aplicar(t, req, u.getId());
        return TarefaResponse.de(tarefaRepository.save(t));
    }

    @Transactional
    public TarefaResponse atualizar(Long id, TarefaRequest req, String email) {
        Usuario u = usuarioAtual.obter(email);
        Tarefa t = doUsuario(id, u.getId());
        Tarefa.StatusTarefa anterior = t.getStatus();
        LocalDate prazoAnterior = t.getDataEntrega();
        aplicar(t, req, u.getId());
        // novo prazo ou reabertura: permite avisar novamente
        if (!Objects.equals(prazoAnterior, t.getDataEntrega()) || anterior != t.getStatus()) {
            t.setUltimaNotificacao(null);
        }
        return TarefaResponse.de(tarefaRepository.save(t));
    }

    /** Usado ao arrastar no quadro e ao marcar/desmarcar como concluida. */
    @Transactional
    public TarefaResponse alterarStatus(Long id, Tarefa.StatusTarefa status, String email) {
        Tarefa t = doUsuario(id, usuarioAtual.obter(email).getId());
        if (t.getStatus() != status) {
            t.setStatus(status);
            t.setUltimaNotificacao(null);
        }
        return TarefaResponse.de(t);
    }

    @Transactional
    public void deletar(Long id, String email) {
        tarefaRepository.delete(doUsuario(id, usuarioAtual.obter(email).getId()));
    }

    private void aplicar(Tarefa t, TarefaRequest req, Long usuarioId) {
        t.setTitulo(req.titulo().trim());
        t.setDescricao(req.descricao() == null || req.descricao().isBlank() ? null : req.descricao().trim());
        t.setDataEntrega(req.dataEntrega());
        t.setPrioridade(req.prioridade() != null ? req.prioridade() : Tarefa.Prioridade.MEDIA);
        t.setStatus(req.status() != null ? req.status() : Tarefa.StatusTarefa.A_FAZER);
        t.setMateria(materiaDoUsuario(req.materiaId(), usuarioId));
    }
}
