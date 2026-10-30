const CHAVE = 'sp-tema'

function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'dark' || salvo === 'light') return salvo
  } catch { /* armazenamento indisponível */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let tema = temaInicial()

function aplicar() {
  document.documentElement.classList.toggle('dark', tema === 'dark')
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', tema === 'dark' ? '#0D0F23' : '#F3F4FA')
}

export const temaEscuro = () => tema === 'dark'

export function iniciarTema() { aplicar() }

export function alternarTema() {
  const raiz = document.documentElement
  raiz.classList.add('theme-anim')
  window.setTimeout(() => raiz.classList.remove('theme-anim'), 450)
  tema = tema === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem(CHAVE, tema) } catch { /* ignora */ }
  aplicar()
}
