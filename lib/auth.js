'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  // Өдөрт нэг удаа checkin хийж streak-ийг тасрахаас сэргийлнэ
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('voca_last_checkin') === today) return;
    api.post('/api/streak/checkin').then(() => {
      localStorage.setItem('voca_last_checkin', today);
    }).catch(() => {});
  }, [user]);

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/');
  }

  async function register(username, email, password) {
    const { data } = await api.post('/api/auth/register', { username, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/');
  }

  async function loginWithGoogle(idToken) {
    const { data } = await api.post('/api/auth/google', { idToken });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
