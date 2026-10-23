import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ titulo, onClose, children, largura = 'max-w-lg' }) {
  const painel = useRef(null)
  const fechar = useRef(onClose)
  fechar.current = onClose // sempre a versao mais recente, sem reexecutar o efeito

  useEffect(() => {
    const anterior = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') fechar.current()
      if (e.key === 'Tab' && painel.current) { // mantem o foco dentro do dialogo
        const itens = painel.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!itens.length) return
        const primeiro = itens[0], ultimo = itens[itens.length - 1]
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const alvo = painel.current?.querySelector('input, select, textarea') || painel.current?.querySelector('button:not([aria-label])')
    alvo?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={painel} role="dialog" aria-modal="true" aria-label={titulo}
           className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-pop sm:rounded-2xl ${largura}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button className="icon-btn -mr-2 -mt-1" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
