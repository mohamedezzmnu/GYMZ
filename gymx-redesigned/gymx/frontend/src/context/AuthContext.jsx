import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Intercept requests — add access token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('gymx_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept responses — auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 &&
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('gymx_refresh');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
        sessionStorage.setItem('gymx_access_token', res.data.accessToken);
        Cookies.set('gymx_refresh', res.data.refreshToken, { secure: true, sameSite: 'strict', expires: 7 });

        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch {
        sessionStorage.removeItem('gymx_access_token');
        Cookies.remove('gymx_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('gymx_access_token');
      if (!token) { setLoading(false); return; }

      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('gymx_access_token', res.data.accessToken);
    Cookies.set('gymx_refresh', res.data.refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: 7,
    });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    sessionStorage.setItem('gymx_access_token', res.data.accessToken);
    Cookies.set('gymx_refresh', res.data.refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: 7,
    });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      const refreshToken = Cookies.get('gymx_refresh');
      await api.post('/auth/logout', { refreshToken });
    } finally {
      sessionStorage.removeItem('gymx_access_token');
      Cookies.remove('gymx_refresh');
      setUser(null);
      toast.success('Logged out');
    }
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

export { api };
