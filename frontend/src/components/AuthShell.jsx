import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

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
  return (
    <div aria-hidden="true" className="rounded-3xl bg-white/[.06] p-5 ring-1 ring-white/10">
      <div className="mb-3 grid grid-cols-5 gap-2.5 px-1 text-xs font-semibold text-white/60">
        {DIAS.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-5 gap-2.5" style={{ gridTemplateRows: 'repeat(5, 2.75rem)' }}>
        {BLOCOS.map(([col, linha, span, cor, nome], i) => (
          <div key={nome} className="animate-block-in overflow-hidden rounded-xl px-2.5 py-2 text-[11px] font-bold leading-tight text-deep"
               style={{ gridColumn: col + 1, gridRow: `${linha + 1} / span ${span}`, backgroundColor: cor, animationDelay: `${120 + i * 70}ms` }}>
            {nome}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AuthShell({ titulo, subtitulo, children, rodape }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-deep p-12 text-white lg:flex">
        <Logo />
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-[1.1] xl:text-5xl">Sua semana de estudos, organizada.</h2>
          <p className="mt-4 text-lg text-white/70">Planeje as sessões, acompanhe os prazos e foque com o Pomodoro.</p>
        </div>
        <PreviaSemana />
      </aside>

      <main className="relative flex flex-col items-center justify-center px-5 py-12">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          <h1 className="text-3xl font-bold md:text-4xl">{titulo}</h1>
          <p className="mb-8 mt-2 text-ink-soft">{subtitulo}</p>
          {children}
          <p className="mt-8 text-sm text-ink-soft">{rodape}</p>
        </div>
      </main>
    </div>
  )
}
