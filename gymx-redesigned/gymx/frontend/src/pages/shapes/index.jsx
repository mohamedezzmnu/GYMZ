import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search } from 'lucide-react';
import Head from 'next/head';

// =============================================
// أضف أشكال التمارين هنا
// كل شكل: { id, name, name_ar, imageUrl }
// =============================================
const SHAPES = [
  // مثال:
  // { id: 1, name: 'Bench Press Form', name_ar: 'شكل ضغط البنش', imageUrl: 'https://...' },
];

function ShapeCard({ shape, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
    >
      <motion.div
        whileHover={{
          y: -6,
          borderColor: 'rgba(61,127,255,0.45)',
          boxShadow: '0 16px 48px rgba(61,127,255,0.18)',
        }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          transition: 'all 300ms ease',
          height: '100%',
        }}
      >
        {/* Top shimmer line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)',
          }}
        />

        {/* Image */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            overflow: 'hidden',
            background: 'rgba(61,127,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!imgError && shape.imageUrl ? (
            <img
              src={shape.imageUrl}
              alt={shape.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
            />
          ) : (
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                color: 'rgba(61,127,255,0.3)',
                letterSpacing: '0.1em',
              }}
            >
              IMG
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 16 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {shape.name}
          </div>
          <div
            style={{
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.55)',
              direction: 'rtl',
              fontFamily: 'sans-serif',
            }}
          >
            {shape.name_ar}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ShapesPage() {
  const [search, setSearch] = useState('');

  const filtered = SHAPES.filter((s) => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.name.toLowerCase().includes(q) ||
      s.name_ar.includes(search)
    );
  });

  return (
    <>
      <Head>
        <title>Exercise Shapes - GYMX</title>
      </Head>

      {/* Hero */}
      <section
        style={{
          padding: '60px 0 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12 }}>
              — Exercise Shapes
            </div>
            <h1 className="display-lg" style={{ marginBottom: 0 }}>
              Perfect<br />
              <span style={{ color: 'var(--volt)' }}>Form</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section
        style={{
          padding: '20px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 64,
          zIndex: 50,
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                }}
              />
              <input
                className="input"
                placeholder="Search shapes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
            {search && (
              <button className="btn btn-ghost" onClick={() => setSearch('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div
            className="mono"
            style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}
          >
            {filtered.length} shapes found
          </div>

          {filtered.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {filtered.map((shape, i) => (
                <ShapeCard key={shape.id} shape={shape} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 0' }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4rem',
                  color: 'rgba(61,127,255,0.15)',
                  marginBottom: 16,
                }}
              >
                X
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  marginBottom: 8,
                }}
              >
                {SHAPES.length === 0 ? 'No shapes added yet' : 'No shapes found'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                {SHAPES.length === 0
                  ? 'Add shapes to the SHAPES array in this file'
                  : 'Try a different search'}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
