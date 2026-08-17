import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────
   SHARED AUTH LAYOUT — used by /login and /register.
   Brings auth pages into the same visual language as the
   rest of GYMZ (orange rule + mono eyebrow tag, bold uppercase
   display headline, top accent border) instead of a generic,
   disconnected SaaS card.
───────────────────────────────────────────── */
export default function AuthLayout({ children, eyebrow, title, subtitle, ar }) {
  return (
    <>
      <Head><title>{title} — GYMZ</title></Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
        direction: ar ? 'rtl' : 'ltr',
      }}>
        <div className="bg-grid" />
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 50% 50% at 30% 40%, rgba(255,85,0,0.08) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          {/* Logo — clickable, matches navbar treatment */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 32, textDecoration: 'none',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em', color: 'var(--chalk)' }}>GYMZ</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--volt)', animation: 'glowPulse 2s ease-in-out infinite' }} />
          </Link>

          {/* Card */}
          <div style={{
            background: 'var(--carbon)',
            border: '1px solid var(--iron-light)',
            borderTop: '2px solid var(--volt)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="rule-orange" />
              <span className="label-tag">{eyebrow}</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.9rem',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              marginBottom: 8,
            }}>
              {title}
            </h1>
            <p style={{ color: 'var(--ash-light)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 28 }}>
              {subtitle}
            </p>

            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
}
