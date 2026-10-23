import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react'
import { listarCronogramas, criarCronograma, concluirCronograma, deletarCronograma } from '../services/cronogramaService'
import { listarMaterias } from '../services/materiaService'
import { Cabecalho, Carregando, ErroCarregar } from '../components/Estados'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { mensagemDeErro } from '../lib/erros'
import { DIAS_SEMANA, NOMES_DIAS, NOMES_DIAS_CURTOS, diaDaSemanaHoje, hhmm } from '../lib/datas'

const FORM_INICIAL = { materiaId: '', diaDaSemana: 'MONDAY', horarioInicio: '08:00', horarioFim: '09:00' }
const COR_PADRAO = '#4A44E0'

export default function Cronograma() {
  const toast = useToast()
  const confirmar = useConfirm()
  const [cronogramas, setCronogramas] = useState(null)
  const [materias, setMaterias] = useState([])
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const hoje = diaDaSemanaHoje()

  const carregar = useCallback(() => {
    setErro('')
    return Promise.all([listarCronogramas(), listarMaterias()])
      .then(([c, m]) => { setCronogramas(c); setMaterias(m) })
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar o cronograma')))
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const porDia = useMemo(() => {
    const mapa = Object.fromEntries(DIAS_SEMANA.map(d => [d, []]))
    ;(cronogramas || []).forEach(c => mapa[c.diaDaSemana]?.push(c))
    Object.values(mapa).forEach(lista => lista.sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio)))
    return mapa
  }, [cronogramas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.horarioFim <= form.horarioInicio) {
      toast.erro('O horário de término deve ser depois do início.')
      return
    }
    setSalvando(true)
    try {
      await criarCronograma({ ...form, materiaId: Number(form.materiaId) })
      toast.sucesso('Sessão adicionada')
      setForm({ ...FORM_INICIAL, diaDaSemana: form.diaDaSemana })
      setAberto(false)
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) } finally { setSalvando(false) }
  }

  const concluir = async (c) => {
    try { await concluirCronograma(c.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const remover = async (c) => {
    const ok = await confirmar({
      titulo: 'Excluir sessão',
      mensagem: `Excluir a sessão de ${c.materia?.nome} de ${NOMES_DIAS[c.diaDaSemana].toLowerCase()}, ${hhmm(c.horarioInicio)}–${hhmm(c.horarioFim)}?`,
      acao: 'Excluir',
    })
    if (!ok) return
    try { await deletarCronograma(c.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  return (
    <div>
      <Cabecalho titulo="Cronograma">
        <button className="btn-primary" onClick={() => setAberto(true)} aria-haspopup="dialog">
          <Plus size={16} aria-hidden="true" /> Nova sessão
        </button>
      </Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !cronogramas ? <Carregando tipo="grade" /> : (
        <>
          {cronogramas.length === 0 && (
            <p className="mb-5 flex items-center gap-2 text-sm text-ink-soft">
              <CalendarDays size={16} className="shrink-0 text-link" aria-hidden="true" />
              Nenhuma sessão planejada. Use “Nova sessão” para montar sua semana.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {DIAS_SEMANA.map(dia => {
              const ehHoje = dia === hoje
              return (
                <section key={dia} aria-label={NOMES_DIAS[dia]}
                  className={`min-w-0 rounded-2xl border p-2.5 ${ehHoje ? 'border-brand-200 bg-brand-50/70' : 'border-line bg-surface/60'}`}>
                  <h2 className="mb-2.5 flex h-7 items-center justify-between gap-2 px-1.5 text-sm font-bold">
                    <span className={ehHoje ? 'text-brand-700' : 'text-ink-soft'}>
                      <span className="lg:hidden">{NOMES_DIAS[dia]}</span>
                      <span className="hidden lg:inline">{NOMES_DIAS_CURTOS[dia]}</span>
                    </span>
                    {ehHoje && <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-bold text-deep">hoje</span>}
                  </h2>
                  <ul className="space-y-2">
                    {porDia[dia].length === 0 && <li className="px-1.5 py-3 text-xs text-ink-mute">Livre</li>}
                    {porDia[dia].map(c => {
                      const cor = c.materia?.cor || COR_PADRAO
                      const feita = c.status === 'CONCLUIDO'
                      return (
                        <li key={c.id} className={`rounded-xl p-3 transition-opacity duration-300 ${feita ? 'opacity-60' : ''}`}
                            style={{ backgroundColor: `${cor}22`, boxShadow: `inset 3px 0 0 ${cor}` }}>
                          <p className="text-xs font-semibold tabular-nums text-ink-soft">{hhmm(c.horarioInicio)}–{hhmm(c.horarioFim)}</p>
                          <p className="mt-0.5 hyphens-auto break-words text-sm font-semibold leading-snug">
                            <span className={`strike ${feita ? 'is-done' : ''}`}>{c.materia?.nome}</span>
                          </p>
                          <div className="-mb-1 -mr-1 mt-1.5 flex items-center justify-end gap-0.5">
                            {feita ? <CheckCircle2 size={18} className="mr-2 text-ok-icon" aria-label="Concluída" /> : (
                              <button className="icon-btn h-8 w-8 hover:text-ok-fg" onClick={() => concluir(c)}
                                aria-label={`Concluir sessão de ${c.materia?.nome}`}><CheckCircle2 size={16} /></button>
                            )}
                            <button className="icon-btn-danger h-8 w-8" onClick={() => remover(c)}
                              aria-label={`Excluir sessão de ${c.materia?.nome}`}><Trash2 size={15} /></button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>

          {aberto && (
            <Modal titulo="Nova sessão" onClose={() => setAberto(false)} largura="max-w-md">
              {materias.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">Cadastre uma matéria antes de planejar uma sessão.</p>
                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setAberto(false)}>Fechar</button>
                    <Link to="/materias" className="btn-primary">Ir para matérias</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="c-materia" className="field-label">Matéria</label>
                    <select id="c-materia" className="field" value={form.materiaId} onChange={set('materiaId')} required>
                      <option value="">Selecione</option>
                      {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-dia" className="field-label">Dia</label>
                    <select id="c-dia" className="field" value={form.diaDaSemana} onChange={set('diaDaSemana')}>
                      {DIAS_SEMANA.map(d => <option key={d} value={d}>{NOMES_DIAS[d]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-ini" className="field-label">Início</label>
                    <input id="c-ini" type="time" className="field" value={form.horarioInicio} onChange={set('horarioInicio')} required />
                  </div>
                  <div>
                    <label htmlFor="c-fim" className="field-label">Término</label>
                    <input id="c-fim" type="time" className="field" value={form.horarioFim} onChange={set('horarioFim')} required />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                    <button type="button" className="btn-ghost" onClick={() => setAberto(false)}>Cancelar</button>
                    <button className="btn-primary" disabled={salvando}>
                      {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Adicionar
                    </button>
                  </div>
                </form>
              )}
            </Modal>
          )}
        </>
      )}
    </div>
  )
}
