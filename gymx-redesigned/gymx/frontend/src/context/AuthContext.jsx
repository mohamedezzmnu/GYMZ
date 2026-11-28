import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { clearNutritionCache, removeLegacyNutritionCache } from '../utils/nutritionCache';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // بريميوم = الإيميل موجود في exercise_premium أو nutrition_premium.
  // بيتقرأ مرة عند الدخول، وبيتحدث من غير refresh عن طريق refreshPremium.
  const [premium, setPremium] = useState(false);

  const previousNutritionOwner = useRef(null);
  useEffect(() => {
    const previous = previousNutritionOwner.current;
    if (previous && previous !== user?.id) clearNutritionCache(previous);
    previousNutritionOwner.current = user?.id || null;
  }, [user?.id]);

  async function buildUser(supabaseUser) {
    if (!supabaseUser) return null;

    // اقرأ الـ role من الـ app_metadata أولاً (أسرع وأضمن)
    const metaRole = supabaseUser.app_metadata?.role;

    if (metaRole) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        role: metaRole,
      };
    }

    // fallback — اقرأ من جدول users
    const { data } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: data?.name || supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
      role: data?.role || 'user',
    };
  }

  const checkPremium = useCallback(async (email) => {
    if (!email) { setPremium(false); return false; }
    const mail = String(email).toLowerCase();
    try {
      const [videos, nutrition] = await Promise.all([
        supabase.from('exercise_premium').select('id').eq('email', mail).limit(1),
        supabase.from('nutrition_premium').select('id').eq('email', mail).limit(1),
      ]);
      const isPremium = !!((videos.data && videos.data.length) || (nutrition.data && nutrition.data.length));
      setPremium(isPremium);
      return isPremium;
    } catch (e) {
      return false;
    }
  }, []);

  const refreshPremium = useCallback(() => checkPremium(user?.email), [checkPremium, user?.email]);

  useEffect(() => {
    removeLegacyNutritionCache();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const built = await buildUser(session.user);
        setUser(built);
        await checkPremium(built?.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        removeLegacyNutritionCache();
        setUser(null);
        setPremium(false);
        setLoading(false);
        return;
      }
      if (session?.user) {
        const built = await buildUser(session.user);
        setUser(built);
        await checkPremium(built?.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkPremium]);

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);

    // لو إعدادات Supabase تطلب تأكيد الإيميل، مفيش session هنا —
    // المستخدم لسه مش مسجل دخول فعليًا.
    if (!data.session) {
      return {
        id: data.user?.id,
        email,
        name,
        role: 'user',
        needsEmailConfirmation: true,
      };
    }

    const built = await buildUser(data.user);
    setUser(built);
    await checkPremium(built?.email);
    return { ...built, needsEmailConfirmation: false };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const built = await buildUser(data.user);
    setUser(built);
    await checkPremium(built?.email);
    return built;
  };

  const logout = async () => {
    clearNutritionCache(user?.id);
    await supabase.auth.signOut();
    setUser(null);
    setPremium(false);
    toast.success('تم تسجيل الخروج');
  };

  const api = {
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
  };

  return (
    <AuthContext.Provider value={{ user, loading, premium, refreshPremium, login, register, logout, api }}>
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
