import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Dumbbell, LayoutGrid, ImageIcon, User, Activity, Zap } from 'lucide-react';
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
    { href: '/programs', label: lang === 'ar' ? 'البرامج' : 'Programs', icon: LayoutGrid },
    { href: '/exercises', label: lang === 'ar' ? 'التمارين' : 'Exercises', icon: Dumbbell },
    { href: '/onboarding', label: lang === 'ar' ? 'ابدأ' : 'Start', icon: Zap },
    { href: '/bmi', label: lang === 'ar' ? 'BMI' : 'BMI', icon: Activity },
    { href: '/profile', label: lang === 'ar' ? 'حسابي' : 'Profile', icon: User },
    { href: '/shapes', label: lang === 'ar' ? 'أشكال التمارين' : 'Shapes', icon: ImageIcon },
  ];

  return (
    <>
      <motion.nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(8, 8, 16, 0.75)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.04)' : 'none',
          transition: 'all 350ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              letterSpacing: '0.1em',
              color: 'var(--chalk)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            whileHover={{ scale: 1.04 }}
          >
            GYM<span style={{ color: 'var(--volt)', textShadow: '0 0 20px rgba(61,127,255,0.6)' }}>X</span>
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: router.pathname.startsWith(href) ? 'var(--volt)' : 'var(--ash-light)',
                textDecoration: 'none',
                transition: 'color 150ms ease',
                textShadow: router.pathname.startsWith(href) ? '0 0 12px rgba(61,127,255,0.5)' : 'none',
              }}
            >
              {label}
            </Link>
          ))}

          {/* زراير اللغة والثيم */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleLang} style={{
              background: 'none',
              border: '1px solid var(--volt)',
              color: 'var(--volt)',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}>
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>
            <button onClick={toggleTheme} style={{
              background: 'none',
              border: '1px solid var(--volt)',
              color: 'var(--volt)',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: 'var(--ash-light)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--chalk)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ash-light)'}
              >
                <LogOut size={14} />
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                {lang === 'ar' ? 'دخول' : 'Login'}
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                {lang === 'ar' ? 'انضم الآن' : 'Join Now'}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--chalk)', cursor: 'pointer', display: 'none' }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(8, 8, 16, 0.88)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  letterSpacing: '0.05em',
                  color: router.pathname.startsWith(href) ? 'var(--volt)' : 'var(--chalk)',
                  textDecoration: 'none',
                }}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}

            <hr className="divider" />

            {/* زراير اللغة والثيم في الموبايل */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleLang} style={{
                background: 'none',
                border: '1px solid var(--volt)',
                color: 'var(--volt)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}>
                {lang === 'ar' ? 'EN' : 'عر'}
              </button>
              <button onClick={toggleTheme} style={{
                background: 'none',
                border: '1px solid var(--volt)',
                color: 'var(--volt)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>

            {user ? (
              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'none',
                  border: 'none',
                  color: 'var(--ash-light)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  letterSpacing: '0.05em',
                }}
              >
                <LogOut size={20} />
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/login" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  {lang === 'ar' ? 'دخول' : 'Login'}
                </Link>
                <Link href="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {lang === 'ar' ? 'انضم الآن' : 'Join Now'}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}