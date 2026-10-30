// Endereços do backend. Substitui o antigo .env (VITE_API_URL / VITE_WS_URL).
// O endpoint /ws do Spring usa SockJS, que também expõe o WebSocket puro em /ws/websocket,
// então o navegador conecta direto, sem biblioteca.
export const API_URL = 'http://localhost:8080/api'
export const WS_URL = 'ws://localhost:8080/ws/websocket'
