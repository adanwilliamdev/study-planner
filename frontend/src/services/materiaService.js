import api from '../api/axios'

export const listarMaterias = () => api.get('/materias').then(r => r.data)
export const criarMateria = (m) => api.post('/materias', m).then(r => r.data)
export const atualizarMateria = (id, m) => api.put(`/materias/${id}`, m).then(r => r.data)
export const deletarMateria = (id) => api.delete(`/materias/${id}`)
