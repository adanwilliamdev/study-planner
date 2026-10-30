import { h, icone, reconciliar, rotuloBotao } from '../dom.js'
import { cronogramasApi, materiasApi } from '../api.js'
import { Cabecalho, Carregando, ErroCarregar } from '../componentes/estados.js'
import { abrirModal, confirmar } from '../modal.js'
import { toast } from '../toast.js'
import { mensagemDeErro } from '../lib/erros.js'
import { DIAS_SEMANA, NOMES_DIAS, NOMES_DIAS_CURTOS, diaDaSemanaHoje, hhmm } from '../lib/datas.js'

const COR_PADRAO = '#4A44E0'

export function Cronograma() {
  const hoje = diaDaSemanaHoje()
  let cronogramas = null
  let materias = []
  let erro = ''
  // lembra os últimos valores do formulário entre aberturas, como antes
  let form = { materiaId: '', diaDaSemana: 'MONDAY', horarioInicio: '08:00', horarioFim: '09:00' }

  const itens = new Map() // id -> { li, atualizar }

  // ---------- sessão (um bloco do cronograma) ----------
  function criarSessao() {
    let atual = null
    const horario = h('p', { class: 'sessao__horario numeros' })
    const nome = h('span', { class: 'riscado' })
    const acoes = h('div', { class: 'sessao__acoes' })
    const li = h('li', { class: 'sessao' }, horario, h('p', { class: 'sessao__nome' }, nome), acoes)

    const concluir = async () => {
      try { await cronogramasApi.concluir(atual.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
    }
    const remover = async () => {
      const ok = await confirmar({
        titulo: 'Excluir sessão',
        mensagem: `Excluir a sessão de ${atual.materia?.nome} de ${NOMES_DIAS[atual.diaDaSemana].toLowerCase()}, ${hhmm(atual.horarioInicio)}–${hhmm(atual.horarioFim)}?`,
        acao: 'Excluir',
      })
      if (!ok) return
      try { await cronogramasApi.deletar(atual.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
    }

    function atualizar(c) {
      atual = c
      const cor = c.materia?.cor || COR_PADRAO
      const feita = c.status === 'CONCLUIDO'
      li.classList.toggle('feita', feita)
      li.style.backgroundColor = `${cor}22`
      li.style.boxShadow = `inset 3px 0 0 ${cor}`
      horario.textContent = `${hhmm(c.horarioInicio)}–${hhmm(c.horarioFim)}`
      nome.textContent = c.materia?.nome
      nome.classList.toggle('concluido', feita)
      acoes.replaceChildren(
        feita
          ? icone('check-circle', { tamanho: 18, classe: 'ok-icone sessao__ok', rotulo: 'Concluída' })
          : h('button', { class: 'btn-icone btn-icone--p btn-icone-ok', onClick: concluir, 'aria-label': `Concluir sessão de ${c.materia?.nome}` }, icone('check-circle', { tamanho: 16 })),
        h('button', { class: 'btn-icone btn-icone-perigo btn-icone--p', onClick: remover, 'aria-label': `Excluir sessão de ${c.materia?.nome}` }, icone('trash', { tamanho: 15 })))
    }
    return { li, atualizar }
  }

  // ---------- grade semanal (criada uma vez; os blocos são reaproveitados) ----------
  const colunas = {}
  const grade = h('div', { class: 'grade-semana' }, DIAS_SEMANA.map((dia) => {
    const ehHoje = dia === hoje
    const livre = h('li', { class: 'dia__livre' }, 'Livre')
    const ul = h('ul', { class: 'pilha pilha--pequena' }, livre)
    colunas[dia] = { ul, livre }
    return h('section', { class: `dia ${ehHoje ? 'dia--hoje' : ''}`, 'aria-label': NOMES_DIAS[dia] },
      h('h2', { class: 'dia__titulo' },
        h('span', { class: ehHoje ? 'dia__nome dia__nome--hoje' : 'dia__nome' },
          h('span', { class: 'so-mobile' }, NOMES_DIAS[dia]),
          h('span', { class: 'so-desktop' }, NOMES_DIAS_CURTOS[dia])),
        ehHoje && h('span', { class: 'dia__selo' }, 'hoje')),
      ul)
  }))
  const aviso = h('p', { class: 'aviso-vazio', hidden: true },
    icone('calendar-days', { tamanho: 16, classe: 'link aviso-vazio__icone' }),
    'Nenhuma sessão planejada. Use “Nova sessão” para montar sua semana.')
  const conteudo = h('div', {}, aviso, grade)

  function desenharGrade() {
    aviso.hidden = cronogramas.length > 0
    const vivos = new Set(cronogramas.map((c) => c.id))
    for (const id of [...itens.keys()]) if (!vivos.has(id)) itens.delete(id)

    for (const dia of DIAS_SEMANA) {
      const lista = cronogramas.filter((c) => c.diaDaSemana === dia)
        .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
      const els = lista.map((c) => {
        let item = itens.get(c.id)
        if (!item) { item = criarSessao(); itens.set(c.id, item) }
        item.atualizar(c)
        return item.li
      })
      reconciliar(colunas[dia].ul, els.length ? els : [colunas[dia].livre])
    }
  }

  // ---------- carregamento ----------
  const corpo = h('div', {}, Carregando('grade'))

  function mostrar() {
    if (erro) corpo.replaceChildren(ErroCarregar(erro, carregar))
    else if (!cronogramas) corpo.replaceChildren(Carregando('grade'))
    else {
      desenharGrade()
      if (corpo.firstChild !== conteudo) corpo.replaceChildren(conteudo)
    }
  }

  function carregar() {
    erro = ''
    return Promise.all([cronogramasApi.listar(), materiasApi.listar()])
      .then(([c, m]) => { cronogramas = c; materias = m })
      .catch((err) => { erro = mensagemDeErro(err, 'Não foi possível carregar o cronograma') })
      .then(mostrar)
  }

  // ---------- formulário "Nova sessão" ----------
  function abrirForm() {
    abrirModal({ titulo: 'Nova sessão', largura: 'md', corpo: (modal) => {
      if (materias.length === 0) {
        return h('div', { class: 'pilha pilha--media' },
          h('p', { class: 'texto-suave texto-pequeno' }, 'Cadastre uma matéria antes de planejar uma sessão.'),
          h('div', { class: 'modal__acoes' },
            h('button', { class: 'btn btn-fantasma', onClick: () => modal.fechar() }, 'Fechar'),
            h('a', { href: '#/materias', class: 'btn btn-primario' }, 'Ir para matérias')))
      }
      const selMateria = h('select', { id: 'c-materia', class: 'campo', required: true, value: form.materiaId,
        onChange: (e) => { form.materiaId = e.target.value } },
        h('option', { value: '' }, 'Selecione'),
        materias.map((m) => h('option', { value: m.id }, m.nome)))
      const selDia = h('select', { id: 'c-dia', class: 'campo', value: form.diaDaSemana,
        onChange: (e) => { form.diaDaSemana = e.target.value } },
        DIAS_SEMANA.map((d) => h('option', { value: d }, NOMES_DIAS[d])))
      const ini = h('input', { id: 'c-ini', type: 'time', class: 'campo', required: true, value: form.horarioInicio,
        onInput: (e) => { form.horarioInicio = e.target.value } })
      const fim = h('input', { id: 'c-fim', type: 'time', class: 'campo', required: true, value: form.horarioFim,
        onInput: (e) => { form.horarioFim = e.target.value } })
      const salvar = h('button', { class: 'btn btn-primario' })
      rotuloBotao(salvar, { texto: 'Adicionar' })

      return h('form', { class: 'form-grade', onSubmit: async (e) => {
        e.preventDefault()
        if (form.horarioFim <= form.horarioInicio) { toast.erro('O horário de término deve ser depois do início.'); return }
        rotuloBotao(salvar, { carregando: true, texto: 'Adicionar' })
        try {
          await cronogramasApi.criar({ ...form, materiaId: Number(form.materiaId) })
          toast.sucesso('Sessão adicionada')
          form = { ...form, materiaId: '', horarioInicio: '08:00', horarioFim: '09:00' }
          modal.fechar()
          carregar()
        } catch (err) {
          toast.erro(mensagemDeErro(err))
          rotuloBotao(salvar, { texto: 'Adicionar' })
        }
      } },
        h('div', { class: 'form-grade__todo' }, h('label', { for: 'c-materia', class: 'campo-rotulo' }, 'Matéria'), selMateria),
        h('div', { class: 'form-grade__todo' }, h('label', { for: 'c-dia', class: 'campo-rotulo' }, 'Dia'), selDia),
        h('div', {}, h('label', { for: 'c-ini', class: 'campo-rotulo' }, 'Início'), ini),
        h('div', {}, h('label', { for: 'c-fim', class: 'campo-rotulo' }, 'Término'), fim),
        h('div', { class: 'modal__acoes form-grade__todo' },
          h('button', { type: 'button', class: 'btn btn-fantasma', onClick: () => modal.fechar() }, 'Cancelar'), salvar))
    } })
  }

  carregar()
  const el = h('div', {},
    Cabecalho('Cronograma',
      h('button', { class: 'btn btn-primario', 'aria-haspopup': 'dialog', onClick: abrirForm }, icone('plus', { tamanho: 16 }), ' Nova sessão')),
    corpo)
  return { el }
}
