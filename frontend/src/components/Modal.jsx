import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export default function Modal({ titulo, onClose, children, largura = 'max-w-lg' }) {
  const painel = useRef(null)
  const fechar = useRef(onClose)
  fechar.current = onClose // sempre a versao mais recente, sem reexecutar o efeito
  const [saindo, setSaindo] = useState(false)
  const saindoRef = useRef(false)
  const timer = useRef(null)

  // Toca a animação de saída antes de avisar o pai
  const pedirFechar = useCallback(() => {
    if (saindoRef.current) return
    saindoRef.current = true
    setSaindo(true)
    timer.current = window.setTimeout(() => fechar.current(), 160)
  }, [])

  useEffect(() => {
    const anterior = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') pedirFechar()
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
      window.clearTimeout(timer.current)
      anterior?.focus?.()
    }
  }, [pedirFechar])

  return (
    <div className={`fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 ${saindo ? 'animate-fade-out' : 'animate-fade-in'}`}
         onMouseDown={(e) => { if (e.target === e.currentTarget) pedirFechar() }}>
      <div ref={painel} role="dialog" aria-modal="true" aria-label={titulo}
           className={`max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl sm:pb-6 ${largura} ${saindo ? 'animate-sheet-out' : 'animate-sheet-in'}`}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button className="icon-btn -mr-2 -mt-1" onClick={pedirFechar} aria-label="Fechar"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
