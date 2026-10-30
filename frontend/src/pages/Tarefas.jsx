import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ListChecks, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listarTarefas, criarTarefa, atualizarTarefa, deletarTarefa } from '../services/tarefaService'
import { listarMaterias } from '../services/materiaService'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../components/Estados'
import Modal from '../components/Modal'
import Segmented from '../components/Segmented'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { mensagemDeErro } from '../lib/erros'
import { rotuloPrazo } from '../lib/datas'

const PRIORIDADES = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' }
const PRIO_COR = { ALTA: 'tone-bad', MEDIA: 'tone-warn', BAIXA: 'tone-ok' }
const STATUS = { A_FAZER: 'A fazer', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluída' }
const PRAZO_COR = { atrasada: 'tone-bad', urgente: 'tone-warn', proxima: 'tone-brand', normal: 'tone-neutral' }
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
        <textarea id="t-desc" rows={2} className="field resize-none" value={form.descricao} onChange={set('descricao')} maxLength={1000} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn-primary" disabled={salvando}>
          {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} {rotuloBotao}
        </button>
      </div>
    </form>
  )
}

/** Botão de conclusão: o círculo enche e o "visto" é desenhado. */
function Marca({ feita, onClick, rotulo }) {
  return (
    <button onClick={onClick} aria-label={rotulo} aria-pressed={feita}
      className="group/marca -m-1 mt-0 grid h-8 w-8 shrink-0 place-items-center rounded-full">
      <span className={`grid h-6 w-6 place-items-center rounded-full border-2 transition-all duration-300 ease-spring ${
        feita ? 'scale-100 border-ok-icon bg-ok-icon' : 'border-ink-mute/50 group-hover/marca:scale-110 group-hover/marca:border-brand-500'}`}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white dark:text-deep" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: feita ? 0 : 1, transition: 'stroke-dashoffset .4s cubic-bezier(.22,1,.36,1) .08s' }} />
        </svg>
      </span>
    </button>
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
  // id -> 'fica' | 'sai': tarefas que acabaram de mudar e ainda animam antes de sair da lista
  const [recentes, setRecentes] = useState({})
  const timers = useRef({})

  useEffect(() => () => Object.values(timers.current).flat().forEach(clearTimeout), [])
  const agendar = (id, fn, ms) => {
    const lista = timers.current[id] || []
    lista.push(setTimeout(fn, ms))
    timers.current[id] = lista
  }
  const limparTimers = (id) => {
    const lista = timers.current[id] || []
    lista.forEach(clearTimeout)
    timers.current[id] = []
  }

  const carregar = useCallback(() => {
    setErro('')
    return Promise.all([listarTarefas(), listarMaterias()])
      .then(([t, m]) => { setTarefas(t); setMaterias(m) })
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar as tarefas')))
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const visiveis = useMemo(() => (tarefas || []).filter(t => {
    if (filtroMateria && String(t.materia?.id) !== filtroMateria) return false
    if (recentes[t.id]) return true
    if (filtro === 'ABERTAS') return t.status !== 'CONCLUIDO'
    if (filtro === 'TODAS') return true
    return t.status === filtro
  }), [tarefas, filtro, filtroMateria, recentes])

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
    try {
      await atualizarTarefa(t.id, paraPayload({ ...paraForm(t), status: novo }))
      setTarefas(ts => ts.map(x => (x.id === t.id ? { ...x, status: novo } : x)))
      const continuaNoFiltro = filtro === 'TODAS' || (filtro === 'ABERTAS' ? novo !== 'CONCLUIDO' : filtro === novo)
      if (continuaNoFiltro) { carregar(); return }
      // Sai do filtro atual: deixa o risco desenhar e só então recolhe a linha
      limparTimers(t.id)
      setRecentes(r => ({ ...r, [t.id]: 'fica' }))
      agendar(t.id, () => setRecentes(r => (r[t.id] ? { ...r, [t.id]: 'sai' } : r)), 900)
      agendar(t.id, () => {
        setRecentes(r => { const { [t.id]: _saiu, ...resto } = r; return resto })
        carregar()
      }, 1250)
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const remover = async (t) => {
    if (!(await confirmar({ titulo: 'Excluir tarefa', mensagem: `Excluir "${t.titulo}"?`, acao: 'Excluir' }))) return
    try {
      await deletarTarefa(t.id)
      toast.sucesso('Tarefa excluída')
      limparTimers(t.id)
      setRecentes(r => ({ ...r, [t.id]: 'sai' }))
      agendar(t.id, () => carregar(), 320)
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const novaTarefa = (
    <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} aria-hidden="true" /> Nova tarefa</button>
  )

  return (
    <div>
      <Cabecalho titulo="Tarefas">{novaTarefa}</Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !tarefas ? <Carregando tipo="lista" /> : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Segmented opcoes={FILTROS} valor={filtro} onChange={setFiltro} rotulo="Filtrar por status" />
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
              <Vazio icone={ListChecks} titulo="Nenhuma tarefa ainda" acao={novaTarefa}>
                Crie sua primeira tarefa para acompanhar prazos e prioridades.
              </Vazio>
            ) : (
              <Vazio icone={ListChecks} titulo="Nada por aqui">Nenhuma tarefa corresponde aos filtros selecionados.</Vazio>
            )
          ) : (
            <ul>
              {visiveis.map(t => {
                const feita = t.status === 'CONCLUIDO'
                const prazo = !feita && rotuloPrazo(t.dataEntrega)
                const saindo = recentes[t.id] === 'sai'
                return (
                  <li key={t.id}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-fluid ${saindo ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
                    <div className="-mx-1 -mt-1 min-h-0 overflow-hidden px-1 pt-1">
                      <div className="pb-2.5">
                        <div className="panel panel-flat flex items-start gap-3.5 p-4">
                          <Marca feita={feita} onClick={() => mudarStatus(t, feita ? 'A_FAZER' : 'CONCLUIDO')}
                            rotulo={feita ? `Reabrir ${t.titulo}` : `Concluir ${t.titulo}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug">
                              <span className={`strike ${feita ? 'is-done text-ink-mute' : ''}`}>{t.titulo}</span>
                            </p>
                            {t.descricao && <p className={`mt-1 text-sm ${feita ? 'text-ink-mute' : 'text-ink-soft'}`}>{t.descricao}</p>}
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                              {t.materia && (
                                <span className="chip tone-neutral">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.materia.cor }} aria-hidden="true" />
                                  {t.materia.nome}
                                </span>
                              )}
                              <span className={`chip ${PRIO_COR[t.prioridade]}`}>Prioridade {PRIORIDADES[t.prioridade].toLowerCase()}</span>
                              {prazo && <span className={`chip ${PRAZO_COR[prazo.tom]}`}>{prazo.texto}</span>}
                              {!feita && t.status === 'EM_ANDAMENTO' && <span className="chip tone-brand">Em andamento</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <button className="icon-btn" onClick={() => setModal({ tarefa: t })} aria-label={`Editar ${t.titulo}`}><Pencil size={16} /></button>
                            <button className="icon-btn-danger" onClick={() => remover(t)} aria-label={`Excluir ${t.titulo}`}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
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
