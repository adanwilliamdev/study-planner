import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const ESTILOS = {
  sucesso: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-900', Icone: CheckCircle2, cor: 'text-emerald-600' },
  erro: { cls: 'border-red-200 bg-red-50 text-red-900', Icone: XCircle, cor: 'text-red-600' },
  aviso: { cls: 'border-amber-200 bg-amber-50 text-amber-900', Icone: AlertTriangle, cor: 'text-amber-600' },
  info: { cls: 'border-brand-200 bg-brand-50 text-brand-900', Icone: Bell, cor: 'text-brand-600' },
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
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
           role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map(({ id, tipo, texto }) => {
          const { cls, Icone, cor } = ESTILOS[tipo]
          return (
            <div key={id} className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border p-3 shadow-pop ${cls}`}>
              <Icone size={18} className={`mt-0.5 shrink-0 ${cor}`} aria-hidden="true" />
              <p className="flex-1 text-sm">{texto}</p>
              <button onClick={() => remover(id)} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Fechar notificação">
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
