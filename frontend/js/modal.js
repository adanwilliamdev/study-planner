import { h, icone } from './dom.js'

const abertos = new Set()

/** Fecha todos os diálogos abertos (usado ao trocar de página). */
export function fecharTodosModais() { [...abertos].forEach((m) => m.fechar()) }

/**
 * Abre um diálogo. corpo(modal) devolve o conteúdo; modal.fechar() toca a animação de saída.
 * largura: 'sm' | 'md' | 'lg'. aoFechar roda depois da animação.
 */
export function abrirModal({ titulo, corpo, largura = 'lg', aoFechar }) {
  const anterior = document.activeElement
  let fechando = false
  const modal = { fechar }
  abertos.add(modal)

  const painel = h('div', { class: `modal modal--${largura}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
    h('div', { class: 'modal__alca', 'aria-hidden': 'true' }),
    h('div', { class: 'modal__topo' },
      h('h2', { class: 'modal__titulo' }, titulo),
      h('button', { class: 'btn-icone modal__fechar', 'aria-label': 'Fechar', onClick: () => fechar() }, icone('x', { tamanho: 18 })),
    ),
    corpo(modal),
  )
  const fundo = h('div', { class: 'modal-fundo', onMouseDown: (e) => { if (e.target === fundo) fechar() } }, painel)

  function onKey(e) {
    if (e.key === 'Escape') fechar()
    if (e.key === 'Tab') { // mantem o foco dentro do dialogo
      const itens = painel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!itens.length) return
      const primeiro = itens[0], ultimo = itens[itens.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
    }
  }

  function fechar() {
    if (fechando) return
    fechando = true
    fundo.classList.add('saindo')
    setTimeout(() => {
      document.removeEventListener('keydown', onKey)
      fundo.remove()
      abertos.delete(modal)
      document.body.style.overflow = ''
      anterior?.focus?.()
      aoFechar?.()
    }, 160)
  }

  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
  document.body.append(fundo)
  const alvo = painel.querySelector('input, select, textarea') || painel.querySelector('button:not([aria-label])')
  alvo?.focus()
  return modal
}

/** Uso: if (await confirmar({ titulo, mensagem, acao })) ... */
export function confirmar({ titulo, mensagem, acao = 'Confirmar' }) {
  return new Promise((resolve) => {
    abrirModal({
      titulo, largura: 'sm', aoFechar: () => resolve(false),
      corpo: (modal) => h('div', {},
        h('p', { class: 'texto-suave texto-pequeno' }, mensagem),
        h('div', { class: 'modal__acoes' },
          h('button', { class: 'btn btn-fantasma', onClick: () => modal.fechar() }, 'Cancelar'),
          h('button', { class: 'btn btn-perigo', onClick: () => { resolve(true); modal.fechar() } }, acao),
        ),
      ),
    })
  })
}
