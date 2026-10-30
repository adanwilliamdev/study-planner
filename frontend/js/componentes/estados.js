import { h, icone } from '../dom.js'

const bloco = (cls) => h('div', { class: `esqueleto ${cls}` })

/** Esqueleto de carregamento. tipo: lista | cards | grade | painel */
export function Carregando(tipo = 'lista', texto = 'Carregando…') {
  let corpo
  if (tipo === 'cards') {
    corpo = h('div', { class: 'grade-cards' }, [0, 1, 2].map(() => bloco('esqueleto--card')))
  } else if (tipo === 'grade') {
    corpo = h('div', { class: 'grade-semana' }, [0, 1, 2, 3, 4, 5, 6].map(() => bloco('esqueleto--dia')))
  } else if (tipo === 'painel') {
    corpo = h('div', { class: 'grade-painel' },
      h('div', { class: 'pilha' }, bloco('esqueleto--h36'), bloco('esqueleto--h52'), bloco('esqueleto--h52')),
      bloco('esqueleto--pomodoro'))
  } else {
    corpo = h('div', { class: 'pilha pilha--pequena' }, [0, 1, 2, 3].map(() => bloco('esqueleto--linha')))
  }
  return h('div', { role: 'status' }, h('span', { class: 'sr-only' }, texto), h('div', { 'aria-hidden': 'true' }, corpo))
}

export function ErroCarregar(mensagem, onTentar) {
  return h('div', { class: 'painel estado estado--erro', role: 'alert' },
    h('span', { class: 'estado__icone estado__icone--erro' }, icone('alert-circle', { tamanho: 24 })),
    h('p', { class: 'estado__texto' }, mensagem),
    onTentar && h('button', { class: 'btn btn-primario', onClick: onTentar }, 'Tentar novamente'))
}

/** nomeIcone e acao são opcionais; filhos = texto de apoio. */
export function Vazio({ icone: nomeIcone, titulo, acao }, ...filhos) {
  return h('div', { class: 'estado estado--vazio' },
    nomeIcone && h('span', { class: 'estado__icone' }, icone(nomeIcone, { tamanho: 26 })),
    h('p', { class: 'estado__titulo' }, titulo),
    filhos.length > 0 && h('p', { class: 'estado__texto' }, ...filhos),
    acao && h('div', { class: 'estado__acao' }, acao))
}

export function Cabecalho(titulo, ...acoes) {
  return h('header', { class: 'cabecalho' }, h('h1', { class: 'titulo-pagina' }, titulo), ...acoes)
}
