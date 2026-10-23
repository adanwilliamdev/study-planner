import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const ESTILOS = {
  sucesso: { cls: 'border-ok-line bg-ok-bg text-ok-fg', Icone: CheckCircle2, cor: 'text-ok-icon' },
  erro: { cls: 'border-bad-line bg-bad-bg text-bad-fg', Icone: XCircle, cor: 'text-bad-icon' },
  aviso: { cls: 'border-warn-line bg-warn-bg text-warn-fg', Icone: AlertTriangle, cor: 'text-warn-icon' },
  info: { cls: 'border-brand-200 bg-brand-50 text-brand-700', Icone: Bell, cor: 'text-link' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const remover = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const mostrar = useCallback((tipo, texto, duracao = 5000) => {
    const id = ++seq.current
    setToasts((t) => [...t.slice(-3), { id, tipo, texto }])
    if (duracao) setTimeout(() => remover(id), duracao)
  }, [remover])

  const api = useMemo(() => ({
    sucesso: (t) => mostrar('sucesso', t),
    erro: (t) => mostrar('erro', t, 8000),
    aviso: (t) => mostrar('aviso', t, 8000),
    info: (t) => mostrar('info', t, 10000),
  }), [mostrar])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
           role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map(({ id, tipo, texto }) => {
          const { cls, Icone, cor } = ESTILOS[tipo]
          return (
            <div key={id} className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl border p-3.5 shadow-pop ${cls}`}>
              <Icone size={18} className={`mt-0.5 shrink-0 ${cor}`} aria-hidden="true" />
              <p className="flex-1 text-sm">{texto}</p>
              <button onClick={() => remover(id)} className="-m-1 shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100" aria-label="Fechar notificação">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
