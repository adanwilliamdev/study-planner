import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 em rotas protegidas = sessao expirada. (Em /auth/login o 401 e "senha errada".)
    const naoEhAuth = !err.config?.url?.startsWith('/auth/')
    if (err.response?.status === 401 && naoEhAuth) {
      window.dispatchEvent(new Event('auth:expirada'))
    }
    return Promise.reject(err)
  }
)

export default api
