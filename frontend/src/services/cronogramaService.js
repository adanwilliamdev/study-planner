import api from '../api/axios'

export const listarCronogramas = () => api.get('/cronogramas').then(r => r.data)
export const criarCronograma = (c, materiaId) =>
  api.post(`/cronogramas?materiaId=${materiaId}`, c).then(r => r.data)
export const concluirCronograma = (id) =>
  api.put(`/cronogramas/${id}/concluir`).then(r => r.data)
export const deletarCronograma = (id) => api.delete(`/cronogramas/${id}`)