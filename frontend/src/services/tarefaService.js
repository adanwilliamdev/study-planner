import api from '../api/axios'

export const listarTarefas = () => api.get('/tarefas').then(r => r.data)
export const criarTarefa = (t, materiaId) =>
  api.post(`/tarefas?materiaId=${materiaId ?? ''}`, t).then(r => r.data)
export const atualizarTarefa = (id, t, materiaId) =>
  api.put(`/tarefas/${id}?materiaId=${materiaId ?? ''}`, t).then(r => r.data)
export const deletarTarefa = (id) => api.delete(`/tarefas/${id}`)