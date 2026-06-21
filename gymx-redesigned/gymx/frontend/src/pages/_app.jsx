import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { LangProvider } from '../context/LangContext';
import Navbar from '../components/layout/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <AuthProvider>
        <Navbar />
        <main style={{ paddingTop: 64, minHeight: '100vh' }}>
          <Component {...pageProps} />
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
            GYMX
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash)' }}>
            © 2026 GYMX. جميع الحقوق محفوظة لدي MZ
          </div>
        </footer>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--carbon)',
              color: 'var(--chalk)',
              border: '1px solid var(--iron-light)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: 'var(--accent)', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </LangProvider>
  );
}