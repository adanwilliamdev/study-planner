import { useEffect, useState } from 'react'
import { listarTarefas, criarTarefa, deletarTarefa, atualizarTarefa } from '../services/tarefaService'
import { listarMaterias } from '../services/materiaService'
import { Plus, Trash2 } from 'lucide-react'

const statusCores = {
  A_FAZER: 'bg-gray-200 text-gray-800',
  EM_ANDAMENTO: 'bg-blue-200 text-blue-800',
  CONCLUIDO: 'bg-green-200 text-green-800',
}
const prioCores = {
  ALTA: 'bg-red-200 text-red-800',
  MEDIA: 'bg-yellow-200 text-yellow-800',
  BAIXA: 'bg-green-200 text-green-800',
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([])
  const [materias, setMaterias] = useState([])
  const [form, setForm] = useState({
    titulo: '', descricao: '', dataEntrega: '', prioridade: 'MEDIA',
    status: 'A_FAZER', materiaId: ''
  })

  const carregar = () => Promise.all([listarTarefas(), listarMaterias()])
    .then(([t, m]) => { setTarefas(t); setMaterias(m) })
  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { materiaId, ...tarefa } = form
    await criarTarefa(tarefa, materiaId || null)
    setForm({ titulo: '', descricao: '', dataEntrega: '', prioridade: 'MEDIA',
              status: 'A_FAZER', materiaId: '' })
    carregar()
  }

  const mudarStatus = (t, novo) => atualizarTarefa(t.id, { ...t, status: novo }, t.materia?.id)
    .then(carregar)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tarefas</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-3 gap-2">
        <input placeholder="Título" value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })} required
          className="p-2 border rounded" />
        <input type="date" value={form.dataEntrega}
          onChange={e => setForm({ ...form, dataEntrega: e.target.value })}
          className="p-2 border rounded" />
        <select value={form.prioridade}
          onChange={e => setForm({ ...form, prioridade: e.target.value })}
          className="p-2 border rounded">
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Média</option>
          <option value="BAIXA">Baixa</option>
        </select>
        <select value={form.materiaId}
          onChange={e => setForm({ ...form, materiaId: e.target.value })}
          className="p-2 border rounded">
          <option value="">Sem matéria</option>
          {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <input placeholder="Descrição" value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
          className="p-2 border rounded md:col-span-2" />
        <button className="bg-blue-600 text-white px-4 rounded flex items-center justify-center gap-1">
          <Plus size={18}/> Adicionar
        </button>
      </form>

      <div className="space-y-3">
        {tarefas.map(t => (
          <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold">{t.titulo}</h2>
                <span className={`text-xs px-2 py-0.5 rounded ${prioCores[t.prioridade]}`}>
                  {t.prioridade}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${statusCores[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.descricao}</p>
              <p className="text-xs text-gray-400">
                {t.materia?.nome} {t.dataEntrega && `• ${t.dataEntrega}`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <select value={t.status}
                onChange={e => mudarStatus(t, e.target.value)}
                className="text-xs p-1 border rounded">
                <option value="A_FAZER">A fazer</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
              <button onClick={() => deletarTarefa(t.id).then(carregar)}
                      className="text-red-500 hover:text-red-700">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}