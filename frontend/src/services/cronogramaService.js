import api from '../api/axios'

// O corpo leva materiaId, diaDaSemana, horarioInicio e horarioFim
export const listarCronogramas = () => api.get('/cronogramas').then(r => r.data)
export const criarCronograma = (c) => api.post('/cronogramas', c).then(r => r.data)
export const concluirCronograma = (id) => api.put(`/cronogramas/${id}/concluir`).then(r => r.data)
export const deletarCronograma = (id) => api.delete(`/cronogramas/${id}`)
