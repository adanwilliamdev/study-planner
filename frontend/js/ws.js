import { WS_URL } from './config.js'

// Cliente STOMP mínimo sobre WebSocket nativo (substitui sockjs-client + @stomp/stompjs).
// Só implementa o necessário: CONNECT com JWT, SUBSCRIBE e leitura de MESSAGE.

const NUL = '\0'

const montarFrame = (comando, headers = {}) =>
  `${comando}\n${Object.entries(headers).map(([k, v]) => `${k}:${v}`).join('\n')}\n\n${NUL}`

function lerFrames(texto) {
  return texto.split(NUL).map((bruto) => bruto.replace(/^\n+/, '')).filter(Boolean).map((bruto) => {
    const [cabecalho, ...resto] = bruto.split('\n\n')
    const [comando, ...linhas] = cabecalho.split('\n')
    const headers = {}
    for (const l of linhas) { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i)] = l.slice(i + 1) }
    return { comando, headers, corpo: resto.join('\n\n') }
  })
}

/** Conecta, assina /user/queue/notifications e reconecta a cada 10 s se cair. Devolve { parar }. */
export function conectarNotificacoes(token, aoReceber) {
  let ws = null
  let timer = null
  let parado = false

  const abrir = () => {
    ws = new WebSocket(WS_URL)
    ws.onopen = () => ws.send(montarFrame('CONNECT', {
      'accept-version': '1.2', 'heart-beat': '0,0', Authorization: `Bearer ${token}`,
    }))
    ws.onmessage = (ev) => {
      if (typeof ev.data !== 'string') return
      for (const f of lerFrames(ev.data)) {
        if (f.comando === 'CONNECTED') {
          ws.send(montarFrame('SUBSCRIBE', { id: 'sub-0', destination: '/user/queue/notifications', ack: 'auto' }))
        } else if (f.comando === 'MESSAGE') aoReceber(f.corpo)
        else if (f.comando === 'ERROR') ws.close()
      }
    }
    ws.onclose = () => { if (!parado) timer = setTimeout(abrir, 10000) }
  }

  abrir()
  return {
    parar() {
      parado = true
      clearTimeout(timer)
      if (ws && ws.readyState <= 1) ws.close()
    },
  }
}
