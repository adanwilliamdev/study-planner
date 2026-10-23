package com.studyplanner.service;

import com.studyplanner.entity.Materia;
import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MateriaService {

    @Autowired private MateriaRepository materiaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario usuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public List<Materia> listar(String email) {
        return materiaRepository.findByUsuarioId(usuarioLogado(email).getId());
    }

    public Materia criar(Materia materia, String email) {
        materia.setUsuario(usuarioLogado(email));
        return materiaRepository.save(materia);
    }

    public Materia atualizar(Long id, Materia dados) {
        Materia m = materiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        m.setNome(dados.getNome());
        m.setCor(dados.getCor());
        m.setCargaHoraria(dados.getCargaHoraria());
        return materiaRepository.save(m);
    }

    public void deletar(Long id) { materiaRepository.deleteById(id); }
}