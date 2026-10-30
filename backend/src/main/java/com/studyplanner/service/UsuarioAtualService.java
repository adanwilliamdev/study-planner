package com.studyplanner.service;

import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

/** Resolve o usuario autenticado (o "username" do JWT e o e-mail). */
@Service
public class UsuarioAtualService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAtualService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obter(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }
}
