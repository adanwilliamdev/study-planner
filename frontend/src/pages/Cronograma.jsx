import { useEffect, useState } from 'react'
import { listarCronogramas, criarCronograma, concluirCronograma, deletarCronograma } from '../services/cronogramaService'
import { listarMaterias } from '../services/materiaService'
import { Plus, Trash2, CheckCircle } from 'lucide-react'

const dias = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const nomesDias = { MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua', THURSDAY: 'Qui',
                    FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom' }

export default function Cronograma() {
  const [cronogramas, setCronogramas] = useState([])
  const [materias, setMaterias] = useState([])
  const [form, setForm] = useState({
    materiaId: '', diaDaSemana: 'MONDAY',
    horarioInicio: '08:00', horarioFim: '09:00'
  })

  const carregar = () => Promise.all([listarCronogramas(), listarMaterias()])
    .then(([c, m]) => { setCronogramas(c); setMaterias(m) })
  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { materiaId, ...rest } = form
    await criarCronograma(rest, materiaId)
    carregar()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cronograma</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-5 gap-2">
        <select value={form.materiaId} required
          onChange={e => setForm({ ...form, materiaId: e.target.value })}
          className="p-2 border rounded">
          <option value="">Matéria</option>
          {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select value={form.diaDaSemana}
          onChange={e => setForm({ ...form, diaDaSemana: e.target.value })}
          className="p-2 border rounded">
          {dias.map(d => <option key={d} value={d}>{nomesDias[d]}</option>)}
        </select>
        <input type="time" value={form.horarioInicio}
          onChange={e => setForm({ ...form, horarioInicio: e.target.value })}
          className="p-2 border rounded" />
        <input type="time" value={form.horarioFim}
          onChange={e => setForm({ ...form, horarioFim: e.target.value })}
          className="p-2 border rounded" />
        <button className="bg-blue-600 text-white px-4 rounded flex items-center justify-center gap-1">
          <Plus size={18}/> Adicionar
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-3">
        {cronogramas.map(c => (
          <div key={c.id}
               className={`bg-white p-4 rounded shadow border-l-4 ${c.status === 'CONCLUIDO' ? 'opacity-60' : ''}`}
               style={{ borderColor: c.materia?.cor }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{c.materia?.nome}</p>
                <p className="text-sm text-gray-600">
                  {nomesDias[c.diaDaSemana]} • {c.horarioInicio} - {c.horarioFim}
                </p>
              </div>
              <div className="flex gap-2">
                {c.status === 'PENDENTE' && (
                  <button onClick={() => concluirCronograma(c.id).then(carregar)}
                          className="text-green-600 hover:text-green-800">
                    <CheckCircle size={18}/>
                  </button>
                )}
                <button onClick={() => deletarCronograma(c.id).then(carregar)}
                        className="text-red-500 hover:text-red-700">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}