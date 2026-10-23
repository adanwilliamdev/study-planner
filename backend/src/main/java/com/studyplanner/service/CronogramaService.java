package com.studyplanner.service;

import com.studyplanner.entity.*;
import com.studyplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CronogramaService {

    @Autowired private CronogramaRepository cronogramaRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario usuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public List<Cronograma> listar(String email) {
        return cronogramaRepository.findByMateriaUsuarioId(usuarioLogado(email).getId());
    }

    public Cronograma criar(Cronograma cronograma, Long materiaId) {
        Materia m = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        cronograma.setMateria(m);
        if (cronograma.getStatus() == null) {
            cronograma.setStatus(Cronograma.StatusCronograma.PENDENTE);
        }
        return cronogramaRepository.save(cronograma);
    }

    public Cronograma concluir(Long id) {
        Cronograma c = cronogramaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cronograma não encontrado"));
        c.setStatus(Cronograma.StatusCronograma.CONCLUIDO);
        return cronogramaRepository.save(c);
    }

    public void deletar(Long id) { cronogramaRepository.deleteById(id); }
}