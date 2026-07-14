import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: BASE });

// Backend-ийн /uploads/... зэрэг ХАРЬЦАНГУЙ замыг бүтэн URL болгоно
// (жишээ нь профайл зураг — апп дээр байршуулсан ч энэ л зам дундаа).
export function uploadUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
