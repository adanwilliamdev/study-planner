package com.studyplanner.service;

import com.studyplanner.dto.AuthResponse;
import com.studyplanner.dto.LoginRequest;
import com.studyplanner.dto.RegisterRequest;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.repository.UsuarioRepository;
import com.studyplanner.security.JwtTokenProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioAtualService usuarioAtual;

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       UsuarioAtualService usuarioAtual) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.usuarioAtual = usuarioAtual;
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim(), req.senha()));
        Usuario usuario = usuarioAtual.obter(auth.getName());
        return AuthResponse.bearer(tokenProvider.generateToken(auth), usuario.getNome(), usuario.getEmail());
    }

    public void registrar(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new RegraDeNegocioException("E-mail já cadastrado", HttpStatus.CONFLICT);
        }
        Usuario u = Usuario.builder()
                .nome(req.nome().trim())
                .email(email)
                .senha(passwordEncoder.encode(req.senha()))
                .roles(Set.of("ROLE_USER"))
                .build();
        try {
            usuarioRepository.save(u);
        } catch (DataIntegrityViolationException ex) { // corrida entre dois cadastros simultaneos
            throw new RegraDeNegocioException("E-mail já cadastrado", HttpStatus.CONFLICT);
        }
    }
}
