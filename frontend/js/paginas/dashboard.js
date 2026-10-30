import { h, icone } from '../dom.js'
import { PomodoroTimer } from '../componentes/pomodoro.js'
import { Carregando, ErroCarregar, Vazio } from '../componentes/estados.js'
import { materiasApi, tarefasApi, cronogramasApi } from '../api.js'
import { usuario } from '../auth.js'
import { toast } from '../toast.js'
import { mensagemDeErro } from '../lib/erros.js'
import { dataPorExtenso, diaDaSemanaHoje, hhmm, minutos, rotuloPrazo } from '../lib/datas.js'

const TOM = { atrasada: 'tom-ruim', urgente: 'tom-aviso', proxima: 'tom-marca', normal: 'tom-neutro' }
const COR_PADRAO = '#4A44E0'
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`

// A barra enche até o valor ao carregar, mostrando de onde o progresso veio
function Barra(pct) {
  const miolo = h('div', { class: 'barra__miolo' })
  requestAnimationFrame(() => requestAnimationFrame(() => { miolo.style.width = `${pct}%` }))
  return h('div', { class: 'barra', role: 'progressbar', 'aria-label': 'Tarefas concluídas',
    'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, miolo)
}

function SessaoHoje(c, agora) {
  const cor = c.materia?.cor || COR_PADRAO
  const feita = c.status === 'CONCLUIDO'
  const emCurso = !feita && agora >= minutos(c.horarioInicio) && agora < minutos(c.horarioFim)
  return h('li', { class: 'sessao-hoje', style: { backgroundColor: `${cor}18` } },
    h('div', { class: 'sessao-hoje__horas numeros' },
      h('p', { class: 'sessao-hoje__inicio' }, hhmm(c.horarioInicio)),
      h('p', { class: 'texto-mudo' }, hhmm(c.horarioFim))),
    h('span', { class: 'sessao-hoje__faixa', style: { backgroundColor: cor }, 'aria-hidden': 'true' }),
    h('div', { class: 'sessao-hoje__corpo' },
      h('span', { class: `truncar sessao-hoje__nome ${feita ? 'feita' : ''}` }, c.materia?.nome),
      feita && icone('check-circle', { tamanho: 18, classe: 'ok-icone sessao-hoje__ok', rotulo: 'Concluída' }),
      emCurso && h('span', { class: 'chip tom-marca chip--fixo' },
        h('span', { class: 'ping', 'aria-hidden': 'true' }, h('span', { class: 'ping__onda' }), h('span', { class: 'ping__ponto' })),
        'Agora')))
}

function Prazo(t) {
  const prazo = rotuloPrazo(t.dataEntrega)
  return h('li', { class: 'prazo' },
    h('div', { class: 'prazo__info' },
      h('span', { class: 'prazo__cor', style: { backgroundColor: t.materia?.cor || 'rgb(var(--line))' }, 'aria-hidden': 'true' }),
      h('div', { class: 'min-0' },
        h('p', { class: 'prazo__titulo truncar' }, t.titulo),
        t.materia && h('p', { class: 'prazo__materia truncar' }, t.materia.nome))),
    h('span', { class: `chip chip--fixo ${TOM[prazo.tom]}` }, prazo.texto))
}

function Painel(dados) {
  const { tarefas, cronogramas, materias } = dados
  const abertas = tarefas.filter((t) => t.status !== 'CONCLUIDO')
  const concluidas = tarefas.length - abertas.length
  const pct = tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0
  const atrasadas = abertas.filter((t) => rotuloPrazo(t.dataEntrega)?.tom === 'atrasada').length
  const proximas = abertas.filter((t) => t.dataEntrega)
    .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega)).slice(0, 5)
  const hoje = cronogramas.filter((c) => c.diaDaSemana === diaDaSemanaHoje())
    .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
  const agora = new Date().getHours() * 60 + new Date().getMinutes()

  const resumo = abertas.length === 0
    ? 'Nada pendente por aqui.'
    : `${plural(abertas.length, 'tarefa aberta', 'tarefas abertas')} em ${plural(materias.length, 'matéria', 'matérias')}.`

  const pomodoro = PomodoroTimer({
    classe: 'pomodoro--fixo',
    onFocoConcluido: (n) => toast.sucesso(`Foco concluído! Você já fez ${n} ${n === 1 ? 'sessão' : 'sessões'} nesta visita.`),
  })

  const el = h('div', { class: 'grade-painel' },
    h('div', { class: 'pilha min-0' },
      h('section', { class: 'painel painel--folgado', 'aria-label': 'Progresso das tarefas' },
        h('div', { class: 'progresso__topo' },
          h('div', {}, h('h2', { class: 'titulo-secao' }, 'Progresso'),
            h('p', { class: 'texto-suave texto-pequeno progresso__legenda' }, `${concluidas} de ${tarefas.length} tarefas concluídas`)),
          h('p', { class: 'progresso__pct numeros' }, `${pct}%`)),
        h('div', { class: 'progresso__barra' }, Barra(pct)),
        h('div', { class: 'progresso__rodape' },
          h('p', { class: 'texto-suave texto-pequeno' }, resumo),
          atrasadas > 0 && h('a', { href: '#/tarefas', class: 'chip tom-ruim chip--link' }, plural(atrasadas, 'atrasada', 'atrasadas')))),

      h('section', { class: 'painel painel--folgado', 'aria-label': 'Sessões de hoje' },
        h('div', { class: 'secao-cab' },
          h('h2', { class: 'titulo-secao titulo-secao--icone' }, icone('calendar-check', { tamanho: 20, classe: 'link' }), ' Hoje'),
          h('a', { href: '#/cronograma', class: 'link link--pequeno' }, 'Ver cronograma')),
        hoje.length === 0
          ? Vazio({ titulo: 'Nenhuma sessão de estudo hoje' }, 'Planeje horários fixos no ', h('a', { href: '#/cronograma', class: 'link' }, 'cronograma'), '.')
          : h('ul', { class: 'pilha pilha--pequena' }, hoje.map((c) => SessaoHoje(c, agora)))),

      h('section', { class: 'painel painel--folgado', 'aria-label': 'Próximos prazos' },
        h('div', { class: 'secao-cab' },
          h('h2', { class: 'titulo-secao titulo-secao--icone' }, icone('list-todo', { tamanho: 20, classe: 'link' }), ' Próximos prazos'),
          h('a', { href: '#/tarefas', class: 'link link--pequeno' }, 'Ver todas')),
        proximas.length === 0
          ? Vazio({ titulo: 'Sem prazos à vista' }, 'Tarefas com data de entrega aparecem aqui.')
          : h('ul', { class: 'prazos' }, proximas.map(Prazo)))),
    pomodoro.el)

  return { el, destruir: pomodoro.destruir }
}

export function Dashboard() {
  const corpo = h('div')
  let filho = null // painel carregado, para limpar o timer ao sair

  function carregar() {
    corpo.replaceChildren(Carregando('painel'))
    Promise.all([materiasApi.listar(), tarefasApi.listar(), cronogramasApi.listar()])
      .then(([materias, tarefas, cronogramas]) => {
        filho = Painel({ materias, tarefas, cronogramas })
        corpo.replaceChildren(filho.el)
      })
      .catch((err) => corpo.replaceChildren(ErroCarregar(mensagemDeErro(err, 'Não foi possível carregar o painel'), carregar)))
  }
  carregar()

  const primeiroNome = usuario()?.nome?.split(' ')[0]
  const el = h('div', {},
    h('header', { class: 'cabecalho cabecalho--bloco' },
      h('h1', { class: 'titulo-pagina' }, `Olá, ${primeiroNome}`),
      h('p', { class: 'texto-suave primeira-maiuscula' }, dataPorExtenso())),
    corpo)
  return { el, destruir: () => filho?.destruir?.() }
}
