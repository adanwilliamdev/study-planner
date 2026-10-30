package com.studyplanner.dto;

import com.studyplanner.entity.Notificacao;

import java.time.LocalDateTime;

public record NotificacaoResponse(Long id, String mensagem, LocalDateTime criadaEm, boolean lida) {
    public static NotificacaoResponse de(Notificacao n) {
        return new NotificacaoResponse(n.getId(), n.getMensagem(), n.getCriadaEm(), n.isLida());
    }
}
