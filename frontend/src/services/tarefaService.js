import api from '../api/axios'

// O corpo leva materiaId (ou null para tarefa sem materia)
export const listarTarefas = () => api.get('/tarefas').then(r => r.data)
export const criarTarefa = (t) => api.post('/tarefas', t).then(r => r.data)
export const atualizarTarefa = (id, t) => api.put(`/tarefas/${id}`, t).then(r => r.data)
export const deletarTarefa = (id) => api.delete(`/tarefas/${id}`)
