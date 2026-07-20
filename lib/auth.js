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
    // localStorage-д хадгалагдсан хэрэглэгчийн мэдээлэл нь зөвхөн НЭВТРЭХ мөчийн
    // хуучирсан хувилбар — жишээ нь аппад байршуулсан профайл зураг гэх мэт
    // өөр төхөөрөмж/session дээр хийсэн өөрчлөлт үүнд тусахгүй. Тиймээс
    // сервэрээс шинэ мэдээллийг татаж localStorage/state-г шинэчилнэ.
    if (token) refreshUser();
  }, []);

  // Хэрэглэгч мобайл апп дээр зураг/профайл өөрчилсний дараа веб tab руу буцаж
  // ирэхэд (browser tab focus) дахин full reload хийхгүйгээр шинэ мэдээллийг татна.
  useEffect(() => {
    function onFocus() { if (localStorage.getItem('token')) refreshUser(); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

  // Багц худалдан авалт зэрэг серверт өөрчлөгдсөн хэрэглэгчийн мэдээллийг
  // дахин ачаалж, localStorage/state-г шинэчлэх — жишээ нь төлбөр амжилттай
  // болмогц дахин reload хийхгүйгээр багцын шинэчлэлт бүх компонентад тусна.
  async function refreshUser() {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
