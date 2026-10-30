import { h, icone } from '../dom.js'

/** Campo de senha com botão para mostrar/ocultar. attrs vão para o <input>. Devolve { el, input }. */
export function CampoSenha(attrs = {}) {
  const input = h('input', { ...attrs, type: 'password', class: 'campo campo--com-botao' })
  const botao = h('button', { type: 'button', class: 'btn-icone campo-senha__botao', 'aria-pressed': 'false', 'aria-label': 'Mostrar senha',
    onClick: () => {
      const ver = input.type === 'password'
      input.type = ver ? 'text' : 'password'
      botao.setAttribute('aria-pressed', String(ver))
      botao.setAttribute('aria-label', ver ? 'Ocultar senha' : 'Mostrar senha')
      botao.replaceChildren(icone(ver ? 'eye-off' : 'eye', { tamanho: 16 }))
    } }, icone('eye', { tamanho: 16 }))
  return { el: h('div', { class: 'campo-senha' }, input, botao), input }
}
