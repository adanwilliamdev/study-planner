import { h } from '../dom.js'
import { Logo } from './logo.js'
import { TemaToggle } from './tema-toggle.js'

// Prévia decorativa do cronograma semanal: [coluna, linha inicial, linhas, cor, matéria]
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
const BLOCOS = [
  [0, 0, 2, '#A5A7FF', 'Cálculo'], [0, 3, 1, '#6EE7C0', 'Inglês'],
  [1, 1, 2, '#FFD04A', 'Física'], [1, 4, 1, '#FF9DBB', 'Leitura'],
  [2, 0, 1, '#FF9DBB', 'Redação'], [2, 2, 2, '#A5A7FF', 'Algoritmos'],
  [3, 0, 1, '#6EE7C0', 'Revisão'], [3, 2, 1, '#FFD04A', 'Química'], [3, 3, 2, '#A5A7FF', 'Estatística'],
  [4, 1, 2, '#6EE7C0', 'Banco de dados'], [4, 4, 1, '#FFD04A', 'Simulado'],
]

function PreviaSemana() {
  return h('div', { class: 'previa', 'aria-hidden': 'true' },
    h('div', { class: 'previa__dias' }, DIAS.map((d) => h('span', {}, d))),
    h('div', { class: 'previa__grade' }, BLOCOS.map(([col, linha, span, cor, nome], i) =>
      h('div', { class: 'previa__bloco', style: {
        gridColumn: String(col + 1), gridRow: `${linha + 1} / span ${span}`,
        backgroundColor: cor, animationDelay: `${120 + i * 70}ms`,
      } }, nome))),
  )
}

export function AuthShell({ titulo, subtitulo, rodape, filhos }) {
  return h('div', { class: 'auth' },
    h('aside', { class: 'auth__lateral' },
      Logo(),
      h('div', { class: 'auth__lema' },
        h('h2', {}, 'Sua semana de estudos, organizada.'),
        h('p', {}, 'Planeje as sessões, acompanhe os prazos e foque com o Pomodoro.')),
      PreviaSemana()),
    h('main', { class: 'auth__principal' },
      TemaToggle('auth__tema'),
      h('div', { class: 'auth__caixa' },
        Logo('auth__logo-mobile'),
        h('h1', { class: 'auth__titulo' }, titulo),
        h('p', { class: 'auth__subtitulo' }, subtitulo),
        filhos,
        h('p', { class: 'auth__rodape' }, rodape))))
}
