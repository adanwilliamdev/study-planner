import api from '../api/axios'

export const login = (email, senha) =>
  api.post('/auth/login', { email, senha }).then(r => r.data)

export const register = (nome, email, senha) =>
  api.post('/auth/register', { nome, email, senha }).then(r => r.data)