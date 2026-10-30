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
import { iniciais, textoSobre } from '../lib/cores'

const COR_PADRAO = '#4A44E0'
const FORM_VAZIO = { nome: '', cor: COR_PADRAO, cargaHoraria: 0 }
const TIPOS = { LINK: 'Link', PDF: 'PDF', RESUMO: 'Resumo' }
const PALETA = [
  ['#4A44E0', 'Índigo'], ['#0EA5E9', 'Azul'], ['#14B8A6', 'Turquesa'], ['#10B981', 'Verde'],
  ['#F59E0B', 'Âmbar'], ['#EF4444', 'Vermelho'], ['#EC4899', 'Rosa'], ['#8B5CF6', 'Violeta'],
]

function FormMateria({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(inicial)
  const [salvando, setSalvando] = useState(false)
  const corAtual = (form.cor || COR_PADRAO).toLowerCase()

  const submit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try { await onSalvar(form) } finally { setSalvando(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="mat-nome" className="field-label">Nome</label>
        <input id="mat-nome" className="field" value={form.nome} required maxLength={100}
          onChange={e => setForm({ ...form, nome: e.target.value })} />
      </div>
      <div>
        <label htmlFor="mat-carga" className="field-label">Carga horária (h)</label>
        <input id="mat-carga" type="number" min="0" className="field" value={form.cargaHoraria}
          onChange={e => setForm({ ...form, cargaHoraria: Math.max(0, +e.target.value || 0) })} />
      </div>
      <div>
        <span className="field-label" id="mat-cor-rotulo">Cor</span>
        <div className="flex flex-wrap items-center gap-2.5" role="group" aria-labelledby="mat-cor-rotulo">
          {PALETA.map(([hex, nome]) => (
            <button key={hex} type="button" aria-label={nome} aria-pressed={corAtual === hex.toLowerCase()}
              onClick={() => setForm({ ...form, cor: hex })}
              className={`h-8 w-8 rounded-full transition duration-200 ease-spring hover:scale-110 active:scale-95 ${
                corAtual === hex.toLowerCase() ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
              style={{ backgroundColor: hex }} />
          ))}
          <label className="relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-ink-mute/60 text-ink-mute transition hover:border-brand-500 hover:text-link">
            <Plus size={14} aria-hidden="true" />
            <span className="sr-only">Escolher outra cor</span>
            <input type="color" value={form.cor || COR_PADRAO}
              onChange={e => setForm({ ...form, cor: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn-primary" disabled={salvando}>
          {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Salvar
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
         className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
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
    <div className="mt-4 border-t border-line pt-4">
      {!materiais ? <div className="skeleton mb-3 h-14" role="status" aria-label="Carregando materiais" /> : materiais.length === 0 ? (
        <p className="mb-3 text-sm text-ink-mute">Nenhum material ainda.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {materiais.map(m => (
            <li key={m.id} className="flex items-start gap-3 rounded-xl bg-sunken p-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-ink-mute">
                {m.tipo === 'LINK' ? <Link2 size={15} aria-hidden="true" /> : <FileText size={15} aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.titulo} <span className="font-normal text-ink-mute">({TIPOS[m.tipo]})</span></p>
                <ConteudoMaterial m={m} />
              </div>
              <button className="icon-btn-danger -my-1 h-8 w-8" onClick={() => remover(m)} aria-label={`Excluir ${m.titulo}`}><Trash2 size={15} /></button>
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
        <textarea className="field resize-none" rows={form.tipo === 'RESUMO' ? 3 : 1} placeholder={placeholder}
          aria-label="Conteúdo do material" required maxLength={1000}
          value={form.urlOuCaminho} onChange={e => setForm({ ...form, urlOuCaminho: e.target.value })} />
        <button className="btn-soft justify-self-end" disabled={salvando}>
          {salvando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />} Adicionar material
        </button>
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
  const [visitadas, setVisitadas] = useState({}) // painéis já abertos ficam montados, para recolher com animação

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

  const alternar = (m) => {
    setVisitadas(v => ({ ...v, [m.id]: true }))
    setExpandida(atual => (atual === m.id ? null : m.id))
  }

  const novaMateria = (
    <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} aria-hidden="true" /> Nova matéria</button>
  )

  return (
    <div>
      <Cabecalho titulo="Matérias">{novaMateria}</Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !materias ? <Carregando tipo="cards" /> : materias.length === 0 ? (
        <Vazio icone={BookOpen} titulo="Nenhuma matéria cadastrada" acao={novaMateria}>
          Cadastre suas matérias para organizar tarefas, horários e materiais de estudo.
        </Vazio>
      ) : (
        <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materias.map(m => {
            const aberta = expandida === m.id
            const n = abertas[m.id] || 0
            return (
              <li key={m.id} className="panel p-5">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold"
                        style={{ backgroundColor: m.cor, color: textoSobre(m.cor) }} aria-hidden="true">
                    {iniciais(m.nome)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-lg font-bold leading-tight">{m.nome}</h2>
                    <p className="mt-0.5 text-sm text-ink-soft">{m.cargaHoraria}h de carga horária</p>
                    <p className="text-sm text-ink-mute">{n} {n === 1 ? 'tarefa aberta' : 'tarefas abertas'}</p>
                  </div>
                  <div className="-mr-1.5 -mt-1 flex shrink-0">
                    <button className="icon-btn" onClick={() => setModal({ materia: m })} aria-label={`Editar ${m.nome}`}><Pencil size={16} /></button>
                    <button className="icon-btn-danger" onClick={() => remover(m)} aria-label={`Excluir ${m.nome}`}><Trash2 size={16} /></button>
                  </div>
                </div>
                <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
                  aria-expanded={aberta} onClick={() => alternar(m)}>
                  Materiais <ChevronDown size={15} aria-hidden="true" className={`transition-transform duration-300 ease-fluid ${aberta ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-fluid ${aberta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                     ref={(el) => { // "inert" via DOM: funciona igual no React 18 e 19
                       if (!el) return
                       if (aberta) el.removeAttribute('inert'); else el.setAttribute('inert', '')
                     }}>
                  <div className="-mx-1 min-h-0 overflow-hidden px-1">
                    {visitadas[m.id] && <PainelMateriais materia={m} />}
                  </div>
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
