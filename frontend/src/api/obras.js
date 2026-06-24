import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getObras = (params) => api.get('/obras/', { params })
export const getObra = (id) => api.get(`/obras/${id}`)
export const getStats = () => api.get('/obras/stats')
export const crearObra = (data) => api.post('/obras/', data)
export const editarObra = (id, data) => api.put(`/obras/${id}`, data)
export const eliminarObra = (id) => api.delete(`/obras/${id}`)

export const getArtistas = () => api.get('/artistas/')
export const crearArtista = (data) => api.post('/artistas/', data)
export const editarArtista = (id, data) => api.put(`/artistas/${id}`, data)

export const getBeatmakers = () => api.get('/beatmakers/')
export const crearBeatmaker = (data) => api.post('/beatmakers/', data)
export const editarBeatmaker = (id, data) => api.put(`/beatmakers/${id}`, data)