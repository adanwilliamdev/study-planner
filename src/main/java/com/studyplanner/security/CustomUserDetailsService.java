package com.studyplanner.security;

import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final TentativasLoginService tentativas;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository, TentativasLoginService tentativas) {
        this.usuarioRepository = usuarioRepository;
        this.tentativas = tentativas;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(usuario.getRoles().stream().map(SimpleGrantedAuthority::new).toList())
                .accountLocked(tentativas.bloqueado(usuario.getEmail()))
                .build();
    }
}
