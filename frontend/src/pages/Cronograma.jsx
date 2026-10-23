import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { listarCronogramas, criarCronograma, concluirCronograma, deletarCronograma } from '../services/cronogramaService'
import { listarMaterias } from '../services/materiaService'
import { Cabecalho, Carregando, ErroCarregar } from '../components/Estados'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { mensagemDeErro } from '../lib/erros'
import { DIAS_SEMANA, NOMES_DIAS, NOMES_DIAS_CURTOS, diaDaSemanaHoje, hhmm } from '../lib/datas'

const FORM_INICIAL = { materiaId: '', diaDaSemana: 'MONDAY', horarioInicio: '08:00', horarioFim: '09:00' }

export default function Cronograma() {
  const toast = useToast()
  const confirmar = useConfirm()
  const [cronogramas, setCronogramas] = useState(null)
  const [materias, setMaterias] = useState([])
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [aberto, setAberto] = useState(false)
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
    return mapa
  }, [cronogramas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.horarioFim <= form.horarioInicio) {
      toast.erro('O horário de término deve ser depois do início.')
      return
    }
    try {
      await criarCronograma({ ...form, materiaId: Number(form.materiaId) })
      toast.sucesso('Sessão adicionada')
      setForm({ ...FORM_INICIAL, diaDaSemana: form.diaDaSemana })
      setAberto(false)
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) }
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
        <button className="btn-primary" onClick={() => setAberto(a => !a)} aria-expanded={aberto}>
          <Plus size={16} /> Nova sessão
        </button>
      </Cabecalho>

      {erro ? <ErroCarregar mensagem={erro} onTentar={carregar} /> : !cronogramas ? <Carregando /> : (
        <>
          {aberto && (materias.length === 0 ? (
            <p className="panel mb-6 p-4 text-sm text-ink-soft">Cadastre uma matéria antes de planejar uma sessão.</p>
          ) : (
            <form onSubmit={handleSubmit} className="panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
              <div>
                <label htmlFor="c-materia" className="field-label">Matéria</label>
                <select id="c-materia" className="field" value={form.materiaId} onChange={set('materiaId')} required>
                  <option value="">Selecione</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div>
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
              <button className="btn-primary sm:col-span-2 lg:col-span-1">Adicionar</button>
            </form>
          ))}

          {cronogramas.length === 0 && !aberto && (
            <p className="mb-4 text-sm text-ink-soft">Nenhuma sessão planejada. Use “Nova sessão” para montar sua semana.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {DIAS_SEMANA.map(dia => (
              <section key={dia} aria-label={NOMES_DIAS[dia]}
                className={`min-w-0 rounded-xl border p-2.5 ${dia === hoje ? 'border-brand-200 bg-brand-50/60' : 'border-line bg-white/60'}`}>
                <h2 className={`mb-2 px-1 text-sm font-bold ${dia === hoje ? 'text-brand-700' : 'text-ink-soft'}`}>
                  <span className="lg:hidden">{NOMES_DIAS[dia]}</span>
                  <span className="hidden lg:inline">{NOMES_DIAS_CURTOS[dia]}</span>
                  {dia === hoje && <span className="ml-1.5 text-xs font-semibold">hoje</span>}
                </h2>
                <ul className="space-y-2">
                  {porDia[dia].length === 0 && <li className="px-1 py-2 text-xs text-ink-mute">Livre</li>}
                  {porDia[dia].map(c => {
                    const cor = c.materia?.cor || '#3B55E6'
                    const feita = c.status === 'CONCLUIDO'
                    return (
                      <li key={c.id} className={`rounded-lg p-2.5 ${feita ? 'opacity-60' : ''}`}
                          style={{ backgroundColor: `${cor}1F`, borderLeft: `4px solid ${cor}` }}>
                        <p className="text-xs font-semibold tabular-nums text-ink-soft">{hhmm(c.horarioInicio)}–{hhmm(c.horarioFim)}</p>
                        <p className={`break-words text-sm font-semibold ${feita ? 'line-through' : ''}`}>{c.materia?.nome}</p>
                        <div className="mt-1 flex items-center justify-end gap-0.5">
                          {feita ? <CheckCircle2 size={16} className="mr-1 text-emerald-600" aria-label="Concluída" /> : (
                            <button className="icon-btn h-7 w-7 hover:text-emerald-700" onClick={() => concluir(c)}
                              aria-label={`Concluir sessão de ${c.materia?.nome}`}><CheckCircle2 size={16} /></button>
                          )}
                          <button className="icon-btn-danger h-7 w-7" onClick={() => remover(c)}
                            aria-label={`Excluir sessão de ${c.materia?.nome}`}><Trash2 size={15} /></button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
