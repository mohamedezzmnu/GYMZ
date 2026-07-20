import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Dumbbell, Calculator, Apple,
  LayoutDashboard, User, LogOut,
  Menu, X, Home, Zap, ChevronDown,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { lang, toggleLang, isRTL } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();
  const ar = lang === 'ar';

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [router.pathname]);

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  const publicLinks = [
    { href: '/programs',  label: ar ? 'البرامج'   : 'Programs',    icon: LayoutGrid },
    { href: '/exercises', label: ar ? 'التمارين'  : 'Exercises',   icon: Dumbbell   },
    { href: '/tools',     label: ar ? 'الحاسبات'  : 'Calculators', icon: Calculator },
    { href: '/nutrition', label: ar ? 'التغذية'   : 'Nutrition',   icon: Apple      },
  ];

  const privateLinks = [
    { href: '/dashboard', label: ar ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard },
    { href: '/workout',   label: ar ? 'جلستي'   : 'Workout',   icon: Zap            },
  ];

  const bottomLinks = user ? [
    { href: '/',          label: ar ? 'الرئيسية' : 'Home',      icon: Home            },
    { href: '/programs',  label: ar ? 'البرامج'  : 'Programs',  icon: LayoutGrid      },
    { href: '/dashboard', label: ar ? 'داشبورد'  : 'Dashboard', icon: LayoutDashboard },
    { href: '/workout',   label: ar ? 'جلستي'    : 'Workout',   icon: Zap             },
    { href: '/profile',   label: ar ? 'حسابي'    : 'Profile',   icon: User            },
  ] : [
    { href: '/',          label: ar ? 'الرئيسية' : 'Home',      icon: Home       },
    { href: '/programs',  label: ar ? 'البرامج'  : 'Programs',  icon: LayoutGrid },
    { href: '/exercises', label: ar ? 'التمارين' : 'Exercises', icon: Dumbbell   },
    { href: '/tools',     label: ar ? 'الحاسبات' : 'Calcs',     icon: Calculator },
    { href: '/nutrition', label: ar ? 'التغذية'  : 'Nutrition', icon: Apple      },
  ];

  const userName    = user?.name || user?.email?.split('@')[0] || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 20,
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        {/* orange top rule */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--volt)' }} />

        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: '#fff', letterSpacing: '0.05em' }}>GYMZ</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--volt)', animation: 'glowPulse 2s ease-in-out infinite' }} />
        </Link>

        {/* PUBLIC LINKS — desktop */}
        <nav style={{ display: 'flex', gap: 0, flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {publicLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              color: isActive(href) ? 'var(--volt)' : 'var(--ash)',
              padding: '6px 14px',
              borderBottom: isActive(href) ? '2px solid var(--volt)' : '2px solid transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--chalk)'; } }}
              onMouseLeave={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--ash)'; } }}
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              color: isActive('/dashboard') ? 'var(--volt)' : 'var(--ash)',
              padding: '6px 14px',
              borderBottom: isActive('/dashboard') ? '2px solid var(--volt)' : '2px solid transparent',
              transition: 'all 0.15s', textDecoration: 'none',
            }}>
              {ar ? 'داشبورد' : 'Dashboard'}
            </Link>
          )}
        </nav>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* language */}
          <button onClick={toggleLang} style={{ background: 'var(--iron)', border: '1px solid var(--iron-light)', color: 'var(--ash)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>

          {/* NOT LOGGED IN */}
          {!user && (
            <>
              <Link href="/login">
                <button style={{ background: 'transparent', border: '1px solid var(--iron-light)', color: 'var(--ash)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.06em', cursor: 'pointer' }}>
                  {ar ? 'دخول' : 'LOGIN'}
                </button>
              </Link>
              <Link href="/register">
                <button className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '0.85rem' }}>
                  {ar ? 'انضم' : 'JOIN'}
                </button>
              </Link>
            </>
          )}

          {/* LOGGED IN — user dropdown */}
          {user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--iron)', border: '1px solid var(--iron-light)', borderRadius: 'var(--radius-sm)', padding: '4px 12px 4px 8px', cursor: 'pointer' }}
              >
                <div style={{ width: 24, height: 24, background: 'var(--volt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
                  {userInitial}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--chalk)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
                <ChevronDown size={12} color="var(--ash)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: 42, right: isRTL ? 'auto' : 0, left: isRTL ? 0 : 'auto', background: '#111', border: '1px solid var(--iron-light)', borderTop: '2px solid var(--volt)', borderRadius: 'var(--radius-md)', padding: 6, minWidth: 180, boxShadow: '0 8px 40px rgba(0,0,0,0.8)', zIndex: 200 }}
                  >
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--iron)', marginBottom: 4 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--chalk)' }}>{userName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ash)', marginTop: 2 }}>{user?.email}</div>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'inline-block', background: 'var(--volt-dim)', border: '1px solid var(--volt)', borderRadius: 'var(--radius-sm)', padding: '1px 8px', fontSize: '0.65rem', color: 'var(--volt)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 4 }}>ADMIN</div>
                      )}
                    </div>

                    {[
                      { href: '/profile',   icon: User,            label: ar ? 'حسابي'    : 'My Profile'   },
                      { href: '/dashboard', icon: LayoutDashboard, label: ar ? 'داشبورد'  : 'Dashboard'    },
                      { href: '/workout',   icon: Zap,             label: ar ? 'جلستي'    : 'My Workout'   },
                      ...(user?.role === 'admin' ? [{ href: '/admin', icon: LayoutGrid, label: ar ? 'الأدمن' : 'Admin Panel' }] : []),
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', color: isActive(href) ? 'var(--volt)' : 'var(--ash)', background: isActive(href) ? 'var(--volt-dim)' : 'transparent', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.12s' }}
                          onMouseEnter={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--chalk)'; e.currentTarget.style.background = 'var(--iron)'; } }}
                          onMouseLeave={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--ash)'; e.currentTarget.style.background = 'transparent'; } }}
                        >
                          <Icon size={13} /> {label}
                        </div>
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid var(--iron)', marginTop: 4, paddingTop: 4 }}>
                      <button onClick={async () => { await logout(); router.push('/'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', color: '#EF4444', background: 'transparent', border: 'none', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOut size={13} /> {ar ? 'خروج' : 'LOGOUT'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* mobile menu btn */}
          <button onClick={() => setMobileOpen(o => !o)} className="mobile-menu-btn"
            style={{ background: 'var(--iron)', border: '1px solid var(--iron-light)', color: 'var(--chalk)', width: 30, height: 30, borderRadius: 'var(--radius-sm)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </header>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99, background: '#0D0D0D', borderBottom: '2px solid var(--volt)', padding: '12px 16px 16px', direction: isRTL ? 'rtl' : 'ltr' }}
          >
            {[...publicLinks, ...(user ? privateLinks : [])].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 2, borderRadius: 'var(--radius-sm)', background: isActive(href) ? 'var(--volt-dim)' : 'transparent', color: isActive(href) ? 'var(--volt)' : 'var(--ash)', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>
                  <Icon size={16} /> {label}
                </div>
              </Link>
            ))}
            {!user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Link href="/login" style={{ flex: 1 }}>
                  <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--iron-light)', color: 'var(--chalk)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                    {ar ? 'دخول' : 'LOGIN'}
                  </button>
                </Link>
                <Link href="/register" style={{ flex: 1 }}>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
                    {ar ? 'انضم' : 'JOIN FREE'}
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      <nav style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1A1A1A', padding: '6px 0 calc(6px + env(safe-area-inset-bottom))', direction: isRTL ? 'rtl' : 'ltr' }} className="bottom-nav">
        {bottomLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0', textDecoration: 'none' }}>
              <Icon size={19} color={active ? 'var(--volt)' : 'var(--ash)'} />
              <span style={{ fontSize: '0.55rem', color: active ? 'var(--volt)' : 'var(--ash)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
              {active && <div style={{ width: 20, height: 2, background: 'var(--volt)', borderRadius: 1, position: 'absolute', bottom: 'calc(6px + env(safe-area-inset-bottom))' }} />}
            </Link>
          );
        })}
      </nav>

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
