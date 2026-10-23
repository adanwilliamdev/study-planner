package com.studyplanner.service;

import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.UsuarioRepository;
import com.studyplanner.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
public class AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;

    public String login(String email, String senha) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, senha));
        return tokenProvider.generateToken(auth);
    }

    public void registrar(String nome, String email, String senha) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado!");
        }
        Usuario u = Usuario.builder()
                .nome(nome)
                .email(email)
                .senha(passwordEncoder.encode(senha))
                .roles(Set.of("ROLE_USER"))
                .build();
        usuarioRepository.save(u);
    }
}