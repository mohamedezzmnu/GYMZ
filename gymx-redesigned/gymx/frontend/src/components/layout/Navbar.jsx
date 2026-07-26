import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Dumbbell, Calculator, Apple,
  LayoutDashboard, User, LogOut,
  Menu, X, Home, Zap, ChevronDown, Bell,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function Navbar() {
  const { lang, toggleLang, isRTL } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();
  const ar = lang === 'ar';

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [notifications, setNotifications]     = useState([]);
  const [notifOpen, setNotifOpen]              = useState(false);
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user?.id) { setNotifications([]); return; }

    let active = true;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { if (active && data) setNotifications(data); });

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new, ...prev])
      )
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    const fn = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const toggleNotifPanel = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (!opening) return;
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

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
    { href: '/dashboard', label: ar ? 'صفحتي' : 'Dashboard', icon: LayoutDashboard },
    { href: '/workout',   label: ar ? 'جلستي'   : 'Workout',   icon: Zap            },
  ];

  const bottomLinks = user ? [
    { href: '/',          label: ar ? 'الرئيسية' : 'Home',      icon: Home            },
    { href: '/programs',  label: ar ? 'البرامج'  : 'Programs',  icon: LayoutGrid      },
    { href: '/dashboard', label: ar ? 'صفحتي'  : 'Dashboard', icon: LayoutDashboard },
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
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
        width: 'calc(100% - 32px)', maxWidth: 1180,
        height: 52,
        background: 'rgba(17,17,17,0.72)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        padding: '0 8px 0 18px', gap: 20,
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
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
              {ar ? 'صفحتي' : 'Dashboard'}
            </Link>
          )}
        </nav>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* language */}
          <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={toggleLang} style={{ background: 'var(--iron)', border: '1px solid var(--iron-light)', color: 'var(--ash)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </motion.button>

          {/* NOT LOGGED IN */}
          {!user && (
            <>
              <Link href="/login">
                <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} style={{ background: 'transparent', border: '1px solid var(--iron-light)', color: 'var(--ash)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.06em', cursor: 'pointer' }}>
                  {ar ? 'دخول' : 'LOGIN'}
                </motion.button>
              </Link>
              <Link href="/register">
                <button className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '0.85rem' }}>
                  {ar ? 'ابدأ مجاناً' : 'START FREE'}
                </button>
              </Link>
            </>
          )}

          {/* NOTIFICATIONS */}
          {user && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={toggleNotifPanel}
                style={{ position: 'relative', background: 'var(--iron)', border: '1px solid var(--iron-light)', color: 'var(--ash)', width: 34, height: 34, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={17} color={notifOpen ? 'var(--volt)' : 'var(--ash)'} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: isRTL ? 'auto' : -3, left: isRTL ? -3 : 'auto', minWidth: 15, height: 15, padding: '0 3px', borderRadius: 8, background: 'var(--volt)', color: '#fff', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0c0c0c' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'fixed', top: 72, left: 0, right: 0, margin: '0 auto', width: 'calc(100% - 32px)', maxWidth: 320, background: '#111', border: '1px solid var(--iron-light)', borderTop: '2px solid var(--volt)', borderRadius: 'var(--radius-md)', maxHeight: 360, overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', zIndex: 200, direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--iron)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--ash)', textTransform: 'uppercase' }}>
                      {ar ? 'الإشعارات' : 'Notifications'}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--ash)', fontFamily: 'var(--font-body)' }}>
                        {ar ? 'مفيش إشعارات لسه' : 'No notifications yet'}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.is_read ? 'transparent' : 'rgba(255,85,0,0.06)' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--chalk)', marginBottom: 2 }}>{n.title}</div>
                          {n.body && <div style={{ fontSize: '0.72rem', color: 'var(--ash-light)', lineHeight: 1.5 }}>{n.body}</div>}
                          <div style={{ fontSize: '0.6rem', color: 'var(--ash)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                            {new Date(n.created_at).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* LOGGED IN — user dropdown */}
          {user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--iron)', border: '1px solid var(--iron-light)', borderRadius: 'var(--radius-sm)', padding: '4px 12px 4px 8px', cursor: 'pointer' }}
              >
                <div style={{ width: 24, height: 24, background: 'var(--volt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
                  {userInitial}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--chalk)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
                <ChevronDown size={12} color="var(--ash)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
              </motion.button>

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
                      { href: '/dashboard', icon: LayoutDashboard, label: ar ? 'صفحتي'  : 'Dashboard'    },
                      { href: '/workout',   icon: Zap,             label: ar ? 'جلستي'    : 'My Workout'   },
                      ...(user?.role === 'admin' ? [{ href: '/admin', icon: LayoutGrid, label: ar ? 'الأدمن' : 'Admin Panel' }] : []),
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', color: isActive(href) ? 'var(--volt)' : 'var(--ash)', background: isActive(href) ? 'var(--volt-dim)' : 'transparent', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.12s' }}
                          onMouseEnter={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--chalk)'; e.currentTarget.style.background = 'var(--iron)'; } }}
                          onMouseLeave={e => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--ash)'; e.currentTarget.style.background = 'transparent'; } }}
                        >
                          <Icon size={15} /> {label}
                        </div>
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid var(--iron)', marginTop: 4, paddingTop: 4 }}>
                      <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={async () => { await logout(); router.push('/'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', color: '#EF4444', background: 'transparent', border: 'none', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOut size={15} /> {ar ? 'خروج' : 'LOGOUT'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* mobile menu btn */}
          <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => setMobileOpen(o => !o)} className="mobile-menu-btn"
            style={{ background: 'var(--iron)', border: '1px solid var(--iron-light)', color: 'var(--chalk)', width: 30, height: 30, borderRadius: 'var(--radius-sm)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </motion.button>
        </div>
      </header>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', top: 72, left: 0, right: 0, margin: '0 auto', zIndex: 101, width: 'calc(100% - 32px)', maxWidth: 1180, maxHeight: 'calc(100vh - 72px - 76px - env(safe-area-inset-bottom))', overflowY: 'auto', background: 'rgba(17,17,17,0.96)', border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid var(--volt)', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.55)', padding: '12px 16px 16px', direction: isRTL ? 'rtl' : 'ltr' }}
          >
            {[...publicLinks, ...(user ? privateLinks : [])].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 2, borderRadius: 'var(--radius-sm)', background: isActive(href) ? 'var(--volt-dim)' : 'transparent', color: isActive(href) ? 'var(--volt)' : 'var(--ash)', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>
                  <Icon size={18} /> {label}
                </div>
              </Link>
            ))}
            {!user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Link href="/login" style={{ flex: 1 }}>
                  <motion.button whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--iron-light)', color: 'var(--chalk)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                    {ar ? 'دخول' : 'LOGIN'}
                  </motion.button>
                </Link>
                <Link href="/register" style={{ flex: 1 }}>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
                    {ar ? 'ابدأ مجاناً' : 'START FREE'}
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      <nav style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1A1A1A', padding: '8px 8px calc(8px + env(safe-area-inset-bottom))', direction: isRTL ? 'rtl' : 'ltr' }} className={`bottom-nav${mobileOpen ? ' bottom-nav-hidden' : ''}`}>
        {bottomLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 2px', textDecoration: 'none', position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 26, borderRadius: 12,
                background: active ? 'var(--volt-dim)' : 'transparent',
                transition: 'background var(--transition-base)',
              }}>
                <Icon size={22} color={active ? 'var(--volt)' : 'var(--ash)'} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span style={{ fontSize: '0.58rem', color: active ? 'var(--volt)' : 'var(--ash)', fontFamily: 'var(--font-mono)', fontWeight: active ? 800 : 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
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
        .bottom-nav.bottom-nav-hidden { display: none !important; }
      `}</style>
    </>
  );
}
