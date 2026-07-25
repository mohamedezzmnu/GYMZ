import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Head><title>الصفحة مش موجودة — GYMZ</title></Head>
      <div style={{
        minHeight: 'calc(100vh - 92px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 14vw, 8rem)',
            fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--chalk)', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            4
            <span style={{
              width: '0.75em', height: '0.75em', borderRadius: '50%',
              background: 'var(--accent)', boxShadow: '0 0 40px var(--accent-glow)',
              display: 'inline-block',
            }} />
            4
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ash-light)',
            letterSpacing: '0.08em', marginTop: 18, marginBottom: 34,
          }}>
            الصفحة اللي بتدور عليها مش موجودة — يمكن اتحذفت أو الرابط غلط
          </div>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.12 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px',
                background: 'var(--accent)', borderRadius: 'var(--radius-sm)',
                color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Home size={16} />
              رجوع للرئيسية
              <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
