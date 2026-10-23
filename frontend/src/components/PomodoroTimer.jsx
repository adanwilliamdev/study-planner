import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import Segmented from './Segmented'

const MODOS = {
  foco: { rotulo: 'Foco', minutos: 25, cor: '#FFD04A' },
  pausa: { rotulo: 'Pausa curta', minutos: 5, cor: '#5EE0B5' },
  longa: { rotulo: 'Pausa longa', minutos: 15, cor: '#5EE0B5' },
}
const OPCOES = Object.entries(MODOS).map(([chave, m]) => [chave, m.rotulo])
const R = 54
const CIRC = 2 * Math.PI * R

const fmt = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// Cada dígito ocupa uma largura fixa, então o relógio não "pula" a cada segundo
function Digitos({ texto }) {
  return (
    <span className="inline-flex items-baseline font-display text-[3.5rem] font-bold leading-none"
          role="timer" aria-live="off" aria-label={texto}>
      {texto.split('').map((c, i) => (c === ':'
        ? <span key={i} className="mx-0.5 -translate-y-1 opacity-60" aria-hidden="true">:</span>
        : <span key={i} className="inline-block w-[0.62em] text-center" aria-hidden="true">{c}</span>))}
    </span>
  )
}

export default function PomodoroTimer({ onFocoConcluido, className = '' }) {
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
  const naRodada = modo === 'longa' ? 4 : ciclos % 4
  const rotuloPlay = ativo ? 'Pausar' : restante < total ? 'Continuar' : 'Iniciar'

  return (
    <section className={`flex flex-col items-center rounded-3xl bg-deep p-6 text-white shadow-pop ring-1 ring-white/10 ${className}`}
             aria-label="Timer Pomodoro">
      <Segmented opcoes={OPCOES} valor={modo} onChange={irPara} rotulo="Modo" variante="escuro" compacto />

      <div className="relative mt-7 h-56 w-56">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90 overflow-visible" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="6" />
          <circle cx="60" cy="60" r={R} fill="none" stroke={cor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progresso)}
            style={{ transition: 'stroke-dashoffset .3s linear, stroke .4s ease', filter: `drop-shadow(0 0 6px ${cor}88)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Digitos texto={fmt(restante)} />
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                      style={{ backgroundColor: i < naRodada ? cor : 'rgb(255 255 255 / .22)' }} />
              ))}
            </span>
            <span className="text-xs text-white/65">{ciclos} {ciclos === 1 ? 'foco concluído' : 'focos concluídos'}</span>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-3">
        <button onClick={() => irPara(modo)} aria-label="Reiniciar"
          className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition duration-200 hover:bg-white/10 hover:text-white active:scale-90">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => setAtivo(a => !a)}
          className="inline-flex h-14 min-w-[9.5rem] items-center justify-center gap-2 rounded-full text-base font-bold text-deep transition duration-300 ease-fluid hover:brightness-110 active:scale-95"
          style={{ backgroundColor: cor, boxShadow: `0 10px 28px -10px ${cor}` }}>
          {ativo ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />} {rotuloPlay}
        </button>
        <button onClick={pular} aria-label="Pular para a próxima etapa"
          className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition duration-200 hover:bg-white/10 hover:text-white active:scale-90">
          <SkipForward size={18} />
        </button>
      </div>
    </section>
  )
}
