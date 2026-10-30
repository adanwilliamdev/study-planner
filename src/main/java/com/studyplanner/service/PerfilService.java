package com.studyplanner.service;

import com.studyplanner.entity.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Preferencias do usuario (por ora, o tema claro/escuro). */
@Service
public class PerfilService {

    public static final String CLARO = "light";
    public static final String ESCURO = "dark";

    private final UsuarioAtualService usuarioAtual;

    public PerfilService(UsuarioAtualService usuarioAtual) {
        this.usuarioAtual = usuarioAtual;
    }

    @Transactional(readOnly = true)
    public String tema(String email) {
        return ESCURO.equals(usuarioAtual.obter(email).getTema()) ? ESCURO : CLARO;
    }

    @Transactional
    public void salvarTema(String email, String tema) {
        Usuario u = usuarioAtual.obter(email);
        u.setTema(ESCURO.equals(tema) ? ESCURO : CLARO);
    }
}
