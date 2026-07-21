// src/pages/exercises/videos.jsx
// ── مكتبة تمارين متحركة (GIF) — صفحة مستقلة، بريميوم ──────
//
// المصدر: bootstrapping-lab/exercisedb-api (مفتوح المصدر ومجاني، AGPL-3.0)
// https://github.com/bootstrapping-lab/exercisedb-api
//
// ⚠️ ملحوظة مهمة: الداتا الفعلية في المصدر ده صور GIF متحركة بتوضح الحركة كاملة
// (مش فيديو .mp4 حقيقي زي ما كنا فاكرين الأول). المصدر ده هو الوحيد اللي لقيناه
// بيدي عرض حركي فعلي (مش صورة ثابتة) مجاني 100% ومن غير أي حساب أو API key.
//
// 🔧 السيتاب المطلوب قبل ما الصفحة دي تشتغل:
// 1) اعمل Deploy لمشروع exercisedb-api بتاعك على Vercel (زرار Deploy with Vercel
//    في الريدمي بتاع الريبو) — ده هياخد منك دقيقة واحدة ومجاني بالكامل.
// 2) خد رابط الدومين اللي Vercel هيديهولك (مثلاً: https://my-exercisedb.vercel.app)
// 3) في مشروع GYMZ، ضيف المتغير ده في .env (وفي إعدادات Environment Variables
//    بتاعة Vercel لمشروع GYMZ نفسه):
//      NEXT_PUBLIC_EXERCISEDB_API_URL=https://my-exercisedb.vercel.app
//
// من غير الخطوة دي، الصفحة هتفضل واقفة على شاشة "مفيش اتصال" وهتقولك تظبط المتغير.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Crown, Loader, ChevronRight, RefreshCw, WifiOff } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const API_BASE = (process.env.NEXT_PUBLIC_EXERCISEDB_API_URL || '').replace(/\/$/, '');
const PAGE_LIMIT = 24;

// ── ترجمة أجزاء الجسم (الـ 10 المتاحة في قاعدة البيانات) ──
const BODYPART_AR = {
  neck: 'الرقبة', 'lower arms': 'أسفل الدراع', shoulders: 'الأكتاف', cardio: 'كارديو',
  'upper arms': 'أعلى الدراع', chest: 'الصدر', 'lower legs': 'أسفل الرجل',
  back: 'الظهر', 'upper legs': 'أعلى الرجل', waist: 'البطن',
};
const BODYPARTS = Object.keys(BODYPART_AR);

// ── شاشة غير مشترك (بريميوم — بعلامة التاج) ────────────────
function PremiumGate({ user }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '36px 28px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#facc15,transparent)' }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Crown size={26} color="#facc15" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: 8 }}>للمشتركين فقط</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ash-light)', lineHeight: 1.7, marginBottom: 24 }}>
          مكتبة التمارين المتحركة (Demo Animations) متاحة للمشتركين. اشترك دلوقتي عن طريق فودافون كاش واتفتحلك فوراً.
        </p>
        <div style={{ padding: '16px', background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)', letterSpacing: '0.02em', marginBottom: 8 }}>ابعت على فودافون كاش</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--chalk)', letterSpacing: '0.06em', direction: 'ltr' }}>01097931713</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#facc15', lineHeight: 1 }}>29</div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--ash-light)' }}>جنيه</div>
            </div>
          </div>
        </div>
        <a
          href={`https://wa.me/201097931713?text=عايز اشتراك مكتبة التمارين المتحركة — إيميلي: ${user?.email || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: 12, textDecoration: 'none', color: '#25D166', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em' }}
        >
          📲 ابعت السكرين شوت على واتساب
        </a>
        <p style={{ fontSize: '0.72rem', color: 'var(--ash)', textAlign: 'center', lineHeight: 1.6 }}>
          بعد التأكيد هيتفتحلك الاشتراك على إيميلك<br />
          <span style={{ color: 'var(--ash-light)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{user?.email}</span>
        </p>
      </motion.div>
    </div>
  );
}

// ── شاشة لو الـ API مش متظبطة أو النت وقع ──────────────────
function ApiNotConfigured() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <WifiOff size={40} color="var(--ash-light)" style={{ marginBottom: 16 }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', marginBottom: 10 }}>
          مكتبة التمارين لسه مش متوصلة
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--ash-light)', lineHeight: 1.8 }}>
          محتاج تعمل Deploy لمشروع <span style={{ fontFamily: 'var(--font-mono)' }}>exercisedb-api</span> على Vercel،
          وبعدين تحط رابطه في متغير <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>NEXT_PUBLIC_EXERCISEDB_API_URL</span> في إعدادات المشروع.
        </p>
        
        <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#facc15', direction: 'ltr', wordBreak: 'break-all' }}>
          DEBUG API_BASE = "{API_BASE || '(فاضي تماماً)'}"
        </div>
   
      </div>
    </div>
  );
}

// ── كارت التمرين ──────────────────────────────────────────
function ExerciseGifCard({ exercise, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(250,204,21,0.4)' }}
      onClick={() => onOpen(exercise)}
      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'all 250ms' }}
    >
      <div style={{ position: 'relative', height: 170, background: 'rgba(255,255,255,0.03)' }}>
        <img src={exercise.gifUrl} alt={exercise.name} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.currentTarget.style.opacity = 0.15; }}
        />
        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.58rem', fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 20, background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Crown size={9} /> PRO
        </span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 6, textTransform: 'capitalize' }}>
          {BODYPART_AR[exercise.bodyParts?.[0]] || exercise.bodyParts?.[0]}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.03em', color: 'var(--chalk)', textTransform: 'capitalize' }}>
          {exercise.name}
        </div>
      </div>
    </motion.div>
  );
}

// ── مودال تفاصيل التمرين ──────────────────────────────────
function ExerciseModal({ exercise, onClose }) {
  if (!exercise) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, direction: 'rtl' }}
        >
          <div style={{ position: 'relative', height: 260, background: 'rgba(255,255,255,0.03)' }}>
            <img src={exercise.gifUrl} alt={exercise.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: '20px 22px 26px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', textTransform: 'capitalize', marginBottom: 8 }}>
              {exercise.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {[...(exercise.bodyParts || []), ...(exercise.equipments || []), ...(exercise.targetMuscles || [])].map((tag, i) => (
                <span key={i} style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--ash-light)', textTransform: 'capitalize' }}>
                  {tag}
                </span>
              ))}
            </div>
            {exercise.instructions?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#facc15', marginBottom: 10 }}>خطوات الأداء</div>
                <ol style={{ margin: 0, paddingRight: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {exercise.instructions.map((step, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--ash-light)', lineHeight: 1.7 }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ExerciseVideosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    const checkPremium = async () => {
      const { data } = await supabase.from('exercise_premium').select('id').eq('email', user.email).single();
      setIsPremium(!!data);
      setChecking(false);
    };
    checkPremium();
  }, [user, authLoading]);

  // ✅ debounce للبحث عشان متضربش الـ API مع كل حرف
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchExercises = useCallback(async () => {
    if (!API_BASE) { setApiError(true); return; }
    setLoadingList(true);
    setApiError(false);
    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(PAGE_LIMIT),
        sortBy: 'name',
        sortOrder: 'asc',
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (bodyPart) params.append('bodyParts', bodyPart);

      const res = await fetch(`${API_BASE}/api/v1/exercises/filter?${params.toString()}`);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      setExercises(json.data || []);
      setTotalPages(json.metadata?.totalPages || 1);
    } catch {
      setApiError(true);
      setExercises([]);
    }
    setLoadingList(false);
  }, [debouncedSearch, bodyPart, offset]);

  useEffect(() => {
    if (isPremium) fetchExercises();
  }, [isPremium, fetchExercises]);

  // رجّع لأول صفحة كل ما الفلتر يتغير
  useEffect(() => { setOffset(0); }, [debouncedSearch, bodyPart]);

  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="#facc15" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) return <><Head><title>مكتبة التمارين المتحركة — GYMZ</title></Head><PremiumGate user={user} /></>;

  return (
    <>
      <Head><title>مكتبة التمارين المتحركة — GYMZ</title></Head>
      <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />

      <div style={{ minHeight: '100vh', paddingTop: 88, paddingBottom: 60, direction: 'rtl' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

          {/* header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Crown size={12} /> بريميوم
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '0.04em', lineHeight: 1 }}>
              مكتبة<br /><span style={{ color: '#facc15' }}>التمارين المتحركة</span>
            </h1>
            <p style={{ color: 'var(--ash-light)', marginTop: 12, fontSize: '0.875rem', lineHeight: 1.7 }}>
              شوف طريقة أداء كل تمرين بشكل متحرك (GIF) قبل ما تنزل تتمرن.
            </p>
          </motion.div>

          {!API_BASE ? <ApiNotConfigured /> : (
            <>
              {/* فلاتر */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                  <Search size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    className="input" placeholder="دوّر باسم التمرين بالإنجليزي (مثلاً: squat)"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingRight: 38, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }}
                  />
                </div>
                <select className="input" value={bodyPart} onChange={e => setBodyPart(e.target.value)} style={{ flex: '1 1 150px', cursor: 'pointer' }}>
                  <option value="">كل العضلات</option>
                  {BODYPARTS.map(bp => <option key={bp} value={bp}>{BODYPART_AR[bp]}</option>)}
                </select>
                <button
                  onClick={fetchExercises}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 8, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  <RefreshCw size={13} /> تحديث
                </button>
              </div>

              {/* المحتوى */}
              {loadingList ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <Loader size={26} color="#facc15" style={{ animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : apiError ? (
                <ApiNotConfigured />
              ) : exercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--chalk)', marginBottom: 6 }}>مفيش نتايج</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ash-light)' }}>جرّب كلمة تانية أو غيّر الفلتر</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {exercises.map(ex => (
                      <ExerciseGifCard key={ex.exerciseId} exercise={ex} onOpen={setSelected} />
                    ))}
                  </div>

                  {/* pagination */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setOffset(o => Math.max(0, o - PAGE_LIMIT))}
                      style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage <= 1 ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <ChevronRight size={14} /> السابق
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash-light)' }}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setOffset(o => o + PAGE_LIMIT)}
                      style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: currentPage >= totalPages ? 'var(--ash)' : 'var(--chalk)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      التالي <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
