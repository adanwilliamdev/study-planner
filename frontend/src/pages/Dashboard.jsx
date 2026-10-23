import { useEffect, useState } from 'react'
import PomodoroTimer from '../components/PomodoroTimer'
import { listarMaterias } from '../services/materiaService'
import { listarTarefas } from '../services/tarefaService'

export default function Dashboard() {
  const [stats, setStats] = useState({ materias: 0, tarefas: 0, pendentes: 0 })

  useEffect(() => {
    Promise.all([listarMaterias(), listarTarefas()])
      .then(([m, t]) => setStats({
        materias: m.length,
        tarefas: t.length,
        pendentes: t.filter(x => x.status !== 'CONCLUIDO').length
      }))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Matérias</p>
          <p className="text-3xl font-bold">{stats.materias}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Tarefas</p>
          <p className="text-3xl font-bold">{stats.tarefas}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Pendentes</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pendentes}</p>
        </div>
      </div>
      <PomodoroTimer onConcluir={() => alert('Sessão de foco concluída!')} />
    </div>
  )
}