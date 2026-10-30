import { autenticado } from './auth.js'
import { h } from './dom.js'
import { fecharTodosModais } from './modal.js'

// Roteador por hash (#/tarefas): funciona em qualquer servidor estático, sem configuração.
// tabela: { '/caminho': { publica?: bool, pagina: () => ({ el, destruir? }) } }
export function iniciarRouter({ raiz, tabela, criarLayout }) {
  let layout = null
  let atual = null

  const navegarPara = (caminho) => location.replace(`#${caminho}`)

  function desmontarPagina() { fecharTodosModais(); atual?.destruir?.(); atual = null }
  function desmontarLayout() { layout?.destruir?.(); layout = null }

  function resolver() {
    const caminho = location.hash.slice(1) || '/'
    const rota = tabela[caminho]
    if (!rota) return navegarPara('/')
    const logado = autenticado()
    if (rota.publica && logado) return navegarPara('/')
    if (!rota.publica && !logado) return navegarPara('/login')

    desmontarPagina()
    if (rota.publica) {
      desmontarLayout()
      atual = rota.pagina()
      raiz.replaceChildren(atual.el)
    } else {
      if (!layout) { layout = criarLayout(); raiz.replaceChildren(layout.el) }
      layout.atualizarNav(caminho)
      atual = rota.pagina()
      // trocar o wrapper reinicia a animação de entrada da página
      layout.principal.replaceChildren(h('div', { class: 'pagina-anim' }, atual.el))
    }
  }

  window.addEventListener('hashchange', resolver)
  resolver()
}

export const navegar = (caminho) => { location.hash = `#${caminho}` }
