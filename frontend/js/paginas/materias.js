import { h, icone, reconciliar, rotuloBotao } from '../dom.js'
import { materiasApi, tarefasApi, materiaisApi } from '../api.js'
import { Cabecalho, Carregando, ErroCarregar, Vazio } from '../componentes/estados.js'
import { abrirModal, confirmar } from '../modal.js'
import { toast } from '../toast.js'
import { mensagemDeErro } from '../lib/erros.js'
import { iniciais, textoSobre } from '../lib/cores.js'

const COR_PADRAO = '#4A44E0'
const TIPOS = { LINK: 'Link', PDF: 'PDF', RESUMO: 'Resumo' }
const PALETA = [
  ['#4A44E0', 'Índigo'], ['#0EA5E9', 'Azul'], ['#14B8A6', 'Turquesa'], ['#10B981', 'Verde'],
  ['#F59E0B', 'Âmbar'], ['#EF4444', 'Vermelho'], ['#EC4899', 'Rosa'], ['#8B5CF6', 'Violeta'],
]

// ---------- formulário de matéria (dentro do modal) ----------
function FormMateria({ inicial, onSalvar, onCancelar }) {
  const form = { ...inicial }
  const nome = h('input', { id: 'mat-nome', class: 'campo', required: true, maxlength: 100, value: form.nome,
    onInput: (e) => { form.nome = e.target.value } })
  const carga = h('input', { id: 'mat-carga', type: 'number', min: '0', class: 'campo', value: form.cargaHoraria,
    onInput: (e) => { form.cargaHoraria = Math.max(0, +e.target.value || 0) } })

  const botoesCor = PALETA.map(([hex, rotulo]) => h('button', { type: 'button', class: 'cor-bolinha', 'aria-label': rotulo,
    style: { backgroundColor: hex }, onClick: () => escolherCor(hex) }))
  const seletor = h('input', { type: 'color', class: 'cor-outra__input', value: form.cor || COR_PADRAO,
    onInput: (e) => escolherCor(e.target.value) })

  function escolherCor(hex) {
    form.cor = hex
    seletor.value = hex
    PALETA.forEach(([c], i) => {
      const ativa = c.toLowerCase() === hex.toLowerCase()
      botoesCor[i].classList.toggle('ativa', ativa)
      botoesCor[i].setAttribute('aria-pressed', String(ativa))
    })
  }
  escolherCor(form.cor || COR_PADRAO)

  const salvar = h('button', { class: 'btn btn-primario' })
  rotuloBotao(salvar, { texto: 'Salvar' })

  return h('form', { class: 'pilha pilha--grande', onSubmit: async (e) => {
    e.preventDefault()
    rotuloBotao(salvar, { carregando: true, texto: 'Salvar' })
    try { await onSalvar(form) } finally { rotuloBotao(salvar, { texto: 'Salvar' }) }
  } },
    h('div', {}, h('label', { for: 'mat-nome', class: 'campo-rotulo' }, 'Nome'), nome),
    h('div', {}, h('label', { for: 'mat-carga', class: 'campo-rotulo' }, 'Carga horária (h)'), carga),
    h('div', {},
      h('span', { class: 'campo-rotulo', id: 'mat-cor-rotulo' }, 'Cor'),
      h('div', { class: 'cores', role: 'group', 'aria-labelledby': 'mat-cor-rotulo' }, botoesCor,
        h('label', { class: 'cor-outra' }, icone('plus', { tamanho: 14 }), h('span', { class: 'sr-only' }, 'Escolher outra cor'), seletor))),
    h('div', { class: 'modal__acoes' },
      h('button', { type: 'button', class: 'btn btn-fantasma', onClick: onCancelar }, 'Cancelar'), salvar))
}

// ---------- materiais de uma matéria ----------
function ConteudoMaterial(m) {
  if (m.tipo === 'RESUMO') return h('p', { class: 'material__resumo' }, m.urlOuCaminho)
  const ehUrl = /^https?:\/\//i.test(m.urlOuCaminho || '')
  return ehUrl
    ? h('a', { href: m.urlOuCaminho, target: '_blank', rel: 'noopener noreferrer', class: 'link link--pequeno link--inline' }, 'Abrir ', icone('external-link', { tamanho: 13 }))
    : h('span', { class: 'material__caminho' }, m.urlOuCaminho)
}

function PainelMateriais(materia) {
  let materiais = null
  const lista = h('div', {}, h('div', { class: 'esqueleto esqueleto--material', role: 'status', 'aria-label': 'Carregando materiais' }))

  const titulo = h('input', { class: 'campo', placeholder: 'Título', 'aria-label': 'Título do material', required: true, maxlength: 150 })
  const tipo = h('select', { class: 'campo', 'aria-label': 'Tipo', onChange: ajustarConteudo },
    Object.entries(TIPOS).map(([v, r]) => h('option', { value: v }, r)))
  const conteudo = h('textarea', { class: 'campo campo--textarea', 'aria-label': 'Conteúdo do material', required: true, maxlength: 1000 })
  const botao = h('button', { class: 'btn btn-suave btn-direita' })
  rotuloBotao(botao, { texto: ' Adicionar material', icone: 'plus' })

  function ajustarConteudo() {
    conteudo.rows = tipo.value === 'RESUMO' ? 3 : 1
    conteudo.placeholder = tipo.value === 'RESUMO' ? 'Escreva o resumo' : tipo.value === 'PDF' ? 'Link ou caminho do PDF' : 'https://…'
  }
  ajustarConteudo()

  function desenharLista() {
    if (!materiais) return
    if (materiais.length === 0) {
      lista.replaceChildren(h('p', { class: 'texto-mudo texto-pequeno lista-materiais__vazio' }, 'Nenhum material ainda.'))
      return
    }
    lista.replaceChildren(h('ul', { class: 'lista-materiais' }, materiais.map((m) =>
      h('li', { class: 'material' },
        h('span', { class: 'material__icone' }, icone(m.tipo === 'LINK' ? 'link' : 'file-text', { tamanho: 15 })),
        h('div', { class: 'min-0 material__corpo' },
          h('p', { class: 'material__titulo truncar' }, m.titulo, ' ', h('span', { class: 'texto-mudo material__tipo' }, `(${TIPOS[m.tipo]})`)),
          ConteudoMaterial(m)),
        h('button', { class: 'btn-icone btn-icone-perigo btn-icone--p', 'aria-label': `Excluir ${m.titulo}`, onClick: () => remover(m) }, icone('trash', { tamanho: 15 }))))))
  }

  const carregar = () => materiaisApi.porMateria(materia.id)
    .then((m) => { materiais = m; desenharLista() })
    .catch((err) => toast.erro(mensagemDeErro(err)))

  async function remover(m) {
    if (!(await confirmar({ titulo: 'Excluir material', mensagem: `Excluir "${m.titulo}"?`, acao: 'Excluir' }))) return
    try { await materiaisApi.deletar(m.id); carregar() } catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  const form = h('form', { class: 'form-material', onSubmit: async (e) => {
    e.preventDefault()
    rotuloBotao(botao, { carregando: true, texto: ' Adicionar material' })
    try {
      await materiaisApi.criar({ titulo: titulo.value, tipo: tipo.value, urlOuCaminho: conteudo.value, materiaId: materia.id })
      titulo.value = ''; conteudo.value = ''; tipo.value = 'LINK'; ajustarConteudo()
      carregar()
    } catch (err) { toast.erro(mensagemDeErro(err)) }
    rotuloBotao(botao, { texto: ' Adicionar material', icone: 'plus' })
  } },
    h('div', { class: 'form-material__linha' }, titulo, tipo), conteudo, botao)

  carregar()
  return h('div', { class: 'materiais' }, lista, form)
}

// ---------- cartão de matéria ----------
function criarCard({ onEditar, onExcluir, onAlternar }) {
  let atual = null
  let painel = null // criado só na primeira vez que o cartão é aberto
  const sigla = h('span', { class: 'cartao-materia__sigla', 'aria-hidden': 'true' })
  const nome = h('h2', { class: 'cartao-materia__nome' })
  const carga = h('p', { class: 'cartao-materia__carga' })
  const abertas = h('p', { class: 'texto-mudo texto-pequeno' })
  const btnEditar = h('button', { class: 'btn-icone', onClick: () => onEditar(atual) }, icone('pencil', { tamanho: 16 }))
  const btnExcluir = h('button', { class: 'btn-icone btn-icone-perigo', onClick: () => onExcluir(atual) }, icone('trash', { tamanho: 16 }))
  const seta = icone('chevron-down', { tamanho: 15, classe: 'cartao-materia__seta' })
  const toggle = h('button', { class: 'cartao-materia__toggle', onClick: () => onAlternar(atual) }, 'Materiais ', seta)
  const interno = h('div', { class: 'colapso__interno' })
  const colapso = h('div', { class: 'colapso' }, interno)

  const li = h('li', { class: 'painel cartao-materia' },
    h('div', { class: 'cartao-materia__topo' }, sigla,
      h('div', { class: 'min-0 cartao-materia__info' }, nome, carga, abertas),
      h('div', { class: 'cartao-materia__acoes' }, btnEditar, btnExcluir)),
    toggle, colapso)

  function atualizar(m, nAbertas, aberta) {
    atual = m
    sigla.style.backgroundColor = m.cor
    sigla.style.color = textoSobre(m.cor)
    sigla.textContent = iniciais(m.nome)
    nome.textContent = m.nome
    carga.textContent = `${m.cargaHoraria}h de carga horária`
    abertas.textContent = `${nAbertas} ${nAbertas === 1 ? 'tarefa aberta' : 'tarefas abertas'}`
    btnEditar.setAttribute('aria-label', `Editar ${m.nome}`)
    btnExcluir.setAttribute('aria-label', `Excluir ${m.nome}`)
    toggle.setAttribute('aria-expanded', String(aberta))
    seta.classList.toggle('girada', aberta)
    colapso.classList.toggle('aberto', aberta)
    if (aberta) colapso.removeAttribute('inert'); else colapso.setAttribute('inert', '')
    if (aberta && !painel) { painel = PainelMateriais(m); interno.append(painel) }
  }
  return { li, atualizar }
}

// ---------- página ----------
export function Materias() {
  let materias = null
  let abertas = {} // materiaId -> nº de tarefas abertas
  let erro = ''
  let expandida = null
  const cards = new Map()

  const lista = h('ul', { class: 'grade-cards grade-cards--topo' })
  const corpo = h('div', {}, Carregando('cards'))

  const novaMateria = () => h('button', { class: 'btn btn-primario', onClick: () => abrirForm() }, icone('plus', { tamanho: 16 }), ' Nova matéria')

  function desenhar() {
    if (erro) { corpo.replaceChildren(ErroCarregar(erro, carregar)); return }
    if (!materias) { corpo.replaceChildren(Carregando('cards')); return }
    if (materias.length === 0) {
      corpo.replaceChildren(Vazio({ icone: 'book-open', titulo: 'Nenhuma matéria cadastrada', acao: novaMateria() },
        'Cadastre suas matérias para organizar tarefas, horários e materiais de estudo.'))
      return
    }
    const vivos = new Set(materias.map((m) => m.id))
    for (const id of [...cards.keys()]) if (!vivos.has(id)) cards.delete(id)
    const els = materias.map((m) => {
      let c = cards.get(m.id)
      if (!c) { c = criarCard({ onEditar: (x) => abrirForm(x), onExcluir: remover, onAlternar: alternar }); cards.set(m.id, c) }
      c.atualizar(m, abertas[m.id] || 0, expandida === m.id)
      return c.li
    })
    reconciliar(lista, els)
    if (corpo.firstChild !== lista) corpo.replaceChildren(lista)
  }

  function carregar() {
    erro = ''
    return Promise.all([materiasApi.listar(), tarefasApi.listar()])
      .then(([m, t]) => {
        materias = m
        abertas = {}
        t.filter((x) => x.status !== 'CONCLUIDO' && x.materia).forEach((x) => { abertas[x.materia.id] = (abertas[x.materia.id] || 0) + 1 })
      })
      .catch((err) => { erro = mensagemDeErro(err, 'Não foi possível carregar as matérias') })
      .then(desenhar)
  }

  function alternar(m) {
    expandida = expandida === m.id ? null : m.id
    desenhar()
  }

  async function remover(m) {
    const ok = await confirmar({
      titulo: 'Excluir matéria',
      mensagem: `Excluir "${m.nome}"? As tarefas, sessões do cronograma e materiais desta matéria também serão removidos.`,
      acao: 'Excluir',
    })
    if (!ok) return
    try { await materiasApi.deletar(m.id); toast.sucesso('Matéria excluída'); carregar() }
    catch (err) { toast.erro(mensagemDeErro(err)) }
  }

  function abrirForm(edicao) {
    abrirModal({ titulo: edicao ? 'Editar matéria' : 'Nova matéria', largura: 'md', corpo: (modal) => FormMateria({
      inicial: edicao ? { nome: edicao.nome, cor: edicao.cor, cargaHoraria: edicao.cargaHoraria ?? 0 } : { nome: '', cor: COR_PADRAO, cargaHoraria: 0 },
      onCancelar: () => modal.fechar(),
      onSalvar: async (form) => {
        try {
          if (edicao) await materiasApi.atualizar(edicao.id, form)
          else await materiasApi.criar(form)
          toast.sucesso(edicao ? 'Matéria atualizada' : 'Matéria criada')
          modal.fechar()
          carregar()
        } catch (err) { toast.erro(mensagemDeErro(err)) }
      },
    }) })
  }

  carregar()
  return { el: h('div', {}, Cabecalho('Matérias', novaMateria()), corpo) }
}
