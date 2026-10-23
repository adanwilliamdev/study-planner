package com.studyplanner.service;

import com.studyplanner.entity.*;
import com.studyplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TarefaService {

    @Autowired private TarefaRepository tarefaRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario usuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public List<Tarefa> listar(String email) {
        return tarefaRepository.findByMateriaUsuarioId(usuarioLogado(email).getId());
    }

    public Tarefa criar(Tarefa tarefa, Long materiaId) {
        if (materiaId != null) {
            Materia m = materiaRepository.findById(materiaId)
                    .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
            tarefa.setMateria(m);
        }
        return tarefaRepository.save(tarefa);
    }

    public Tarefa atualizar(Long id, Tarefa dados, Long materiaId) {
        Tarefa t = tarefaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));
        t.setTitulo(dados.getTitulo());
        t.setDescricao(dados.getDescricao());
        t.setDataEntrega(dados.getDataEntrega());
        t.setPrioridade(dados.getPrioridade());
        t.setStatus(dados.getStatus());
        if (materiaId != null) {
            t.setMateria(materiaRepository.findById(materiaId).orElse(null));
        }
        return tarefaRepository.save(t);
    }

    public void deletar(Long id) { tarefaRepository.deleteById(id); }
}