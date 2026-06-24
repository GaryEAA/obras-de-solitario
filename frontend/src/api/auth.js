import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export const login = async (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const res = await api.post('/auth/login', form)
  return res.data
}