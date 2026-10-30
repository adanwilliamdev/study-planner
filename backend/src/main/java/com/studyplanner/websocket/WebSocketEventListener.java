package com.studyplanner.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Listener de eventos do ciclo de vida WebSocket/STOMP.
 * Mantém um registro em memória dos usuários conectados e loga
 * conexões, desconexões, subscriptions e unsubscriptions.
 */
@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    /** sessionId -> username (ou "anônimo" quando não há Principal autenticado) */
    private final Map<String, String> sessoesAtivas = new ConcurrentHashMap<>();

    /** sessionId -> destination (para rastrear subscribes) */
    private final Map<String, String> subscriptions = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        log.info("🔌 Tentativa de conexão STOMP — sessionId={}", sessionId);
    }

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String username = event.getUser() != null ? event.getUser().getName() : "anônimo";

        sessoesAtivas.put(sessionId, username);
        log.info("✅ Usuário conectado: '{}' (sessionId={}) — total online: {}",
                username, sessionId, sessoesAtivas.size());
    }

    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String destination = accessor.getDestination();
        String subscriptionId = accessor.getSubscriptionId();

        if (subscriptionId != null && destination != null) {
            subscriptions.put(sessionId + "|" + subscriptionId, destination);
        }
        log.info("📬 Subscribe — sessionId={} | destination={} | subscriptionId={}",
                sessionId, destination, subscriptionId);
    }

    @EventListener
    public void handleSessionUnsubscribe(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String subscriptionId = accessor.getSubscriptionId();

        if (subscriptionId != null) {
            String destination = subscriptions.remove(sessionId + "|" + subscriptionId);
            log.info("📭 Unsubscribe — sessionId={} | destination={} | subscriptionId={}",
                    sessionId, destination, subscriptionId);
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String username = sessoesAtivas.remove(sessionId);

        subscriptions.keySet().removeIf(k -> k.startsWith(sessionId + "|"));

        log.info("❌ Usuário desconectado: '{}' (sessionId={}) — total online: {}",
                username != null ? username : "desconhecido",
                sessionId,
                sessoesAtivas.size());
    }

    // ----- Helpers expostos (opcional: podem ser usados em outros serviços) -----

    /** Retorna o número de usuários conectados via WebSocket. */
    public int getUsuariosOnline() {
        return sessoesAtivas.size();
    }

    /** Retorna um snapshot read-only das sessões ativas. */
    public Map<String, String> getSessoesAtivas() {
        return Map.copyOf(sessoesAtivas);
    }
}
