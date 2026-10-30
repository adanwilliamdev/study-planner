function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return !payload.exp || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function limpar() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

function lerSessao() {
  const token = localStorage.getItem('token')
  if (!token || tokenExpirado(token)) {
    limpar()
    return { token: null, usuario: null }
  }
  let usuario = null
  try { usuario = JSON.parse(localStorage.getItem('usuario')) } catch { /* ignora */ }
  return { token, usuario }
}

let sessao = lerSessao()

export const token = () => sessao.token
export const usuario = () => sessao.usuario
export const autenticado = () => !!sessao.token

export function entrar(dados) {
  const u = { nome: dados.nome, email: dados.email }
  localStorage.setItem('token', dados.token)
  localStorage.setItem('usuario', JSON.stringify(u))
  sessao = { token: dados.token, usuario: u }
}

export function sair() {
  limpar()
  sessao = { token: null, usuario: null }
}
