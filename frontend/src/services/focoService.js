import api from '../api/axios'

// O corpo leva minutos e, opcionalmente, materiaId
export const registrarFoco = (foco) => api.post('/foco', foco).then(r => r.data)
