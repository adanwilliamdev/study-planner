import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const ESTILOS = {
  claro: { trilho: 'bg-sunken', pilula: 'bg-surface shadow-panel', ativo: 'text-ink', inativo: 'text-ink-mute hover:text-ink' },
  escuro: { trilho: 'bg-white/10', pilula: 'bg-white', ativo: 'text-deep', inativo: 'text-white/70 hover:text-white' },
}

/**
 * Seletor segmentado com a "pílula" deslizando até a opção ativa.
 * opcoes: [[valor, rotulo], ...]
 */
export default function Segmented({ opcoes, valor, onChange, rotulo, variante = 'claro', compacto = false, className = '' }) {
  const botoes = useRef({})
  const [pilula, setPilula] = useState(null)
  const e = ESTILOS[variante]

  const medir = useCallback(() => {
    const el = botoes.current[valor]
    if (!el) return
    const x = el.offsetLeft, w = el.offsetWidth
    setPilula(p => (p && p.x === x && p.w === w ? p : { x, w }))
  }, [valor])

  useLayoutEffect(() => { medir() }, [medir])

  useEffect(() => {
    window.addEventListener('resize', medir)
    document.fonts?.ready?.then(medir)
    return () => window.removeEventListener('resize', medir)
  }, [medir])

  return (
    <div role="group" aria-label={rotulo}
      className={`relative inline-flex max-w-full overflow-x-auto rounded-xl p-1 ${e.trilho} ${className}`}>
      {pilula && (
        <span aria-hidden="true"
          className={`absolute inset-y-1 left-0 rounded-lg transition-[transform,width] duration-500 ease-fluid ${e.pilula}`}
          style={{ width: pilula.w, transform: `translateX(${pilula.x}px)` }} />
      )}
      {opcoes.map(([v, r]) => (
        <button key={v} type="button" ref={(el) => { botoes.current[v] = el }}
          onClick={() => onChange(v)} aria-pressed={valor === v}
          className={`relative z-10 shrink-0 whitespace-nowrap rounded-lg font-semibold transition-colors duration-300 ${
            compacto ? 'px-2.5 py-1.5 text-[13px]' : 'px-3.5 py-1.5 text-sm'} ${valor === v ? e.ativo : e.inativo}`}>
          {r}
        </button>
      ))}
    </div>
  )
}
