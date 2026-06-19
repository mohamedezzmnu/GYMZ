import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Dumbbell, LayoutGrid, ImageIcon, User, Activity, Zap, LayoutDashboard, Calculator, ShieldAlert, Home, Apple } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, theme, toggleTheme } = useLang();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [router.pathname]);

  const navLinks = [
    { href: '/programs',   label: lang === 'ar' ? 'البرامج'  : 'Programs',  icon: LayoutGrid },
    { href: '/exercises',  label: lang === 'ar' ? 'التمارين' : 'Exercises', icon: Dumbbell },
    { href: '/tools',      label: lang === 'ar' ? 'الحاسبات' : 'Tools',     icon: Calculator },
    { href: '/nutrition',  label: lang === 'ar' ? 'التغذية'  : 'Nutrition', icon: Apple },
    { href: '/dashboard',  label: lang === 'ar' ? 'داشبورد'  : 'Dashboard', icon: LayoutDashboard },
    { href: '/bmi',        label: lang === 'ar' ? 'BMI'      : 'BMI',       icon: Activity },
    { href: '/profile',    label: lang === 'ar' ? 'حسابي'    : 'Profile',   icon: User },
    { href: '/workout', label: lang === 'ar' ? 'جلستي' : 'Workout', icon: Dumbbell },
  ];

  // Bottom nav — 5 أهم صفحات فقط
  const bottomLinks = [
    { href: '/',          label: lang === 'ar' ? 'الرئيسية' : 'Home',      icon: Home },
    { href: '/programs',  label: lang === 'ar' ? 'البرامج'  : 'Programs',  icon: LayoutGrid },
    { href: '/exercises', label: lang === 'ar' ? 'تمارين'   : 'Exercises', icon: Dumbbell },
    { href: '/dashboard', label: lang === 'ar' ? 'داشبورد'  : 'Dashboard', icon: LayoutDashboard },
    { href: '/profile',   label: lang === 'ar' ? 'حسابي'    : 'Profile',   icon: User },
    { href: '/workout', label: lang === 'ar' ? 'جلستي' : 'Workout', icon: Dumbbell },
  ];

  const isActive = (href) => href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <>
      {/* ── TOP NAV ── */}
      <motion.nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(8,8,16,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.08em', color: 'var(--chalk)', display: 'flex', alignItems: 'center', gap: 0 }}
          >
            GYM<span style={{ color: '#FF3B30' }}>Z</span>
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.09em',
              textTransform: 'uppercase', textDecoration: 'none', transition: 'color 150ms ease',
              color: isActive(href) ? '#FF3B30' : 'var(--ash-light)',
            }}>
              {label}
            </Link>
          ))}

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggleLang} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'var(--ash-light)', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'0.72rem', transition:'all 150ms' }}>
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>
            <button onClick={toggleTheme} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'var(--ash-light)', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:'0.85rem' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-outline" style={{ padding:'7px 14px', fontSize:'0.68rem' }}>Admin</Link>
              )}
              <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:'var(--ash-light)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'0.7rem', letterSpacing:'0.09em', textTransform:'uppercase', transition:'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--chalk)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--ash-light)'}>
                <LogOut size={13} /> {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:10 }}>
              <Link href="/login" className="btn btn-ghost" style={{ padding:'7px 14px', fontSize:'0.72rem' }}>
                {lang === 'ar' ? 'دخول' : 'Login'}
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding:'7px 14px', fontSize:'0.72rem' }}>
                {lang === 'ar' ? 'انضم' : 'Join'}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'var(--chalk)', cursor:'pointer', display:'none' }} className="mobile-menu-btn" aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            style={{ position:'fixed', top:64, left:0, right:0, zIndex:99, background:'rgba(8,8,16,0.95)', backdropFilter:'blur(24px) saturate(160%)', WebkitBackdropFilter:'blur(24px) saturate(160%)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-display)', fontSize:'1.3rem', letterSpacing:'0.04em', textDecoration:'none', color: isActive(href) ? '#FF3B30' : 'var(--chalk)' }}>
                <Icon size={18} /> {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link href="/admin" style={{ display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-display)', fontSize:'1.3rem', letterSpacing:'0.04em', textDecoration:'none', color: isActive('/admin') ? '#FF3B30' : 'var(--fire)' }}>
                <ShieldAlert size={18} /> Admin
              </Link>
            )}
            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.07)' }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={toggleLang} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'var(--ash-light)', padding:'7px 14px', borderRadius:4, cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{lang === 'ar' ? 'EN' : 'عر'}</button>
              <button onClick={toggleTheme} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'var(--ash-light)', padding:'7px 14px', borderRadius:4, cursor:'pointer', fontSize:'0.9rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
            {user ? (
              <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', color:'var(--ash-light)', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'1.2rem', letterSpacing:'0.04em' }}>
                <LogOut size={18} /> {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            ) : (
              <div style={{ display:'flex', gap:10 }}>
                <Link href="/login" className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>{lang === 'ar' ? 'دخول' : 'Login'}</Link>
                <Link href="/register" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>{lang === 'ar' ? 'انضم' : 'Join'}</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAV (Mobile Only) ── */}
      <nav className="bottom-nav" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:100,
        background:'rgba(8,8,16,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center', justifyContent:'space-around',
        padding:'8px 0 env(safe-area-inset-bottom,8px)',
        display:'none',
      }}>
        {bottomLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, textDecoration:'none', padding:'4px 12px', color: active ? '#FF3B30' : 'var(--ash)' }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.52rem', letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
