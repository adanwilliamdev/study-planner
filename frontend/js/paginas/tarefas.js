import { h, icone, reconciliar, rotuloBotao } from '../dom.js'
import { tarefasApi, materiasApi } from '../api.js'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../componentes/estados.js'
import { Segmentado } from '../componentes/segmentado.js'
import { abrirModal, confirmar } from '../modal.js'
import { toast } from '../toast.js'
import { mensagemDeErro } from '../lib/erros.js'
import { rotuloPrazo } from '../lib/datas.js'

const PRIORIDADES = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' }
const PRIO_COR = { ALTA: 'tom-ruim', MEDIA: 'tom-aviso', BAIXA: 'tom-ok' }
const STATUS = { A_FAZER: 'A fazer', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluída' }
const PRAZO_COR = { atrasada: 'tom-ruim', urgente: 'tom-aviso', proxima: 'tom-marca', normal: 'tom-neutro' }
const FILTROS = [['ABERTAS', 'Abertas'], ['EM_ANDAMENTO', 'Em andamento'], ['CONCLUIDO', 'Concluídas'], ['TODAS', 'Todas']]
const FORM_VAZIO = { titulo: '', descricao: '', dataEntrega: '', prioridade: 'MEDIA', status: 'A_FAZER', materiaId: '' }

const paraForm = (t) => ({
  titulo: t.titulo, descricao: t.descricao || '', dataEntrega: t.dataEntrega || '',
  prioridade: t.prioridade, status: t.status, materiaId: t.materia?.id ?? '',
})
const paraPayload = (f) => ({
  ...f, descricao: f.descricao.trim() || null, dataEntrega: f.dataEntrega || null,
  materiaId: f.materiaId === '' ? null : Number(f.materiaId),
})

// ---------- formulário (dentro do modal) ----------
function FormTarefa({ inicial, materias, rotuloBotaoSalvar, onSalvar, onCancelar }) {
  const form = { ...inicial }
  const campo = (chave) => (e) => { form[chave] = e.target.value }
  const opcoes = (obj) => Object.entries(obj).map(([v, r]) => h('option', { value: v }, r))

  const salvar = h('button', { class: 'btn btn-primario' })
  rotuloBotao(salvar, { texto: rotuloBotaoSalvar })

  return h('form', { class: 'pilha pilha--media', onSubmit: async (e) => {
    e.preventDefault()
    rotuloBotao(salvar, { carregando: true, texto: rotuloBotaoSalvar })
    try { await onSalvar(form) } finally { rotuloBotao(salvar, { texto: rotuloBotaoSalvar }) }
  } },
    h('div', {}, h('label', { for: 't-titulo', class: 'campo-rotulo' }, 'Título'),
      h('input', { id: 't-titulo', class: 'campo', required: true, maxlength: 150, value: form.titulo, onInput: campo('titulo') })),
    h('div', {}, h('label', { for: 't-desc', class: 'campo-rotulo' }, 'Descrição'),
      h('textarea', { id: 't-desc', rows: 2, class: 'campo campo--textarea', maxlength: 1000, value: form.descricao, onInput: campo('descricao') })),
    h('div', { class: 'form-grade' },
      h('div', {}, h('label', { for: 't-data', class: 'campo-rotulo' }, 'Prazo'),
        h('input', { id: 't-data', type: 'date', class: 'campo', value: form.dataEntrega, onInput: campo('dataEntrega') })),
      h('div', {}, h('label', { for: 't-materia', class: 'campo-rotulo' }, 'Matéria'),
        h('select', { id: 't-materia', class: 'campo', value: String(form.materiaId), onChange: campo('materiaId') },
          h('option', { value: '' }, 'Sem matéria'), materias.map((m) => h('option', { value: m.id }, m.nome)))),
      h('div', {}, h('label', { for: 't-prio', class: 'campo-rotulo' }, 'Prioridade'),
        h('select', { id: 't-prio', class: 'campo', value: form.prioridade, onChange: campo('prioridade') }, opcoes(PRIORIDADES))),
      h('div', {}, h('label', { for: 't-status', class: 'campo-rotulo' }, 'Status'),
        h('select', { id: 't-status', class: 'campo', value: form.status, onChange: campo('status') }, opcoes(STATUS)))),
    h('div', { class: 'modal__acoes' },
      h('button', { type: 'button', class: 'btn btn-fantasma', onClick: onCancelar }, 'Cancelar'), salvar))
}

// ---------- uma linha da lista ----------
// Cada linha é criada uma vez e atualizada no lugar, para as transições CSS (visto, risco, recolher) rodarem.
function criarItem({ onMarcar, onEditar, onExcluir }) {
  let atual = null
  const visto = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  visto.setAttribute('viewBox', '0 0 24 24'); visto.setAttribute('class', 'marca__svg'); visto.setAttribute('aria-hidden', 'true')
  visto.innerHTML = '<path class="marca__visto" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>'
  const marca = h('button', { class: 'marca', onClick: () => onMarcar(atual) }, h('span', { class: 'marca__circulo' }, visto))

  const titulo = h('span', { class: 'riscado' })
  const descricao = h('p', { class: 'tarefa__descricao' })
  const chips = h('div', { class: 'tarefa__chips' })
  const btnEditar = h('button', { class: 'btn-icone', onClick: () => onEditar(atual) }, icone('pencil', { tamanho: 16 }))
  const btnExcluir = h('button', { class: 'btn-icone btn-icone-perigo', onClick: () => onExcluir(atual) }, icone('trash', { tamanho: 16 }))

  const li = h('li', { class: 'tarefa-item' },
    h('div', { class: 'tarefa-item__interno' },
      h('div', { class: 'tarefa-item__espaco' },
        h('div', { class: 'painel painel-plano tarefa' }, marca,
          h('div', { class: 'min-0 tarefa__corpo' }, h('p', { class: 'tarefa__titulo' }, titulo), descricao, chips),
          h('div', { class: 'tarefa__acoes' }, btnEditar, btnExcluir)))))

  function atualizar(t, recente) {
    atual = t
    const feita = t.status === 'CONCLUIDO'
    const prazo = !feita && rotuloPrazo(t.dataEntrega)
    li.classList.toggle('saindo', recente === 'sai')
    marca.classList.toggle('feita', feita)
    marca.setAttribute('aria-pressed', String(feita))
    marca.setAttribute('aria-label', feita ? `Reabrir ${t.titulo}` : `Concluir ${t.titulo}`)
    titulo.textContent = t.titulo
    titulo.classList.toggle('concluido', feita)
    descricao.hidden = !t.descricao
    descricao.textContent = t.descricao || ''
    descricao.classList.toggle('texto-mudo', feita)
    btnEditar.setAttribute('aria-label', `Editar ${t.titulo}`)
    btnExcluir.setAttribute('aria-label', `Excluir ${t.titulo}`)
    chips.replaceChildren(
      t.materia && h('span', { class: 'chip tom-neutro' },
        h('span', { class: 'chip__ponto', style: { backgroundColor: t.materia.cor }, 'aria-hidden': 'true' }), t.materia.nome),
      h('span', { class: `chip ${PRIO_COR[t.prioridade]}` }, `Prioridade ${PRIORIDADES[t.prioridade].toLowerCase()}`),
      prazo && h('span', { class: `chip ${PRAZO_COR[prazo.tom]}` }, prazo.texto),
      !feita && t.status === 'EM_ANDAMENTO' && h('span', { class: 'chip tom-marca' }, 'Em andamento'))
  }
  return { li, atualizar }
}

// ---------- página ----------
export function Tarefas() {
  let tarefas = null
  let materias = []
  let erro = ''
  let filtro = 'ABERTAS'
  let filtroMateria = ''
  // id -> 'fica' | 'sai': tarefas que acabaram de mudar e ainda animam antes de sair da lista
  let recentes = {}
  const timers = {}
  const itens = new Map()

  const agendar = (id, fn, ms) => { (timers[id] ||= []).push(setTimeout(fn, ms)) }
  const limparTimers = (id) => { (timers[id] || []).forEach(clearTimeout); timers[id] = [] }

  // --- estrutura fixa da tela (criada uma vez) ---
  const segmentado = Segmentado({ opcoes: FILTROS, valor: filtro, rotulo: 'Filtrar por status', onChange: (v) => { filtro = v; desenhar() } })
  const selMateria = h('select', { class: 'campo campo--auto', 'aria-label': 'Filtrar por matéria',
    onChange: (e) => { filtroMateria = e.target.value; desenhar() } })
  const ul = h('ul', { class: 'lista-tarefas' })
  const area = h('div')
  const conteudo = h('div', {}, h('div', { class: 'filtros' }, segmentado.el, selMateria), area)
  const corpo = h('div', {}, Carregando('lista'))

  const novaTarefa = () => h('button', { class: 'btn btn-primario', onClick: () => abrirForm() }, icone('plus', { tamanho: 16 }), ' Nova tarefa')

  function atualizarSelectMaterias() {
    selMateria.replaceChildren(h('option', { value: '' }, 'Todas as matérias'),
      materias.map((m) => h('option', { value: m.id }, m.nome)))
    if (!materias.some((m) => String(m.id) === filtroMateria)) filtroMateria = ''
    selMateria.value = filtroMateria
    selMateria.hidden = materias.length === 0
  }

  function desenhar() {
    if (erro) { corpo.replaceChildren(ErroCarregar(erro, carregar)); return }
    if (!tarefas) { corpo.replaceChildren(Carregando('lista')); return }
    if (corpo.firstChild !== conteudo) corpo.replaceChildren(conteudo)

    const visiveis = tarefas.filter((t) => {
      if (filtroMateria && String(t.materia?.id) !== filtroMateria) return false
      if (recentes[t.id]) return true
      if (filtro === 'ABERTAS') return t.status !== 'CONCLUIDO'
      if (filtro === 'TODAS') return true
      return t.status === filtro
    })

    let alvo
    if (visiveis.length === 0) {
      alvo = tarefas.length === 0
        ? Vazio({ icone: 'list-checks', titulo: 'Nenhuma tarefa ainda', acao: novaTarefa() }, 'Crie sua primeira tarefa para acompanhar prazos e prioridades.')
        : Vazio({ icone: 'list-checks', titulo: 'Nada por aqui' }, 'Nenhuma tarefa corresponde aos filtros selecionados.')
    } else {
      const vivos = new Set(tarefas.map((t) => t.id))
      for (const id of [...itens.keys()]) if (!vivos.has(id)) itens.delete(id)
      reconciliar(ul, visiveis.map((t) => {
        let item = itens.get(t.id)
        if (!item) { item = criarItem({ onMarcar: marcar, onEditar: (x) => abrirForm(x), onExcluir: remover }); itens.set(t.id, item) }
        item.atualizar(t, recentes[t.id])
        return item.li
      }))
      alvo = ul
    }
    if (area.firstChild !== alvo) area.replaceChildren(alvo) // não reinsere a lista: preservaria nada das transições
  }

  function carregar() {
    erro = ''
    return Promise.all([tarefasApi.listar(), materiasApi.listar()])
      .then(([t, m]) => { tarefas = t; materias = m; atualizarSelectMaterias() })
      .catch((err) => { erro = mensagemDeErro(err, 'Não foi possível carregar as tarefas') })
      .then(desenhar)
  }

  async function mudarStatus(t, novo) {
    try {
      await tarefasApi.atualizar(t.id, paraPayload({ ...paraForm(t), status: novo }))
      tarefas = tarefas.map((x) => (x.id === t.id ? { ...x, status: novo } : x))
      const continuaNoFiltro = filtro === 'TODAS' || (filtro === 'ABERTAS' ? novo !== 'CONCLUIDO' : filtro === novo)
      if (continuaNoFiltro) { desenhar(); carregar(); return }
      // Sai do filtro atual: deixa o risco desenhar e só então recolhe a linha
      limparTimers(t.id)
      recentes = { ...recentes, [t.id]: 'fica' }
      desenhar()
      agendar(t.id, () => { if (recentes[t.id]) { recentes = { ...recentes, [t.id]: 'sai' }; desenhar() } }, 900)
      agendar(t.id, () => { const { [t.id]: _saiu, ...resto } = recentes; recentes = resto; carregar() }, 1250)
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }
  const marcar = (t) => mudarStatus(t, t.status === 'CONCLUIDO' ? 'A_FAZER' : 'CONCLUIDO')

  async function remover(t) {
    if (!(await confirmar({ titulo: 'Excluir tarefa', mensagem: `Excluir "${t.titulo}"?`, acao: 'Excluir' }))) return
    try {
      await tarefasApi.deletar(t.id)
      toast.sucesso('Tarefa excluída')
      limparTimers(t.id)
      recentes = { ...recentes, [t.id]: 'sai' }
      desenhar()
      agendar(t.id, () => carregar(), 320)
    } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  function abrirForm(edicao) {
    abrirModal({ titulo: edicao ? 'Editar tarefa' : 'Nova tarefa', corpo: (modal) => FormTarefa({
      inicial: edicao ? paraForm(edicao) : FORM_VAZIO, materias,
      rotuloBotaoSalvar: edicao ? 'Salvar' : 'Criar tarefa',
      onCancelar: () => modal.fechar(),
      onSalvar: async (form) => {
        try {
          if (edicao) await tarefasApi.atualizar(edicao.id, paraPayload(form))
          else await tarefasApi.criar(paraPayload(form))
          toast.sucesso(edicao ? 'Tarefa atualizada' : 'Tarefa criada')
          modal.fechar()
          carregar()
        } catch (err) { toast.erro(mensagemDeErro(err)) }
      },
    }) })
  }

  carregar()
  return {
    el: h('div', {}, Cabecalho('Tarefas', novaTarefa()), corpo),
    destruir: () => Object.values(timers).flat().forEach(clearTimeout),
  }
}
