package com.studyplanner.security;

import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita tentativas de login por e-mail: apos {@value #MAX_FALHAS} senhas erradas seguidas,
 * a conta fica bloqueada por 15 minutos. Em memoria (suficiente para uma instancia).
 */
@Service
public class TentativasLoginService {

    static final int MAX_FALHAS = 5;
    static final Duration BLOQUEIO = Duration.ofMinutes(15);
    private static final int LIMITE_REGISTROS = 10_000; // evita crescer sem fim com e-mails inventados

    private record Registro(int falhas, Instant bloqueadoAte) {
    }

    private final Map<String, Registro> registros = new ConcurrentHashMap<>();
    private final Clock clock;

    public TentativasLoginService(Clock clock) {
        this.clock = clock;
    }

    public boolean bloqueado(String email) {
        String chave = chave(email);
        Registro r = registros.get(chave);
        if (r == null || r.bloqueadoAte() == null) {
            return false;
        }
        if (Instant.now(clock).isAfter(r.bloqueadoAte())) {
            registros.remove(chave);
            return false;
        }
        return true;
    }

    public void registrarFalha(String email) {
        if (registros.size() > LIMITE_REGISTROS) {
            registros.clear();
        }
        registros.merge(chave(email), new Registro(1, null), (atual, novo) -> {
            int falhas = atual.falhas() + 1;
            return new Registro(falhas, falhas >= MAX_FALHAS ? Instant.now(clock).plus(BLOQUEIO) : null);
        });
    }

    public void registrarSucesso(String email) {
        registros.remove(chave(email));
    }

    @EventListener
    void aoFalhar(AuthenticationFailureBadCredentialsEvent evento) {
        registrarFalha(evento.getAuthentication().getName());
    }

    @EventListener
    void aoAutenticar(AuthenticationSuccessEvent evento) {
        registrarSucesso(evento.getAuthentication().getName());
    }

    private static String chave(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
