import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Dumbbell, Calculator, Apple,
  LayoutDashboard, User, LogOut, Sun, Moon,
  Menu, X, Home, Zap, ChevronDown,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { lang, toggleLang, theme, toggleTheme, isRTL } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();
  const ar = lang === 'ar';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [router.pathname]);

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  // ── PUBLIC links (always visible) ──────────────
  const publicLinks = [
    { href: '/programs',  label: ar ? 'البرامج'   : 'Programs',    icon: LayoutGrid },
    { href: '/exercises', label: ar ? 'التمارين'  : 'Exercises',   icon: Dumbbell   },
    { href: '/tools',     label: ar ? 'الحاسبات'  : 'Calculators', icon: Calculator },
    { href: '/nutrition', label: ar ? 'التغذية'   : 'Nutrition',   icon: Apple      },
  ];

  // ── PRIVATE links (only when logged in) ────────
  const privateLinks = [
    { href: '/dashboard', label: ar ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard },
    { href: '/workout',   label: ar ? 'جلستي'   : 'Workout',   icon: Zap            },
  ];

  // ── BOTTOM NAV (mobile) — smart ────────────────
  const bottomLinks = user ? [
    { href: '/',          label: ar ? 'الرئيسية' : 'Home',      icon: Home          },
    { href: '/programs',  label: ar ? 'البرامج'  : 'Programs',  icon: LayoutGrid    },
    { href: '/dashboard', label: ar ? 'داشبورد'  : 'Dashboard', icon: LayoutDashboard },
    { href: '/workout',   label: ar ? 'جلستي'    : 'Workout',   icon: Zap           },
    { href: '/profile',   label: ar ? 'حسابي'    : 'Profile',   icon: User          },
  ] : [
    { href: '/',          label: ar ? 'الرئيسية' : 'Home',      icon: Home       },
    { href: '/programs',  label: ar ? 'البرامج'  : 'Programs',  icon: LayoutGrid },
    { href: '/exercises', label: ar ? 'التمارين' : 'Exercises', icon: Dumbbell   },
    { href: '/tools',     label: ar ? 'الحاسبات' : 'Calcs',     icon: Calculator },
    { href: '/nutrition', label: ar ? 'التغذية'  : 'Nutrition', icon: Apple      },
  ];

  const userName   = user?.name || user?.email?.split('@')[0] || '';
  const userInitial = userName.charAt(0).toUpperCase();

  /* ── styles ────────────────────────────────────── */
  const navLinkStyle = (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#A78BFA' : 'var(--ash)',
    padding: '6px 10px',
    borderRadius: 8,
    background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
    transition: 'all 0.15s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      {/* ── TOP NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: 'rgba(8,7,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        direction: isRTL ? 'rtl' : 'ltr',
      }}>

        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: 15, color: '#fff', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }}>Z</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 900, color: 'var(--chalk)', letterSpacing: '-0.5px' }}>GYMZ</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA' }} />
        </Link>

        {/* PUBLIC NAV LINKS — desktop */}
        <nav style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {publicLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={navLinkStyle(isActive(href))}>
              {label}
            </Link>
          ))}
          {/* Dashboard link in main nav when logged in */}
          {user && (
            <Link href="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
              {ar ? 'داشبورد' : 'Dashboard'}
            </Link>
          )}
        </nav>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: isRTL ? 0 : 'auto', marginLeft: isRTL ? 'auto' : 0 }}>

          {/* theme toggle */}
          <button onClick={toggleTheme} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--ash)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* language toggle */}
          <button onClick={toggleLang} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--ash)', padding: '5px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>

          {/* ── NOT LOGGED IN ── */}
          {!user && (
            <>
              <Link href="/login">
                <button style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--ash)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  {ar ? 'دخول' : 'Login'}
                </button>
              </Link>
              <Link href="/register">
                <button style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
                  {ar ? 'انضم' : 'Join'}
                </button>
              </Link>
            </>
          )}

          {/* ── LOGGED IN — user avatar + dropdown ── */}
          {user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, padding: '5px 12px 5px 8px', cursor: 'pointer' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                  {userInitial}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--chalk)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
                <ChevronDown size={12} color="var(--ash)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
              </button>

              {/* dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 44, right: isRTL ? 'auto' : 0, left: isRTL ? 0 : 'auto',
                      background: '#0F0E2A',
                      border: '1px solid rgba(124,58,237,0.25)',
                      borderRadius: 14,
                      padding: 8,
                      minWidth: 180,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      zIndex: 200,
                    }}
                  >
                    {/* user info */}
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(124,58,237,0.1)', marginBottom: 6 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--chalk)' }}>{userName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ash)', marginTop: 2 }}>{user?.email}</div>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '1px 8px', fontSize: '0.65rem', color: '#F59E0B', fontWeight: 700, marginTop: 4 }}>Admin</div>
                      )}
                    </div>

                    {/* menu items */}
                    {[
                      { href: '/profile',   icon: User,            label: ar ? 'حسابي'    : 'My Profile'   },
                      { href: '/dashboard', icon: LayoutDashboard, label: ar ? 'داشبورد'  : 'Dashboard'    },
                      { href: '/workout',   icon: Zap,             label: ar ? 'جلستي'    : 'My Workout'   },
                      ...(user?.role === 'admin' ? [{ href: '/admin', icon: LayoutGrid, label: ar ? 'الأدمن' : 'Admin' }] : []),
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, color: isActive(href) ? '#A78BFA' : 'var(--ash)', background: isActive(href) ? 'rgba(124,58,237,0.1)' : 'transparent', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { if (!isActive(href)) { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; e.currentTarget.style.color = 'var(--chalk)'; } }}
                          onMouseLeave={e => { if (!isActive(href)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ash)'; } }}
                        >
                          <Icon size={14} />
                          {label}
                        </div>
                      </Link>
                    ))}

                    {/* logout */}
                    <div style={{ borderTop: '1px solid rgba(124,58,237,0.1)', marginTop: 6, paddingTop: 6 }}>
                      <button onClick={async () => { await logout(); router.push('/'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, color: '#EF4444', background: 'transparent', border: 'none', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOut size={14} />
                        {ar ? 'تسجيل خروج' : 'Logout'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* mobile menu button */}
          <button onClick={() => setMobileOpen(o => !o)} className="mobile-menu-btn"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--chalk)', width: 32, height: 32, borderRadius: 8, display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE DROPDOWN MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
              background: 'rgba(8,7,26,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(124,58,237,0.15)',
              padding: '12px 20px 20px',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            {[...publicLinks, ...(user ? privateLinks : [])].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 4, background: isActive(href) ? 'rgba(124,58,237,0.12)' : 'transparent', color: isActive(href) ? '#A78BFA' : 'var(--ash)', fontSize: '0.9rem', fontWeight: isActive(href) ? 700 : 500 }}>
                  <Icon size={17} /> {label}
                </div>
              </Link>
            ))}
            {!user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link href="/login" style={{ flex: 1 }}>
                  <button style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--chalk)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    {ar ? 'دخول' : 'Login'}
                  </button>
                </Link>
                <Link href="/register" style={{ flex: 1 }}>
                  <button style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', border: 'none', color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
                    {ar ? 'انضم' : 'Join Free'}
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <nav style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,7,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(124,58,237,0.12)',
        padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
        direction: isRTL ? 'rtl' : 'ltr',
      }} className="bottom-nav">
        {bottomLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0', textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <Icon size={20} color={active ? '#A78BFA' : 'var(--ash)'} />
                {active && <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#A78BFA' }} />}
              </div>
              <span style={{ fontSize: '0.6rem', color: active ? '#A78BFA' : 'var(--ash)', fontWeight: active ? 700 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        .bottom-nav { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
