import axios from 'axios'
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
});

export const login = async (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const res = await api.post('/auth/login', form)
  return res.data
}