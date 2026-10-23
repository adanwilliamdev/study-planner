import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const CHAVE = 'sp-tema'

function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'dark' || salvo === 'light') return salvo
  } catch { /* armazenamento indisponível */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', tema === 'dark' ? '#0D0F23' : '#F3F4FA')
  }, [tema])

  const alternar = useCallback(() => {
    const raiz = document.documentElement
    raiz.classList.add('theme-anim')
    window.setTimeout(() => raiz.classList.remove('theme-anim'), 450)
    const novo = tema === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem(CHAVE, novo) } catch { /* ignora */ }
    setTema(novo)
  }, [tema])

  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar])
  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
