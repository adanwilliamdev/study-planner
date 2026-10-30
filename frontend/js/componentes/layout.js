import { h, icone } from '../dom.js'
import { Logo } from './logo.js'
import { TemaToggle } from './tema-toggle.js'
import { iniciais } from '../lib/cores.js'
import { usuario, token, sair } from '../auth.js'
import { navegar } from '../router.js'
import { conectarNotificacoes } from '../ws.js'
import { toast } from '../toast.js'

const LINKS = [
  { to: '/', rotulo: 'Início', icone: 'dashboard', end: true },
  { to: '/tarefas', rotulo: 'Tarefas', icone: 'check-square' },
  { to: '/cronograma', rotulo: 'Cronograma', icone: 'calendar' },
  { to: '/materias', rotulo: 'Matérias', icone: 'book-open' },
]
const PASSO_ITEM = 48 // px: altura do item (2.75rem = 44) + 4 de espaço

export function criarLayout() {
  const u = usuario()
  const sairDaConta = () => { sair(); navegar('/login') }

  const link = (cls, l, tam) => h('a', { href: `#${l.to}`, class: cls, 'data-to': l.to },
    icone(l.icone, { tamanho: tam }), cls === 'nav-link' ? ` ${l.rotulo}` : l.rotulo)

  const destaqueLateral = h('span', { class: 'nav-link__destaque', 'aria-hidden': 'true' }, h('span', { class: 'nav-link__barra' }))
  const destaqueMobile = h('span', { class: 'nav-mobile__destaque', 'aria-hidden': 'true' })

  const navLateral = h('nav', { class: 'lateral__nav', 'aria-label': 'Principal' },
    destaqueLateral, LINKS.map((l) => link('nav-link', l, 19)))
  const navMobile = h('nav', { class: 'nav-mobile', 'aria-label': 'Principal' },
    h('div', { class: 'nav-mobile__trilho' }, destaqueMobile, LINKS.map((l) => link('nav-mobile__link', l, 20))))

  const principal = h('main', { class: 'principal' })

  const el = h('div', { class: 'app' },
    h('aside', { class: 'lateral' },
      h('div', { class: 'lateral__cartao' },
        Logo('lateral__logo'),
        navLateral,
        h('div', { class: 'lateral__usuario' },
          h('div', { class: 'usuario' },
            h('span', { class: 'avatar', 'aria-hidden': 'true' }, iniciais(u?.nome)),
            h('div', { class: 'usuario__dados' },
              h('p', { class: 'usuario__nome' }, u?.nome),
              h('p', { class: 'usuario__email' }, u?.email))),
          h('div', { class: 'lateral__acoes' },
            h('button', { class: 'btn btn-fantasma lateral__sair', onClick: sairDaConta }, icone('log-out', { tamanho: 16 }), ' Sair'),
            TemaToggle())))),
    h('div', { class: 'area' },
      h('header', { class: 'topo-mobile' },
        Logo(),
        h('div', { class: 'topo-mobile__acoes' },
          TemaToggle(),
          h('button', { class: 'btn-icone', 'aria-label': 'Sair', onClick: sairDaConta }, icone('log-out', { tamanho: 18 })))),
      principal),
    navMobile)

  // Notificações de prazo em tempo real, enquanto o layout estiver na tela
  const ws = conectarNotificacoes(token(), (texto) => toast.aviso(texto))

  function atualizarNav(caminho) {
    const ativo = LINKS.findIndex((l) => (l.end ? caminho === l.to : caminho.startsWith(l.to)))
    el.querySelectorAll('[data-to]').forEach((a) => {
      const idx = LINKS.findIndex((l) => l.to === a.dataset.to)
      a.classList.toggle('ativo', idx === ativo)
      if (idx === ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current')
    })
    const visivel = ativo >= 0
    destaqueLateral.hidden = destaqueMobile.hidden = !visivel
    if (visivel) {
      destaqueLateral.style.transform = `translateY(${ativo * PASSO_ITEM}px)`
      destaqueMobile.style.transform = `translateX(${ativo * 100}%)`
    }
  }

  return { el, principal, atualizarNav, destruir: () => ws.parar() }
}
