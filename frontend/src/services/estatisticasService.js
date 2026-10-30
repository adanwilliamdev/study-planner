import api from '../api/axios'

export const obterEstatisticas = (dias = 7) =>
  api.get('/estatisticas', { params: { dias } }).then(r => r.data)
