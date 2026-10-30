import { ICONES } from './icones.js'

const SVG_NS = 'http://www.w3.org/2000/svg'
const PROPRIEDADES = ['value', 'checked', 'disabled', 'selected']

function anexar(pai, filhos) {
  for (const f of filhos) {
    if (f === null || f === undefined || f === false) continue
    if (Array.isArray(f)) anexar(pai, f)
    else pai.append(f instanceof Node ? f : document.createTextNode(String(f)))
  }
}

/**
 * Cria um elemento. h('div', { class: 'x', onClick: fn }, 'texto', outroNo)
 * Textos entram como nós de texto (nunca como HTML), então não há risco de injeção.
 */
export function h(tag, props, ...filhos) {
  const el = document.createElement(tag)
  const props2 = {}
  for (const [chave, valor] of Object.entries(props || {})) {
    if (valor === null || valor === undefined || valor === false) continue
    if (chave === 'class') el.className = valor
    else if (chave === 'style' && typeof valor === 'object') {
      for (const [k, v] of Object.entries(valor)) {
        if (k.startsWith('--')) el.style.setProperty(k, v)
        else el.style[k] = v
      }
    } else if (chave.startsWith('on')) el.addEventListener(chave.slice(2).toLowerCase(), valor)
    else if (PROPRIEDADES.includes(chave)) props2[chave] = valor // depois dos filhos (ex.: <select>)
    else el.setAttribute(chave, valor === true ? '' : valor)
  }
  anexar(el, filhos)
  Object.assign(el, props2)
  return el
}

/** Ícone SVG inline. opcoes: { tamanho, classe, preencher, rotulo } */
export function icone(nome, { tamanho = 20, classe = '', preencher = false, rotulo } = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', tamanho)
  svg.setAttribute('height', tamanho)
  svg.setAttribute('fill', preencher ? 'currentColor' : 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('class', `icone ${classe}`.trim())
  if (rotulo) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', rotulo) }
  else svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML = ICONES[nome] || '' // conteúdo estático definido em icones.js
  return svg
}

/** Reordena os filhos de `pai` sem remover os que já estão na posição certa (preserva transições CSS). */
export function reconciliar(pai, ordenados) {
  const conjunto = new Set(ordenados)
  for (const filho of [...pai.children]) if (!conjunto.has(filho)) filho.remove()
  let ref = pai.firstElementChild
  for (const el of ordenados) {
    if (el === ref) ref = ref.nextElementSibling
    else pai.insertBefore(el, ref)
  }
}

/** Botão com spinner: define o texto e o estado "enviando". */
export function rotuloBotao(botao, { carregando, texto, icone: nomeIcone }) {
  botao.disabled = !!carregando
  const antes = carregando ? icone('loader', { tamanho: 16, classe: 'girar' })
    : nomeIcone ? icone(nomeIcone, { tamanho: 16 }) : null
  botao.replaceChildren(...[antes, texto].filter(Boolean))
}
