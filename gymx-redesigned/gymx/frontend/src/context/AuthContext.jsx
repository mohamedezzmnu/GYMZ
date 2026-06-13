import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جيب الـ session الحالية لو موجودة
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        });
      }
      setLoading(false);
    });

    // استمع لأي تغيير في الـ auth (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw new Error(error.message);
    // Supabase بيبعت email confirmation — لو عايز تشيله روح Authentication > Email Templates
    return {
      id: data.user.id,
      email: data.user.email,
      name,
    };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || email.split('@')[0],
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('تم تسجيل الخروج');
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