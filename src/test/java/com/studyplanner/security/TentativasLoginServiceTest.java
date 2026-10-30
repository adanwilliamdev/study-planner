package com.studyplanner.security;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class TentativasLoginServiceTest {

    /** Relogio que avanca sob controle do teste. */
    private static final class RelogioMutavel extends Clock {
        private Instant agora = Instant.parse("2026-10-30T12:00:00Z");

        void avancar(Duration d) {
            agora = agora.plus(d);
        }

        @Override public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override public Instant instant() {
            return agora;
        }
    }

    private final RelogioMutavel relogio = new RelogioMutavel();
    private final TentativasLoginService servico = new TentativasLoginService(relogio);

    @Test
    void bloqueiaAposCincoFalhasSeguidas() {
        for (int i = 0; i < 4; i++) {
            servico.registrarFalha("ana@exemplo.com");
        }
        assertThat(servico.bloqueado("ana@exemplo.com")).isFalse();

        servico.registrarFalha("ana@exemplo.com");
        assertThat(servico.bloqueado("ana@exemplo.com")).isTrue();
    }

    @Test
    void desbloqueiaDepoisDoPeriodo() {
        for (int i = 0; i < 5; i++) {
            servico.registrarFalha("ana@exemplo.com");
        }
        relogio.avancar(Duration.ofMinutes(14));
        assertThat(servico.bloqueado("ana@exemplo.com")).isTrue();

        relogio.avancar(Duration.ofMinutes(2));
        assertThat(servico.bloqueado("ana@exemplo.com")).isFalse();
    }

    @Test
    void loginComSucessoZeraAContagem() {
        for (int i = 0; i < 4; i++) {
            servico.registrarFalha("ana@exemplo.com");
        }
        servico.registrarSucesso("ana@exemplo.com");
        servico.registrarFalha("ana@exemplo.com");

        assertThat(servico.bloqueado("ana@exemplo.com")).isFalse();
    }

    @Test
    void ignoraMaiusculasNoEmail() {
        for (int i = 0; i < 5; i++) {
            servico.registrarFalha("Ana@Exemplo.com");
        }
        assertThat(servico.bloqueado("ana@exemplo.com")).isTrue();
    }

    @Test
    void bloqueioDeUmUsuarioNaoAfetaOutro() {
        for (int i = 0; i < 5; i++) {
            servico.registrarFalha("ana@exemplo.com");
        }
        assertThat(servico.bloqueado("bia@exemplo.com")).isFalse();
    }
}
