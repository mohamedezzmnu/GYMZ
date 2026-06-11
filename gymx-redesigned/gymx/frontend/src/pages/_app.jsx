import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <Component {...pageProps} />
      </main>

      <footer style={{
        borderTop: '1px solid var(--iron)',
        padding: '40px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          letterSpacing: '0.1em',
        }}>
          GYM<span style={{ color: 'var(--volt)' }}>X</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.1em' }}>
          © 2024 GYMX. TRAIN LIKE YOU MEAN IT.
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
          success: { iconTheme: { primary: 'var(--volt)', secondary: 'var(--obsidian)' } },
        }}
      />
    </AuthProvider>
  );
}
