import { useEffect, useState } from 'react'
import { listarMaterias, criarMateria, deletarMateria } from '../services/materiaService'
import { Plus, Trash2 } from 'lucide-react'

export default function Materias() {
  const [materias, setMaterias] = useState([])
  const [form, setForm] = useState({ nome: '', cor: '#3b82f6', cargaHoraria: 0 })

  const carregar = () => listarMaterias().then(setMaterias)
  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await criarMateria(form)
    setForm({ nome: '', cor: '#3b82f6', cargaHoraria: 0 })
    carregar()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Matérias</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 flex gap-2 flex-wrap">
        <input placeholder="Nome" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })} required
          className="p-2 border rounded flex-1 min-w-[150px]" />
        <input type="number" placeholder="Carga horária" value={form.cargaHoraria}
          onChange={e => setForm({ ...form, cargaHoraria: +e.target.value })}
          className="p-2 border rounded w-32" />
        <input type="color" value={form.cor}
          onChange={e => setForm({ ...form, cor: e.target.value })}
          className="p-1 border rounded h-10" />
        <button className="bg-blue-600 text-white px-4 rounded flex items-center gap-1">
          <Plus size={18}/> Adicionar
        </button>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {materias.map(m => (
          <div key={m.id} className="bg-white p-4 rounded shadow border-l-4"
               style={{ borderColor: m.cor }}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold">{m.nome}</h2>
                <p className="text-sm text-gray-500">{m.cargaHoraria}h</p>
              </div>
              <button onClick={() => { deletarMateria(m.id).then(carregar) }}
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