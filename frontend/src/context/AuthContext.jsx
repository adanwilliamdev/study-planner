import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return !payload.exp || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function lerSessao() {
  const token = localStorage.getItem('token')
  if (!token || tokenExpirado(token)) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    return { token: null, usuario: null }
  }
  let usuario = null
  try { usuario = JSON.parse(localStorage.getItem('usuario')) } catch { /* ignora */ }
  return { token, usuario }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)

  const login = useCallback((dados) => {
    const usuario = { nome: dados.nome, email: dados.email }
    localStorage.setItem('token', dados.token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    setSessao({ token: dados.token, usuario })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setSessao({ token: null, usuario: null })
  }, [])

  // O interceptor do axios avisa quando o servidor responde 401 em rota protegida
  useEffect(() => {
    window.addEventListener('auth:expirada', logout)
    return () => window.removeEventListener('auth:expirada', logout)
  }, [logout])

  const value = useMemo(
    () => ({ ...sessao, login, logout, isAuth: !!sessao.token }),
    [sessao, login, logout]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
