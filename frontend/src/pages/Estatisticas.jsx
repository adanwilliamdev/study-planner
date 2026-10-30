import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CalendarCheck, CheckCircle2, Flame, Timer } from 'lucide-react'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../components/Estados'
import Segmented from '../components/Segmented'
import { obterEstatisticas } from '../services/estatisticasService'
import { mensagemDeErro } from '../lib/erros'
import { diaCurto, formatarData, formatarMinutos } from '../lib/datas'

const PERIODOS = [[7, '7 dias'], [30, '30 dias']]
const COR_PADRAO = '#4A44E0'

function Cartao({ Icone, rotulo, valor, detalhe, destaque }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <Icone size={17} className={destaque || 'text-link'} aria-hidden="true" /> {rotulo}
      </div>
      <p className="mt-3 font-display text-3xl font-bold leading-none tabular-nums">{valor}</p>
      {detalhe && <p className="mt-2 text-xs text-ink-mute">{detalhe}</p>}
    </div>
  )
}

/** Barras de foco por dia. Em 30 dias os rótulos aparecem de 5 em 5 para não amontoar. */
function GraficoDias({ dias }) {
  const max = Math.max(...dias.map(d => d.focoMin), 1)
  const passo = dias.length > 7 ? 5 : 1
  const total = dias.reduce((s, d) => s + d.focoMin, 0)
  return (
    <figure>
      <div className="flex h-44 items-end gap-1 sm:gap-1.5" role="img"
           aria-label={`Foco por dia. Total no período: ${formatarMinutos(total)}.`}>
        {dias.map((d, i) => {
          const pct = (d.focoMin / max) * 100
          const ehHoje = i === dias.length - 1
          return (
            <div key={d.data} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                 title={`${formatarData(d.data)}: ${formatarMinutos(d.focoMin)} de foco`}>
              <div className={`w-full rounded-t-md transition-[height] duration-700 ease-fluid ${
                d.focoMin === 0 ? 'bg-sunken' : ehHoje ? 'bg-brand-500' : 'bg-brand-200'}`}
                style={{ height: d.focoMin === 0 ? '4px' : `${Math.max(pct, 6)}%` }} />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-1 sm:gap-1.5" aria-hidden="true">
        {dias.map((d, i) => (
          <span key={d.data} className="min-w-0 flex-1 text-center text-[11px] text-ink-mute">
            {(dias.length - 1 - i) % passo === 0 ? (passo === 1 ? diaCurto(d.data) : formatarData(d.data).split(' ')[0]) : ''}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {dias.map(d => `${formatarData(d.data)}: ${formatarMinutos(d.focoMin)}`).join('; ')}
      </figcaption>
    </figure>
  )
}

function PorMateria({ itens }) {
  const max = Math.max(...itens.map(i => i.focoMin), 1)
  return (
    <ul className="space-y-4">
      {itens.map(m => (
        <li key={m.materiaId ?? 'sem'}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold">{m.nome}</span>
            <span className="shrink-0 tabular-nums text-ink-soft">{formatarMinutos(m.focoMin)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
            <div className="h-full rounded-full transition-[width] duration-700 ease-fluid"
                 style={{ width: `${(m.focoMin / max) * 100}%`, backgroundColor: m.cor || COR_PADRAO }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Estatisticas() {
  const [dias, setDias] = useState(7)
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(() => {
    setErro('')
    return obterEstatisticas(dias)
      .then(setDados)
      .catch(err => setErro(mensagemDeErro(err, 'Não foi possível carregar as estatísticas')))
  }, [dias])
  useEffect(() => { carregar() }, [carregar])

  let corpo
  if (erro) corpo = <ErroCarregar mensagem={erro} onTentar={carregar} />
  else if (!dados) corpo = <Carregando tipo="cards" />
  else {
    const semFoco = dados.focoTotalMin === 0
    const faltam = dados.sessoesPlanejadasSemana - dados.sessoesConcluidasSemana
    corpo = (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Cartao Icone={Timer} rotulo="Foco hoje" valor={formatarMinutos(dados.focoHojeMin)}
            detalhe={`${formatarMinutos(dados.focoPeriodoMin)} em ${dados.periodoDias} dias`} />
          <Cartao Icone={Flame} destaque="text-warn-icon" rotulo="Sequência"
            valor={`${dados.sequenciaDias} ${dados.sequenciaDias === 1 ? 'dia' : 'dias'}`}
            detalhe={dados.sequenciaDias > 0 ? 'Dias seguidos com foco' : 'Faça um foco hoje para começar'} />
          <Cartao Icone={CheckCircle2} destaque="text-ok-icon" rotulo="Tarefas feitas"
            valor={dados.tarefasConcluidasPeriodo} detalhe={`${dados.tarefasAbertas} abertas · ${dados.tarefasAtrasadas} atrasadas`} />
          <Cartao Icone={CalendarCheck} rotulo="Sessões da semana"
            valor={`${dados.sessoesConcluidasSemana}/${dados.sessoesPlanejadasSemana}`}
            detalhe={dados.sessoesPlanejadasSemana === 0 ? 'Nada planejado no cronograma' : faltam === 0 ? 'Semana cumprida!' : `Faltam ${faltam}`} />
        </div>

        {semFoco ? (
          <Vazio icone={BarChart3} titulo="Ainda sem histórico de foco">
            Conclua um ciclo do <Link to="/" className="font-semibold text-link hover:underline">Pomodoro</Link> no
            painel inicial e suas estatísticas aparecem aqui.
          </Vazio>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="panel p-6" aria-label="Foco por dia">
              <h2 className="mb-1 text-xl font-bold">Foco por dia</h2>
              <p className="mb-5 text-sm text-ink-soft">{dados.sessoesFocoPeriodo} {dados.sessoesFocoPeriodo === 1 ? 'ciclo' : 'ciclos'} · total de {formatarMinutos(dados.focoTotalMin)} desde o início</p>
              <GraficoDias dias={dados.porDia} />
            </section>
            <section className="panel p-6" aria-label="Foco por matéria">
              <h2 className="mb-5 text-xl font-bold">Por matéria</h2>
              {dados.porMateria.length === 0
                ? <p className="text-sm text-ink-soft">Sem foco neste período.</p>
                : <PorMateria itens={dados.porMateria} />}
            </section>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <Cabecalho titulo="Estatísticas" subtitulo="Seu ritmo de estudo ao longo do tempo">
        <Segmented opcoes={PERIODOS} valor={dias} onChange={setDias} rotulo="Período" />
      </Cabecalho>
      {corpo}
    </div>
  )
}
