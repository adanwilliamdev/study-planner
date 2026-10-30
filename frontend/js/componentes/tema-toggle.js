import { h, icone } from '../dom.js'
import { alternarTema, temaEscuro } from '../tema.js'

const rotulo = () => (temaEscuro() ? 'Ativar tema claro' : 'Ativar tema escuro')

export function TemaToggle(classe = '') {
  const botao = h('button', { type: 'button', class: `btn-icone ${classe}`.trim(), 'data-tema-toggle': '', 'aria-label': rotulo(),
    onClick: () => {
      alternarTema()
      // há mais de um botão na tela (barra lateral e topo mobile): atualiza todos
      document.querySelectorAll('[data-tema-toggle]').forEach((b) => b.setAttribute('aria-label', rotulo()))
    } },
    h('span', { class: 'tema-icones' },
      icone('sun', { tamanho: 18, classe: 'tema-sol' }),
      icone('moon', { tamanho: 18, classe: 'tema-lua' })),
  )
  return botao
}
