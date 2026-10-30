package com.studyplanner.service;

import com.studyplanner.dto.RegisterRequest;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

/** Cadastro de usuarios (o login em si e feito pelo Spring Security). */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registrar(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new RegraDeNegocioException("E-mail já cadastrado");
        }
        Usuario u = Usuario.builder()
                .nome(req.nome().trim())
                .email(email)
                .senha(passwordEncoder.encode(req.senha()))
                .roles(Set.of("ROLE_USER"))
                .build();
        try {
            usuarioRepository.saveAndFlush(u);
        } catch (DataIntegrityViolationException ex) { // corrida entre dois cadastros simultaneos
            throw new RegraDeNegocioException("E-mail já cadastrado");
        }
    }
}
