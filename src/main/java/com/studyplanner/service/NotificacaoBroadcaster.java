package com.studyplanner.service;

import com.studyplanner.dto.NotificacaoResponse;
import com.vaadin.flow.shared.Registration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.function.Consumer;

/**
 * Entrega notificacoes em tempo real as telas abertas de cada usuario (server push).
 * A gravacao no banco e feita antes; aqui so se avisa quem esta conectado.
 */
@Component
public class NotificacaoBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoBroadcaster.class);

    private final Map<String, Set<Consumer<NotificacaoResponse>>> ouvintes = new ConcurrentHashMap<>();

    /** Cadastra um ouvinte para o usuario; chame {@code remove()} ao fechar a tela. */
    public Registration registrar(String email, Consumer<NotificacaoResponse> ouvinte) {
        String chave = chave(email);
        ouvintes.computeIfAbsent(chave, k -> new CopyOnWriteArraySet<>()).add(ouvinte);
        return () -> ouvintes.computeIfPresent(chave, (k, set) -> {
            set.remove(ouvinte);
            return set.isEmpty() ? null : set;
        });
    }

    public void enviar(String email, NotificacaoResponse notificacao) {
        Set<Consumer<NotificacaoResponse>> destino = ouvintes.get(chave(email));
        if (destino == null) {
            return;
        }
        for (Consumer<NotificacaoResponse> ouvinte : destino) {
            try {
                ouvinte.accept(notificacao);
            } catch (RuntimeException ex) { // tela ja fechada: nao pode derrubar os demais
                log.debug("Falha ao entregar notificação: {}", ex.getMessage());
            }
        }
    }

    private static String chave(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
