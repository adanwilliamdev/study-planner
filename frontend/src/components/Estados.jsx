import { AlertCircle } from 'lucide-react'

const LISTA = [0, 1, 2, 3]

/** Esqueleto de carregamento. tipo: lista | cards | grade | painel */
export function Carregando({ texto = 'Carregando…', tipo = 'lista' }) {
  let corpo
  if (tipo === 'cards') {
    corpo = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map(i => <div key={i} className="skeleton h-40" />)}
      </div>
    )
  } else if (tipo === 'grade') {
    corpo = (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 lg:h-72" />)}
      </div>
    )
  } else if (tipo === 'painel') {
    corpo = (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-6">
          <div className="skeleton h-36" />
          <div className="skeleton h-52" />
          <div className="skeleton h-52" />
        </div>
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    )
  } else {
    corpo = <div className="space-y-2.5">{LISTA.map(i => <div key={i} className="skeleton h-[4.5rem]" />)}</div>
  }
  return (
    <div role="status">
      <span className="sr-only">{texto}</span>
      <div aria-hidden="true">{corpo}</div>
    </div>
  )
}

export function ErroCarregar({ mensagem, onTentar }) {
  return (
    <div className="panel flex flex-col items-center gap-4 px-6 py-12 text-center" role="alert">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bad-bg text-bad-icon">
        <AlertCircle size={24} aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm text-ink-soft">{mensagem}</p>
      {onTentar && <button className="btn-primary" onClick={onTentar}>Tentar novamente</button>}
    </div>
  )
}

export function Vazio({ icone: Icone, titulo, children, acao }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
      {Icone && (
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-link">
          <Icone size={26} aria-hidden="true" />
        </span>
      )}
      <p className="font-display text-lg font-semibold">{titulo}</p>
      {children && <p className="max-w-sm text-sm text-ink-soft">{children}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  )
}

export function Cabecalho({ titulo, subtitulo, children }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold leading-tight md:text-[2.5rem]">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-ink-soft">{subtitulo}</p>}
      </div>
      {children}
    </header>
  )
}
