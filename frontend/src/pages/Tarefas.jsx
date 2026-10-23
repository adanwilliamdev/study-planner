import { useCallback, useEffect, useMemo, useState } from 'react'
import { Circle, CheckCircle2, ListChecks, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listarTarefas, criarTarefa, atualizarTarefa, deletarTarefa } from '../services/tarefaService'
import { listarMaterias } from '../services/materiaService'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../components/Estados'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { mensagemDeErro } from '../lib/erros'
import { rotuloPrazo } from '../lib/datas'

const PRIORIDADES = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' }
const PRIO_COR = { ALTA: 'bg-red-50 text-red-700', MEDIA: 'bg-amber-50 text-amber-800', BAIXA: 'bg-emerald-50 text-emerald-700' }
const STATUS = { A_FAZER: 'A fazer', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluída' }
const PRAZO_COR = {
  atrasada: 'bg-red-50 text-red-700', urgente: 'bg-amber-50 text-amber-800',
  proxima: 'bg-brand-50 text-brand-700', normal: 'bg-paper text-ink-soft',
}
const FILTROS = [
  ['ABERTAS', 'Abertas'], ['EM_ANDAMENTO', 'Em andamento'], ['CONCLUIDO', 'Concluídas'], ['TODAS', 'Todas'],
]
const FORM_VAZIO = { titulo: '', descricao: '', dataEntrega: '', prioridade: 'MEDIA', status: 'A_FAZER', materiaId: '' }

const paraForm = (t) => ({
  titulo: t.titulo, descricao: t.descricao || '', dataEntrega: t.dataEntrega || '',
  prioridade: t.prioridade, status: t.status, materiaId: t.materia?.id ?? '',
})
const paraPayload = (f) => ({
  ...f, descricao: f.descricao.trim() || null, dataEntrega: f.dataEntrega || null,
  materiaId: f.materiaId === '' ? null : Number(f.materiaId),
})

function FormTarefa({ inicial, materias, onSalvar, onCancelar, rotuloBotao }) {
  const [form, setForm] = useState(inicial)
  const [salvando, setSalvando] = useState(false)
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try { await onSalvar(form) } finally { setSalvando(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="t-titulo" className="field-label">Título</label>
        <input id="t-titulo" className="field" value={form.titulo} onChange={set('titulo')} required maxLength={150} />
      </div>
      <div>
        <label htmlFor="t-desc" className="field-label">Descrição</label>
        <textarea id="t-desc" rows={2} className="field" value={form.descricao} onChange={set('descricao')} maxLength={1000} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="t-data" className="field-label">Prazo</label>
          <input id="t-data" type="date" className="field" value={form.dataEntrega} onChange={set('dataEntrega')} />
        </div>
        <div>
          <label htmlFor="t-materia" className="field-label">Matéria</label>
          <select id="t-materia" className="field" value={form.materiaId} onChange={set('materiaId')}>
            <option value="">Sem matéria</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="t-prio" className="field-label">Prioridade</label>
          <select id="t-prio" className="field" value={form.prioridade} onChange={set('prioridade')}>
            {Object.entries(PRIORIDADES).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="t-status" className="field-label">Status</label>
          <select id="t-status" className="field" value={form.status} onChange={set('status')}>
            {Object.entries(STATUS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn-primary" disabled={salvando}>
          {salvando && <Loader2 size={16} className="animate-spin" />} {rotuloBotao}
        </button>
      </div>
    </form>
  )
}

export default function Tarefas() {
  const toast = useToast()
  const confirmar = useConfirm()
  const [tarefas, setTarefas] = useState(null)
  const [materias, setMaterias] = useState([])
  const [erro, setErro] = useState('')
  const [modal, setModal] = useState(null) // null | { tarefa?: obj }
  const [filtro, setFiltro] = useState('ABERTAS')
  const [filtroMateria, setFiltroMateria] = useState('')

  const carregar = useCallback(() => {
    setErro('')
    return Promise.all([listarTarefas(), listarMaterias()])
      .then(([t, m]) => { setTarefas(t); setMaterias(m) })
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar as tarefas')))
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const visiveis = useMemo(() => (tarefas || []).filter(t => {
    if (filtroMateria && String(t.materia?.id) !== filtroMateria) return false
    if (filtro === 'ABERTAS') return t.status !== 'CONCLUIDO'
    if (filtro === 'TODAS') return true
    return t.status === filtro
  }), [tarefas, filtro, filtroMateria])

  const salvar = async (form) => {
    const edicao = modal?.tarefa
    try {
      if (edicao) await atualizarTarefa(edicao.id, paraPayload(form))
      else await criarTarefa(paraPayload(form))
      toast.sucesso(edicao ? 'Tarefa atualizada' : 'Tarefa criada')
      setModal(null)
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const mudarStatus = async (t, novo) => {
    try { await atualizarTarefa(t.id, paraPayload({ ...paraForm(t), status: novo })); carregar() }
    catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const remover = async (t) => {
    if (!(await confirmar({ titulo: 'Excluir tarefa', mensagem: `Excluir "${t.titulo}"?`, acao: 'Excluir' }))) return
    try { await deletarTarefa(t.id); toast.sucesso('Tarefa excluída'); carregar() }
    catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  return (
    <div>
      <Cabecalho titulo="Tarefas">
        <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> Nova tarefa</button>
      </Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !tarefas ? <Carregando /> : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-panel ring-1 ring-line" role="group" aria-label="Filtrar por status">
              {FILTROS.map(([v, r]) => (
                <button key={v} onClick={() => setFiltro(v)} aria-pressed={filtro === v}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${filtro === v ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-paper'}`}>
                  {r}
                </button>
              ))}
            </div>
            {materias.length > 0 && (
              <select className="field w-auto" aria-label="Filtrar por matéria" value={filtroMateria}
                onChange={e => setFiltroMateria(e.target.value)}>
                <option value="">Todas as matérias</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            )}
          </div>

          {visiveis.length === 0 ? (
            tarefas.length === 0 ? (
              <Vazio icone={ListChecks} titulo="Nenhuma tarefa ainda">Crie sua primeira tarefa para acompanhar prazos e prioridades.</Vazio>
            ) : (
              <Vazio icone={ListChecks} titulo="Nada por aqui">Nenhuma tarefa corresponde aos filtros selecionados.</Vazio>
            )
          ) : (
            <ul className="space-y-2">
              {visiveis.map(t => {
                const feita = t.status === 'CONCLUIDO'
                const prazo = !feita && rotuloPrazo(t.dataEntrega)
                return (
                  <li key={t.id} className="panel flex items-start gap-3 p-3.5">
                    <button className="mt-0.5 shrink-0 text-ink-mute hover:text-brand-600"
                      onClick={() => mudarStatus(t, feita ? 'A_FAZER' : 'CONCLUIDO')}
                      aria-label={feita ? `Reabrir ${t.titulo}` : `Concluir ${t.titulo}`}>
                      {feita ? <CheckCircle2 size={22} className="text-emerald-600" /> : <Circle size={22} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${feita ? 'text-ink-mute line-through' : ''}`}>{t.titulo}</p>
                      {t.descricao && <p className="mt-0.5 text-sm text-ink-soft">{t.descricao}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {t.materia && (
                          <span className="chip bg-paper text-ink-soft">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.materia.cor }} aria-hidden="true" />
                            {t.materia.nome}
                          </span>
                        )}
                        <span className={`chip ${PRIO_COR[t.prioridade]}`}>Prioridade {PRIORIDADES[t.prioridade].toLowerCase()}</span>
                        {prazo && <span className={`chip ${PRAZO_COR[prazo.tom]}`}>{prazo.texto}</span>}
                        {!feita && t.status === 'EM_ANDAMENTO' && <span className="chip bg-brand-50 text-brand-700">Em andamento</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <button className="icon-btn" onClick={() => setModal({ tarefa: t })} aria-label={`Editar ${t.titulo}`}><Pencil size={16} /></button>
                      <button className="icon-btn-danger" onClick={() => remover(t)} aria-label={`Excluir ${t.titulo}`}><Trash2 size={16} /></button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {modal && (
        <Modal titulo={modal.tarefa ? 'Editar tarefa' : 'Nova tarefa'} onClose={() => setModal(null)}>
          <FormTarefa inicial={modal.tarefa ? paraForm(modal.tarefa) : FORM_VAZIO} materias={materias}
            rotuloBotao={modal.tarefa ? 'Salvar' : 'Criar tarefa'}
            onSalvar={salvar} onCancelar={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
