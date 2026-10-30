import { h } from '../dom.js'

/**
 * Seletor segmentado com a "pílula" deslizando até a opção ativa.
 * opcoes: [[valor, rotulo], ...]. Devolve { el, definir(valor) }.
 */
export function Segmentado({ opcoes, valor, onChange, rotulo, variante = 'claro', compacto = false }) {
  const botoes = {}
  const pilula = h('span', { class: 'segmentado__pilula', 'aria-hidden': 'true' })
  const el = h('div', { role: 'group', 'aria-label': rotulo, class: `segmentado segmentado--${variante}` }, pilula)

  for (const [v, r] of opcoes) {
    botoes[v] = h('button', { type: 'button', class: `segmentado__botao ${compacto ? 'segmentado__botao--compacto' : ''}`,
      onClick: () => { definir(v); onChange(v) } }, r)
    el.append(botoes[v])
  }

  let primeira = true
  function medir() {
    const b = botoes[valor]
    if (!b || !b.offsetWidth) return
    if (primeira) { // posiciona sem animar na primeira medição
      pilula.style.transition = 'none'
      requestAnimationFrame(() => requestAnimationFrame(() => { pilula.style.transition = '' }))
      primeira = false
    }
    pilula.style.width = `${b.offsetWidth}px`
    pilula.style.transform = `translateX(${b.offsetLeft}px)`
  }

  function definir(novo) {
    valor = novo
    for (const [v, b] of Object.entries(botoes)) {
      b.setAttribute('aria-pressed', String(v === valor))
      b.classList.toggle('ativo', v === valor)
    }
    medir()
  }

  // Só dá para medir depois que o elemento entra na página; o observer também cobre redimensionamentos
  new ResizeObserver(medir).observe(el)
  document.fonts?.ready?.then(medir)
  definir(valor)
  return { el, definir }
}
