import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

const MODOS = {
  foco: { rotulo: 'Foco', minutos: 25, cor: '#2C43C9' },
  pausa: { rotulo: 'Pausa curta', minutos: 5, cor: '#059669' },
  longa: { rotulo: 'Pausa longa', minutos: 15, cor: '#059669' },
}
const R = 54
const CIRC = 2 * Math.PI * R

const fmt = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function PomodoroTimer({ onFocoConcluido }) {
  const [modo, setModo] = useState('foco')
  const [restante, setRestante] = useState(MODOS.foco.minutos * 60000)
  const [ativo, setAtivo] = useState(false)
  const [ciclos, setCiclos] = useState(0) // focos concluidos
  const fimRef = useRef(0)
  const callbackRef = useRef(onFocoConcluido)
  callbackRef.current = onFocoConcluido

  const total = MODOS[modo].minutos * 60000

  const irPara = useCallback((novoModo) => {
    setModo(novoModo)
    setRestante(MODOS[novoModo].minutos * 60000)
    setAtivo(false)
  }, [])

  const concluir = useCallback((ciclosAtuais) => {
    if (modo === 'foco') {
      const novo = ciclosAtuais + 1
      setCiclos(novo)
      callbackRef.current?.(novo)
      irPara(novo % 4 === 0 ? 'longa' : 'pausa')
    } else {
      irPara('foco')
    }
  }, [modo, irPara])

  // Conta pelo horario de termino: nao "desliza" mesmo se a aba ficar em segundo plano
  useEffect(() => {
    if (!ativo) return
    fimRef.current = Date.now() + restante
    const id = setInterval(() => {
      const falta = fimRef.current - Date.now()
      if (falta <= 0) { clearInterval(id); concluir(ciclos) }
      else setRestante(falta)
    }, 250)
    return () => clearInterval(id)
    // restante fica de fora de proposito: so (re)inicia ao dar play ou trocar de modo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, modo, ciclos, concluir])

  useEffect(() => {
    document.title = ativo ? `${fmt(restante)} · ${MODOS[modo].rotulo}` : 'Study Planner'
    return () => { document.title = 'Study Planner' }
  }, [ativo, restante, modo])

  // Pular nao conta como foco concluido
  const pular = () => irPara(modo === 'foco' ? 'pausa' : 'foco')

  const progresso = 1 - restante / total
  const cor = MODOS[modo].cor

  return (
    <section className="panel flex flex-col items-center p-6" aria-label="Timer Pomodoro">
      <div className="mb-4 flex rounded-lg bg-paper p-1 text-sm font-semibold" role="group" aria-label="Modo">
        {Object.entries(MODOS).map(([chave, m]) => (
          <button key={chave} onClick={() => irPara(chave)} aria-pressed={modo === chave}
            className={`rounded-md px-3 py-1 transition-colors ${modo === chave ? 'bg-white text-ink shadow-sm' : 'text-ink-mute hover:text-ink'}`}>
            {m.rotulo}
          </button>
        ))}
      </div>

      <div className="relative h-44 w-44">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#E2E5EF" strokeWidth="8" />
          <circle cx="60" cy="60" r={R} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progresso)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold tabular-nums" role="timer" aria-live="off">{fmt(restante)}</span>
          <span className="text-xs text-ink-mute">{ciclos} {ciclos === 1 ? 'foco concluído' : 'focos concluídos'}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button onClick={() => irPara(modo)} className="icon-btn h-10 w-10" aria-label="Reiniciar"><RotateCcw size={18} /></button>
        <button onClick={() => setAtivo(a => !a)} className="btn-primary h-12 min-w-[7.5rem] text-base">
          {ativo ? <><Pause size={18} /> Pausar</> : <><Play size={18} /> {restante < total ? 'Continuar' : 'Iniciar'}</>}
        </button>
        <button onClick={pular} className="icon-btn h-10 w-10" aria-label="Pular para a próxima etapa"><SkipForward size={18} /></button>
      </div>
    </section>
  )
}
