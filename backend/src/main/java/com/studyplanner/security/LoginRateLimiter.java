package com.studyplanner.security;

import com.studyplanner.exception.RegraDeNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita tentativas de login que falham: apos {@value #MAX_FALHAS} erros seguidos para a mesma
 * chave (IP + e-mail) o login fica bloqueado por {@value #JANELA_MINUTOS} minutos.
 * Estado em memoria: suficiente para uma instancia; com varias, troque por Redis/Bucket4j.
 */
@Component
public class LoginRateLimiter {

    static final int MAX_FALHAS = 5;
    static final long JANELA_MINUTOS = 15;
    private static final int LIMITE_PARA_LIMPEZA = 10_000;

    private record Registro(int falhas, Instant inicio) {}

    private final ConcurrentHashMap<String, Registro> registros = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginRateLimiter() { this(Clock.systemUTC()); }

    LoginRateLimiter(Clock clock) { this.clock = clock; }

    /** Lanca 429 se a chave esta bloqueada. */
    public void verificar(String chave) {
        Registro r = registros.get(chave);
        if (r == null) return;
        if (expirou(r)) { registros.remove(chave, r); return; }
        if (r.falhas() >= MAX_FALHAS) {
            throw new RegraDeNegocioException(
                    "Muitas tentativas de login. Tente novamente em alguns minutos.", HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    public void registrarFalha(String chave) {
        if (registros.size() > LIMITE_PARA_LIMPEZA) registros.values().removeIf(this::expirou);
        Instant agora = clock.instant();
        registros.merge(chave, new Registro(1, agora),
                (atual, novo) -> expirou(atual) ? novo : new Registro(atual.falhas() + 1, atual.inicio()));
    }

    public void registrarSucesso(String chave) { registros.remove(chave); }

    private boolean expirou(Registro r) {
        return r.inicio().plus(Duration.ofMinutes(JANELA_MINUTOS)).isBefore(clock.instant());
    }
}
