package com.studyplanner.security;

import com.studyplanner.exception.RegraDeNegocioException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    /** Relogio controlavel para simular a passagem do tempo. */
    private static class RelogioMutavel extends Clock {
        Instant agora = Instant.parse("2026-10-30T12:00:00Z");
        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return agora; }
    }

    @Test
    void bloqueiaAposMaximoDeFalhas() {
        LoginRateLimiter limiter = new LoginRateLimiter(new RelogioMutavel());
        for (int i = 0; i < LoginRateLimiter.MAX_FALHAS; i++) {
            limiter.verificar("a");
            limiter.registrarFalha("a");
        }
        RegraDeNegocioException ex = assertThrows(RegraDeNegocioException.class, () -> limiter.verificar("a"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatus());
        assertDoesNotThrow(() -> limiter.verificar("outra-chave"));
    }

    @Test
    void sucessoZeraOContador() {
        LoginRateLimiter limiter = new LoginRateLimiter(new RelogioMutavel());
        for (int i = 0; i < LoginRateLimiter.MAX_FALHAS - 1; i++) limiter.registrarFalha("a");
        limiter.registrarSucesso("a");
        for (int i = 0; i < LoginRateLimiter.MAX_FALHAS - 1; i++) limiter.registrarFalha("a");
        assertDoesNotThrow(() -> limiter.verificar("a"));
    }

    @Test
    void desbloqueiaDepoisDaJanela() {
        RelogioMutavel relogio = new RelogioMutavel();
        LoginRateLimiter limiter = new LoginRateLimiter(relogio);
        for (int i = 0; i < LoginRateLimiter.MAX_FALHAS; i++) limiter.registrarFalha("a");
        assertThrows(RegraDeNegocioException.class, () -> limiter.verificar("a"));

        relogio.agora = relogio.agora.plus(Duration.ofMinutes(LoginRateLimiter.JANELA_MINUTOS + 1));
        assertDoesNotThrow(() -> limiter.verificar("a"));
    }
}
