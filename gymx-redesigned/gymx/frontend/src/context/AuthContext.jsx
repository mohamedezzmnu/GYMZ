import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzcwZS4IU9eIDc3LQPOdRdn3YaQzFzn8I379JYpDJUAYZ_P1x3Lr1RkgJNe7SKSHxXk/exec";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gymx_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading] = useState(false);

  const sheetRequest = async (body) => {
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    });
    return await res.json();
  };

  const register = async (name, email, password) => {
    const data = await sheetRequest({ action: 'register', name, email, password });
    if (data.error) throw new Error(data.error);
    localStorage.setItem('gymx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const data = await sheetRequest({ action: 'login', email, password });
    if (data.error) throw new Error(data.error);
    localStorage.setItem('gymx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('gymx_user');
    setUser(null);
    toast.success('Logged out');
  };

  const api = {
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export { AuthContext };
import axios from 'axios';
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
