import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// ✅ لو أي صفحة رمت error وقت الرندر، هنا بيتلقط بدل ما الموقع كله يبيّض
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('GYMZ ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: 'calc(100vh - 92px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 20,
          }}>
            <AlertTriangle size={24} color="#f87171" />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', marginBottom: 8,
          }}>
            حصلت مشكلة غير متوقعة
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ash-light)', marginBottom: 26, maxWidth: 340,
          }}>
            حاول تاني، ولو المشكلة استمرت جرب تقفل الصفحة وتفتحها من جديد
          </div>
          <button
            onClick={this.handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)',
              color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
            رجوع للرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
