import { useCallback, useEffect, useState } from 'react'
import { BookOpen, ChevronDown, ExternalLink, FileText, Link2, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listarMaterias, criarMateria, atualizarMateria, deletarMateria } from '../services/materiaService'
import { listarTarefas } from '../services/tarefaService'
import { listarMateriaisPorMateria, criarMaterial, deletarMaterial } from '../services/materialService'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../components/Estados'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { mensagemDeErro } from '../lib/erros'

const COR_PADRAO = '#3b82f6'
const FORM_VAZIO = { nome: '', cor: COR_PADRAO, cargaHoraria: 0 }
const TIPOS = { LINK: 'Link', PDF: 'PDF', RESUMO: 'Resumo' }

function FormMateria({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(inicial)
  const [salvando, setSalvando] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try { await onSalvar(form) } finally { setSalvando(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="mat-nome" className="field-label">Nome</label>
        <input id="mat-nome" className="field" value={form.nome} required maxLength={100}
          onChange={e => setForm({ ...form, nome: e.target.value })} />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor="mat-carga" className="field-label">Carga horária (h)</label>
          <input id="mat-carga" type="number" min="0" className="field" value={form.cargaHoraria}
            onChange={e => setForm({ ...form, cargaHoraria: Math.max(0, +e.target.value || 0) })} />
        </div>
        <div>
          <label htmlFor="mat-cor" className="field-label">Cor</label>
          <input id="mat-cor" type="color" value={form.cor || COR_PADRAO}
            onChange={e => setForm({ ...form, cor: e.target.value })}
            className="h-[38px] w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn-primary" disabled={salvando}>
          {salvando && <Loader2 size={16} className="animate-spin" />} Salvar
        </button>
      </div>
    </form>
  )
}

function ConteudoMaterial({ m }) {
  if (m.tipo === 'RESUMO') return <p className="whitespace-pre-wrap text-sm text-ink-soft">{m.urlOuCaminho}</p>
  const ehUrl = /^https?:\/\//i.test(m.urlOuCaminho || '')
  return ehUrl
    ? <a href={m.urlOuCaminho} target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        Abrir <ExternalLink size={13} aria-hidden="true" /></a>
    : <span className="break-all text-sm text-ink-soft">{m.urlOuCaminho}</span>
}

function PainelMateriais({ materia }) {
  const toast = useToast()
  const confirmar = useConfirm()
  const [materiais, setMateriais] = useState(null)
  const [form, setForm] = useState({ titulo: '', tipo: 'LINK', urlOuCaminho: '' })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(() =>
    listarMateriaisPorMateria(materia.id).then(setMateriais)
      .catch(err => toast.erro(mensagemDeErro(err))), [materia.id, toast])
  useEffect(() => { carregar() }, [carregar])

  const adicionar = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      await criarMaterial({ ...form, materiaId: materia.id })
      setForm({ titulo: '', tipo: 'LINK', urlOuCaminho: '' })
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) } finally { setSalvando(false) }
  }

  const remover = async (m) => {
    if (!(await confirmar({ titulo: 'Excluir material', mensagem: `Excluir "${m.titulo}"?`, acao: 'Excluir' }))) return
    try { await deletarMaterial(m.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const placeholder = form.tipo === 'RESUMO' ? 'Escreva o resumo' : form.tipo === 'PDF' ? 'Link ou caminho do PDF' : 'https://…'

  return (
    <div className="mt-3 border-t border-line pt-3">
      {!materiais ? <p className="text-sm text-ink-mute">Carregando…</p> : materiais.length === 0 ? (
        <p className="mb-3 text-sm text-ink-mute">Nenhum material ainda.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {materiais.map(m => (
            <li key={m.id} className="flex items-start gap-2 rounded-lg bg-paper p-2.5">
              {m.tipo === 'LINK' ? <Link2 size={16} className="mt-0.5 shrink-0 text-ink-mute" /> : <FileText size={16} className="mt-0.5 shrink-0 text-ink-mute" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.titulo} <span className="font-normal text-ink-mute">({TIPOS[m.tipo]})</span></p>
                <ConteudoMaterial m={m} />
              </div>
              <button className="icon-btn-danger -my-1" onClick={() => remover(m)} aria-label={`Excluir ${m.titulo}`}><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={adicionar} className="grid gap-2">
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          <input className="field" placeholder="Título" aria-label="Título do material" required maxLength={150}
            value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
          <select className="field" aria-label="Tipo" value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value })}>
            {Object.entries(TIPOS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
        <textarea className="field" rows={form.tipo === 'RESUMO' ? 3 : 1} placeholder={placeholder}
          aria-label="Conteúdo do material" required maxLength={1000}
          value={form.urlOuCaminho} onChange={e => setForm({ ...form, urlOuCaminho: e.target.value })} />
        <button className="btn-ghost justify-self-end" disabled={salvando}><Plus size={16} /> Adicionar material</button>
      </form>
    </div>
  )
}

export default function Materias() {
  const toast = useToast()
  const confirmar = useConfirm()
  const [materias, setMaterias] = useState(null)
  const [abertas, setAbertas] = useState({}) // materiaId -> nº de tarefas abertas
  const [erro, setErro] = useState('')
  const [modal, setModal] = useState(null) // null | { materia?: obj }
  const [expandida, setExpandida] = useState(null)

  const carregar = useCallback(() => {
    setErro('')
    return Promise.all([listarMaterias(), listarTarefas()])
      .then(([m, t]) => {
        setMaterias(m)
        const cont = {}
        t.filter(x => x.status !== 'CONCLUIDO' && x.materia).forEach(x => { cont[x.materia.id] = (cont[x.materia.id] || 0) + 1 })
        setAbertas(cont)
      })
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar as matérias')))
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const salvar = async (form) => {
    const edicao = modal?.materia
    try {
      if (edicao) await atualizarMateria(edicao.id, form)
      else await criarMateria(form)
      toast.sucesso(edicao ? 'Matéria atualizada' : 'Matéria criada')
      setModal(null)
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const remover = async (m) => {
    const ok = await confirmar({
      titulo: 'Excluir matéria',
      mensagem: `Excluir "${m.nome}"? As tarefas, sessões do cronograma e materiais desta matéria também serão removidos.`,
      acao: 'Excluir',
    })
    if (!ok) return
    try { await deletarMateria(m.id); toast.sucesso('Matéria excluída'); carregar() }
    catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  return (
    <div>
      <Cabecalho titulo="Matérias">
        <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> Nova matéria</button>
      </Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !materias ? <Carregando /> : materias.length === 0 ? (
        <Vazio icone={BookOpen} titulo="Nenhuma matéria cadastrada">
          Cadastre suas matérias para organizar tarefas, horários e materiais de estudo.
        </Vazio>
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materias.map(m => {
            const aberta = expandida === m.id
            const n = abertas[m.id] || 0
            return (
              <li key={m.id} className="panel overflow-hidden">
                <div className="h-1.5" style={{ backgroundColor: m.cor }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold">{m.nome}</h2>
                      <p className="text-sm text-ink-soft">
                        {m.cargaHoraria}h de carga horária · {n} {n === 1 ? 'tarefa aberta' : 'tarefas abertas'}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <button className="icon-btn" onClick={() => setModal({ materia: m })} aria-label={`Editar ${m.nome}`}><Pencil size={16} /></button>
                      <button className="icon-btn-danger" onClick={() => remover(m)} aria-label={`Excluir ${m.nome}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <button className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
                    aria-expanded={aberta} onClick={() => setExpandida(aberta ? null : m.id)}>
                    Materiais <ChevronDown size={15} className={`transition-transform ${aberta ? 'rotate-180' : ''}`} />
                  </button>
                  {aberta && <PainelMateriais materia={m} />}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {modal && (
        <Modal titulo={modal.materia ? 'Editar matéria' : 'Nova matéria'} onClose={() => setModal(null)} largura="max-w-md">
          <FormMateria
            inicial={modal.materia ? { nome: modal.materia.nome, cor: modal.materia.cor, cargaHoraria: modal.materia.cargaHoraria ?? 0 } : FORM_VAZIO}
            onSalvar={salvar} onCancelar={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
