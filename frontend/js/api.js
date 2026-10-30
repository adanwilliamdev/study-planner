import { API_URL } from './config.js'
import { ErroApi } from './lib/erros.js'

async function requisitar(metodo, caminho, corpo) {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(API_URL + caminho, {
      method: metodo, headers, body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ErroApi(0, null)
  }

  const texto = await res.text()
  let dados = texto
  try { dados = texto ? JSON.parse(texto) : null } catch { /* resposta não-JSON: mantém o texto */ }

  if (!res.ok) {
    // 401 em rotas protegidas = sessao expirada. (Em /auth/login o 401 e "senha errada".)
    if (res.status === 401 && !caminho.startsWith('/auth/')) window.dispatchEvent(new Event('auth:expirada'))
    throw new ErroApi(res.status, dados)
  }
  return dados
}

const get = (c) => requisitar('GET', c)
const post = (c, b) => requisitar('POST', c, b)
const put = (c, b) => requisitar('PUT', c, b)
const del = (c) => requisitar('DELETE', c)

export const authApi = {
  login: (email, senha) => post('/auth/login', { email, senha }),
  register: (nome, email, senha) => post('/auth/register', { nome, email, senha }),
}

export const materiasApi = {
  listar: () => get('/materias'),
  criar: (m) => post('/materias', m),
  atualizar: (id, m) => put(`/materias/${id}`, m),
  deletar: (id) => del(`/materias/${id}`),
}

// O corpo leva materiaId (ou null para tarefa sem materia)
export const tarefasApi = {
  listar: () => get('/tarefas'),
  criar: (t) => post('/tarefas', t),
  atualizar: (id, t) => put(`/tarefas/${id}`, t),
  deletar: (id) => del(`/tarefas/${id}`),
}

// O corpo leva materiaId, diaDaSemana, horarioInicio e horarioFim
export const cronogramasApi = {
  listar: () => get('/cronogramas'),
  criar: (c) => post('/cronogramas', c),
  concluir: (id) => put(`/cronogramas/${id}/concluir`),
  deletar: (id) => del(`/cronogramas/${id}`),
}

export const materiaisApi = {
  porMateria: (materiaId) => get(`/materiais/materia/${materiaId}`),
  criar: (m) => post('/materiais', m),
  deletar: (id) => del(`/materiais/${id}`),
}
