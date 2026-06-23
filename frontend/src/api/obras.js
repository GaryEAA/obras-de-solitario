import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export const getObras = (params) => api.get('/obras/', { params })
export const getObra = (id) => api.get(`/obras/${id}`)
export const getStats = () => api.get('/obras/stats')