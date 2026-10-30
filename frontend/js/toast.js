import { h, icone } from './dom.js'

const ESTILOS = {
  sucesso: { icone: 'check-circle', cor: 'ok-icone' },
  erro: { icone: 'x-circle', cor: 'ruim-icone' },
  aviso: { icone: 'alert-triangle', cor: 'aviso-icone' },
  info: { icone: 'bell', cor: 'link' },
}

let regiao = null
let seq = 0

function garantirRegiao() {
  if (!regiao) {
    regiao = h('div', { class: 'toasts', role: 'region', 'aria-label': 'Notificações', 'aria-live': 'polite' })
    document.body.append(regiao)
  }
  return regiao
}

function mostrar(tipo, texto, duracao = 5000) {
  const r = garantirRegiao()
  const est = ESTILOS[tipo]
  const id = ++seq
  const remover = () => el.remove()
  const el = h('div', { class: `toast toast--${tipo}`, 'data-id': id },
    icone(est.icone, { tamanho: 18, classe: `toast__icone ${est.cor}` }),
    h('p', { class: 'toast__texto' }, texto),
    h('button', { class: 'toast__fechar', 'aria-label': 'Fechar notificação', onClick: remover }, icone('x', { tamanho: 16 })),
  )
  // mantém no máximo 4 avisos na tela
  while (r.children.length > 3) r.firstElementChild.remove()
  r.append(el)
  if (duracao) setTimeout(remover, duracao)
}

export const toast = {
  sucesso: (t) => mostrar('sucesso', t),
  erro: (t) => mostrar('erro', t, 8000),
  aviso: (t) => mostrar('aviso', t, 8000),
  info: (t) => mostrar('info', t, 10000),
}
