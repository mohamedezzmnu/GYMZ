import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext';
import { LangProvider, useLang } from '../context/LangContext';
import Navbar from '../components/layout/Navbar';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import '../styles/globals.css';

function ThemedToaster() {
  const { isRTL } = useLang();
  return (
    <Toaster
      position="bottom-center"
      containerStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--carbon)',
          color: 'var(--chalk)',
          border: '1px solid var(--iron-light)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          maxWidth: 420,
        },
        success: { duration: 5000, iconTheme: { primary: 'var(--accent)', secondary: '#fff' } },
        error: { duration: 7000 },
      }}
    />
  );
}

function SkipLink() {
  const { lang } = useLang();
  return (
    <a href="#main-content" className="skip-link">
      {lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}
    </a>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
        <SkipLink />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="animate-fade-in" style={{ paddingTop: 92, minHeight: '100vh' }}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </main>

        <footer style={{
          borderTop: '1px solid var(--glass-border)',
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            GYMZ
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash)' }}>
            © 2026 GYMZ. جميع الحقوق محفوظة
          </div>
        </footer>

        </MotionConfig>
        <ThemedToaster />
      </AuthProvider>
    </LangProvider>
  );
}
