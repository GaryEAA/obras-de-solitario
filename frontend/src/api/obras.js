import axios from 'axios'
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getCatalogo = (params) => api.get('/obras/catalogo', { params })

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

export const subirImagen = async (archivo) => {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/obras/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  return data.url
}