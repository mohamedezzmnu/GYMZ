import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function buildUser(supabaseUser) {
    if (!supabaseUser) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', supabaseUser.id)
        .single();

      if (error) console.error('buildUser error:', error.message);

      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: data?.name || supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        role: data?.role || 'user',
      };
    } catch (e) {
      console.error('buildUser exception:', e);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        role: 'user',
      };
    }
  }

  useEffect(() => {
    // جيب الـ session الحالية
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const built = await buildUser(session.user);
        setUser(built);
      }
      setLoading(false);
    });

    // استمع لأي تغيير في الـ auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        const built = await buildUser(session.user);
        setUser(built);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    return { id: data.user.id, email: data.user.email, name, role: 'user' };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const built = await buildUser(data.user);
    setUser(built);
    return built;
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
