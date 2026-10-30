import { h } from '../dom.js'

export function Logo(classe = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '30'); svg.setAttribute('height', '30')
  svg.setAttribute('viewBox', '0 0 32 32'); svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML =
    '<rect width="32" height="32" rx="9" class="logo__fundo"/>' +
    '<path d="M9 8h10a4 4 0 0 1 4 4v12H13a4 4 0 0 1-4-4V8z" fill="#fff"/>' +
    '<path d="M13 13.5h6M13 17.5h6" class="logo__traco" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M19 8h4v7l-2-1.6L19 15V8z" class="logo__fita"/>'
  return h('span', { class: `logo ${classe}`.trim() }, svg, 'Study Planner')
}
