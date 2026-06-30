import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Dumbbell, LayoutGrid, ImageIcon, User, Activity, Zap, LayoutDashboard, Calculator, ShieldAlert, Home, Apple, Timer } from 'lucide-react';
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
    { href: '/programs',   label: lang === 'ar' ? 'البرامج'   : 'Programs',    icon: LayoutGrid },
    { href: '/exercises',  label: lang === 'ar' ? 'التمارين'  : 'Exercises',   icon: Dumbbell },
    { href: '/tools',      label: lang === 'ar' ? 'الحاسبات'  : 'Calculators', icon: Calculator },
    { href: '/nutrition',  label: lang === 'ar' ? 'التغذية'   : 'Nutrition',   icon: Apple },
    { href: '/dashboard',  label: lang === 'ar' ? 'داشبورد'   : 'Dashboard',   icon: LayoutDashboard },
    { href: '/profile',    label: lang === 'ar' ? 'حسابي'     : 'Profile',     icon: User },
    { href: '/workout',    label: lang === 'ar' ? 'جلستي'     : 'Workout',     icon: Dumbbell },
  ];

  // Bottom nav — 6 أهم صفحات
  const bottomLinks = [
    { href: '/',          label: lang === 'ar' ? 'الرئيسية' : 'Home',      icon: Home },
    { href: '/programs',  label: lang === 'ar' ? 'البرامج'  : 'Programs',  icon: LayoutGrid },
    { href: '/exercises', label: lang === 'ar' ? 'تمارين'   : 'Exercises', icon: Dumbbell },
    { href: '/dashboard', label: lang === 'ar' ? 'داشبورد'  : 'Dashboard', icon: LayoutDashboard },
    { href: '/profile',   label: lang === 'ar' ? 'حسابي'    : 'Profile',   icon: User },
    { href: '/workout',   label: lang === 'ar' ? 'جلستي'    : 'Workout',   icon: Timer },
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
          background: scrolled ? 'var(--obsidian)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
          transition: 'background 180ms cubic-bezier(0.16,1,0.3,1), border-color 180ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--chalk)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            GYMZ
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.86rem', fontWeight: 500,
              textDecoration: 'none', transition: 'color 120ms ease',
              color: isActive(href) ? 'var(--chalk)' : 'var(--ash-light)',
            }}>
              {label}
            </Link>
          ))}

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggleLang} style={{ background:'none', border:'1px solid var(--glass-border)', color:'var(--ash-light)', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight: 500, transition:'border-color 120ms, color 120ms' }}>
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>
            <button onClick={toggleTheme} style={{ background:'none', border:'1px solid var(--glass-border)', color:'var(--ash-light)', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.85rem' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-outline" style={{ padding:'7px 14px', fontSize:'0.78rem' }}>Admin</Link>
              )}
              <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:'var(--ash-light)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.84rem', fontWeight: 500, transition:'color 120ms' }}
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
            initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ position:'fixed', top:64, left:0, right:0, zIndex:99, background:'var(--obsidian)', borderBottom:'1px solid var(--glass-border)', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-body)', fontWeight: 600, fontSize:'1.05rem', textDecoration:'none', color: isActive(href) ? 'var(--accent)' : 'var(--chalk)' }}>
                <Icon size={18} /> {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link href="/admin" style={{ display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-body)', fontWeight: 600, fontSize:'1.05rem', textDecoration:'none', color: isActive('/admin') ? 'var(--accent)' : 'var(--ash-light)' }}>
                <ShieldAlert size={18} /> Admin
              </Link>
            )}
            <hr style={{ border:'none', borderTop:'1px solid var(--glass-border)' }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={toggleLang} style={{ background:'none', border:'1px solid var(--glass-border)', color:'var(--ash-light)', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.85rem' }}>{lang === 'ar' ? 'EN' : 'عر'}</button>
              <button onClick={toggleTheme} style={{ background:'none', border:'1px solid var(--glass-border)', color:'var(--ash-light)', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:'0.9rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
            {user ? (
              <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', color:'var(--ash-light)', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight: 600, fontSize:'1rem' }}>
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
        background:'var(--obsidian)',
        borderTop:'1px solid var(--glass-border)',
        alignItems:'center', justifyContent:'space-around',
        padding:'8px 0 env(safe-area-inset-bottom,8px)',
        display:'none',
      }}>
        {bottomLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, textDecoration:'none', padding:'4px 12px', color: active ? 'var(--accent)' : 'var(--ash)' }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight: 500 }}>{label}</span>
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
