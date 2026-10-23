import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function PomodoroTimer({ onConcluir }) {
  const [minutos, setMinutos] = useState(25)
  const [segundos, setSegundos] = useState(0)
  const [ativo, setAtivo] = useState(false)
  const [modo, setModo] = useState('foco')

  useEffect(() => {
    if (!ativo) return
    const id = setInterval(() => {
      if (segundos > 0) setSegundos(s => s - 1)
      else if (minutos > 0) { setMinutos(m => m - 1); setSegundos(59) }
      else {
        setAtivo(false)
        if (modo === 'foco') { onConcluir?.(); setModo('descanso'); setMinutos(5) }
        else { setModo('foco'); setMinutos(25) }
        setSegundos(0)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [ativo, minutos, segundos, modo, onConcluir])

  const reset = () => { setAtivo(false); setMinutos(25); setSegundos(0); setModo('foco') }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-2">Timer Pomodoro</h2>
      <p className="text-sm text-gray-500 mb-4 capitalize">{modo}</p>
      <div className="text-6xl font-mono mb-4">
        {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={() => setAtivo(!ativo)}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          {ativo ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={reset}
          className="p-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400">
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  )
}