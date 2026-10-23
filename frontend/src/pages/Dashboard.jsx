import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, ListTodo } from 'lucide-react'
import PomodoroTimer from '../components/PomodoroTimer'
import { Carregando, ErroCarregar, Vazio } from '../components/Estados'
import { listarMaterias } from '../services/materiaService'
import { listarTarefas } from '../services/tarefaService'
import { listarCronogramas } from '../services/cronogramaService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { mensagemDeErro } from '../lib/erros'
import { dataPorExtenso, diaDaSemanaHoje, hhmm, minutos, rotuloPrazo } from '../lib/datas'

const TOM = {
  atrasada: 'tone-bad',
  urgente: 'tone-warn',
  proxima: 'tone-brand',
  normal: 'tone-neutral',
}

const COR_PADRAO = '#4A44E0'

// A barra enche até o valor ao carregar, mostrando de onde o progresso veio
function Barra({ pct }) {
  const [largura, setLargura] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setLargura(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return (
    <div className="h-3 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Tarefas concluídas"
         aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand-500 transition-[width] duration-1000 ease-fluid" style={{ width: `${largura}%` }} />
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const toast = useToast()
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(() => {
    setErro('')
    Promise.all([listarMaterias(), listarTarefas(), listarCronogramas()])
      .then(([materias, tarefas, cronogramas]) => setDados({ materias, tarefas, cronogramas }))
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar o painel')))
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const primeiroNome = usuario?.nome?.split(' ')[0]

  let conteudo
  if (erro) conteudo = <ErroCarregar mensagem={erro} onTentar={carregar} />
  else if (!dados) conteudo = <Carregando tipo="painel" />
  else {
    const { tarefas, cronogramas } = dados
    const abertas = tarefas.filter(t => t.status !== 'CONCLUIDO')
    const concluidas = tarefas.length - abertas.length
    const pct = tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0
    const atrasadas = abertas.filter(t => rotuloPrazo(t.dataEntrega)?.tom === 'atrasada').length
    const proximas = abertas.filter(t => t.dataEntrega)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega)).slice(0, 5)
    const hoje = cronogramas.filter(c => c.diaDaSemana === diaDaSemanaHoje())
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
    const agora = new Date().getHours() * 60 + new Date().getMinutes()

    conteudo = (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-6">
          <section className="panel p-6" aria-label="Progresso das tarefas">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Progresso</h2>
                <p className="mt-0.5 text-sm text-ink-soft">{concluidas} de {tarefas.length} tarefas concluídas</p>
              </div>
              <p className="font-display text-4xl font-bold leading-none tabular-nums">{pct}%</p>
            </div>
            <div className="mt-5"><Barra pct={pct} /></div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-sm text-ink-soft">
                {abertas.length === 0 ? 'Nada pendente por aqui.' : `${abertas.length} ${abertas.length === 1 ? 'tarefa aberta' : 'tarefas abertas'} em ${dados.materias.length} ${dados.materias.length === 1 ? 'matéria' : 'matérias'}.`}
              </p>
              {atrasadas > 0 && (
                <Link to="/tarefas" className="chip tone-bad transition-opacity hover:opacity-80">
                  {atrasadas} {atrasadas === 1 ? 'atrasada' : 'atrasadas'}
                </Link>
              )}
            </div>
          </section>

          <section className="panel p-6" aria-label="Sessões de hoje">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-xl font-bold"><CalendarCheck size={20} className="text-link" aria-hidden="true" /> Hoje</h2>
              <Link to="/cronograma" className="text-sm font-semibold text-link hover:underline">Ver cronograma</Link>
            </div>
            {hoje.length === 0 ? (
              <Vazio titulo="Nenhuma sessão de estudo hoje">
                Planeje horários fixos no <Link to="/cronograma" className="font-semibold text-link hover:underline">cronograma</Link>.
              </Vazio>
            ) : (
              <ul className="space-y-2.5">
                {hoje.map(c => {
                  const cor = c.materia?.cor || COR_PADRAO
                  const feita = c.status === 'CONCLUIDO'
                  const emCurso = !feita && agora >= minutos(c.horarioInicio) && agora < minutos(c.horarioFim)
                  return (
                    <li key={c.id} className="flex items-stretch gap-3.5 rounded-2xl p-3.5" style={{ backgroundColor: `${cor}18` }}>
                      <div className="w-12 shrink-0 text-right text-sm leading-tight tabular-nums">
                        <p className="font-semibold">{hhmm(c.horarioInicio)}</p>
                        <p className="text-ink-mute">{hhmm(c.horarioFim)}</p>
                      </div>
                      <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: cor }} aria-hidden="true" />
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className={`truncate font-semibold ${feita ? 'text-ink-mute line-through' : ''}`}>{c.materia?.nome}</span>
                        {feita && <CheckCircle2 size={18} className="shrink-0 text-ok-icon" aria-label="Concluída" />}
                        {emCurso && (
                          <span className="chip tone-brand shrink-0">
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                            </span>
                            Agora
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="panel p-6" aria-label="Próximos prazos">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-xl font-bold"><ListTodo size={20} className="text-link" aria-hidden="true" /> Próximos prazos</h2>
              <Link to="/tarefas" className="text-sm font-semibold text-link hover:underline">Ver todas</Link>
            </div>
            {proximas.length === 0 ? (
              <Vazio titulo="Sem prazos à vista">Tarefas com data de entrega aparecem aqui.</Vazio>
            ) : (
              <ul className="divide-y divide-line">
                {proximas.map(t => {
                  const prazo = rotuloPrazo(t.dataEntrega)
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.materia?.cor || 'rgb(var(--line))' }} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{t.titulo}</p>
                          {t.materia && <p className="truncate text-xs text-ink-mute">{t.materia.nome}</p>}
                        </div>
                      </div>
                      <span className={`chip shrink-0 ${TOM[prazo.tom]}`}>{prazo.texto}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <PomodoroTimer className="self-start lg:sticky lg:top-8"
          onFocoConcluido={(n) => toast.sucesso(`Foco concluído! Você já fez ${n} ${n === 1 ? 'sessão' : 'sessões'} nesta visita.`)} />
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight md:text-[2.5rem]">Olá, {primeiroNome}</h1>
        <p className="mt-1 text-ink-soft first-letter:uppercase">{dataPorExtenso()}</p>
      </header>
      {conteudo}
    </div>
  )
}
