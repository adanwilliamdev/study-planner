import { AlertCircle, Loader2 } from 'lucide-react'

export function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-mute" role="status">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {texto}
    </div>
  )
}

export function ErroCarregar({ mensagem, onTentar }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-10 text-center" role="alert">
      <AlertCircle className="text-red-500" size={28} aria-hidden="true" />
      <p className="text-sm text-ink-soft">{mensagem}</p>
      {onTentar && <button className="btn-primary" onClick={onTentar}>Tentar novamente</button>}
    </div>
  )
}

export function Vazio({ icone: Icone, titulo, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {Icone && <Icone size={28} className="text-ink-mute" aria-hidden="true" />}
      <p className="font-display font-semibold">{titulo}</p>
      {children && <p className="max-w-sm text-sm text-ink-soft">{children}</p>}
    </div>
  )
}

export function Cabecalho({ titulo, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-3xl font-bold">{titulo}</h1>
      {children}
    </header>
  )
}
