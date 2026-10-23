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
import { dataPorExtenso, diaDaSemanaHoje, hhmm, rotuloPrazo } from '../lib/datas'

const TOM = {
  atrasada: 'bg-red-50 text-red-700',
  urgente: 'bg-amber-50 text-amber-800',
  proxima: 'bg-brand-50 text-brand-700',
  normal: 'bg-paper text-ink-soft',
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
  else if (!dados) conteudo = <Carregando />
  else {
    const { tarefas, cronogramas } = dados
    const abertas = tarefas.filter(t => t.status !== 'CONCLUIDO')
    const concluidas = tarefas.length - abertas.length
    const pct = tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0
    const proximas = abertas.filter(t => t.dataEntrega).slice(0, 5)
    const hoje = cronogramas.filter(c => c.diaDaSemana === diaDaSemanaHoje())

    conteudo = (
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="panel p-5" aria-label="Progresso das tarefas">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">Progresso</h2>
              <span className="text-sm text-ink-soft">{concluidas} de {tarefas.length} tarefas concluídas</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper" role="progressbar"
                 aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {abertas.length === 0 ? 'Nada pendente por aqui.' : `${abertas.length} ${abertas.length === 1 ? 'tarefa aberta' : 'tarefas abertas'} em ${dados.materias.length} ${dados.materias.length === 1 ? 'matéria' : 'matérias'}.`}
            </p>
          </section>

          <section className="panel p-5" aria-label="Sessões de hoje">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><CalendarCheck size={18} className="text-brand-600" /> Hoje</h2>
            {hoje.length === 0 ? (
              <Vazio titulo="Nenhuma sessão de estudo hoje">
                Planeje horários fixos no <Link to="/cronograma" className="font-semibold text-brand-600 hover:underline">cronograma</Link>.
              </Vazio>
            ) : (
              <ul className="space-y-2">
                {hoje.map(c => (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg border border-line p-3"
                      style={{ borderLeft: `4px solid ${c.materia?.cor || '#3B55E6'}` }}>
                    <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">{hhmm(c.horarioInicio)}–{hhmm(c.horarioFim)}</span>
                    <span className={`flex-1 truncate text-sm ${c.status === 'CONCLUIDO' ? 'text-ink-mute line-through' : ''}`}>{c.materia?.nome}</span>
                    {c.status === 'CONCLUIDO' && <CheckCircle2 size={16} className="text-emerald-600" aria-label="Concluída" />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel p-5" aria-label="Próximos prazos">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ListTodo size={18} className="text-brand-600" /> Próximos prazos</h2>
              <Link to="/tarefas" className="text-sm font-semibold text-brand-600 hover:underline">Ver todas</Link>
            </div>
            {proximas.length === 0 ? (
              <Vazio titulo="Sem prazos à vista">Tarefas com data de entrega aparecem aqui.</Vazio>
            ) : (
              <ul className="divide-y divide-line">
                {proximas.map(t => {
                  const prazo = rotuloPrazo(t.dataEntrega)
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.titulo}</p>
                        {t.materia && <p className="truncate text-xs text-ink-mute">{t.materia.nome}</p>}
                      </div>
                      <span className={`chip shrink-0 ${TOM[prazo.tom]}`}>{prazo.texto}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <PomodoroTimer onFocoConcluido={(n) => toast.sucesso(`Foco concluído! Você já fez ${n} ${n === 1 ? 'sessão' : 'sessões'} nesta visita.`)} />
      </div>
    )
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Olá, {primeiroNome}</h1>
        <p className="mt-1 capitalize text-ink-soft">{dataPorExtenso()}</p>
      </header>
      {conteudo}
    </div>
  )
}
