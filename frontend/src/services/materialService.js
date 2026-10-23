import api from '../api/axios'

export const listarMateriaisPorMateria = (materiaId) =>
  api.get(`/materiais/materia/${materiaId}`).then(r => r.data)

export const criarMaterial = (material, materiaId) =>
  api.post(`/materiais?materiaId=${materiaId}`, material).then(r => r.data)

export const deletarMaterial = (id) => api.delete(`/materiais/${id}`)