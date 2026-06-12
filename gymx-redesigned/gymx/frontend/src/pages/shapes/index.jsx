import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search } from 'lucide-react';
import Head from 'next/head';

const SHAPES = [
  // ── Chest ──
  { id: 1,  category: 'Chest', name: 'Bench Press',         name_ar: 'ضغط البنش',         imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfdkkZYBajt85_uXRCLJWzf_FunhIkVuQXHgokJiETwA&s=10' },
  { id: 2,  category: 'Chest', name: 'Incline Bench Press',  name_ar: 'ضغط البنش المائل',  imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoerxmCNgSTxV7x-8aOQ0DLEixIkdzCwEBECR93l9ZtQ&s=10' },
  { id: 3,  category: 'Chest', name: 'Push-Ups',             name_ar: 'تمرين الضغط',       imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3fsAh83D9CpPlEo93dxB7Vt1kRpV0lcvrsS7-e-xx9Q&s=10' },
  { id: 4,  category: 'Chest', name: 'Cable Flys',           name_ar: 'فلاي كيبل',         imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAHAw_21OLHvdbhldlnJFM4fiXyNSiTJ1L4O7zMlddzg&s=10' },
  { id: 5,  category: 'Chest', name: 'Chest Dips',           name_ar: 'دبس الصدر',         imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxEpKEmgFNvcKKc3-XxulUJB0PhtpM8MpENIjnQsyFwA&s=10' },
  // ── Back ──
  { id: 6,  category: 'Back',  name: 'Pull-Ups',             name_ar: 'عقلة',              imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvqtwh0aq0h80IqU9kIQH_-Sangg93yWu6dpYgxqvHAQ&s=10' },
  { id: 7,  category: 'Back',  name: 'Barbell Row',          name_ar: 'رووينج بار',        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlZxbZuIF5FDjYbe4kI2KixAwued6Q8wwfaclRkYy3oQ&s=10' },
  { id: 8,  category: 'Back',  name: 'Lat Pulldown',         name_ar: 'لات بول داون',      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6lFLt2zQKxrBBVQXUk9YmEy2kzLoVuJuR0lr_EXhNBQ&s=10' },
  { id: 9,  category: 'Back',  name: 'Deadlift',             name_ar: 'ديد ليفت',          imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqYhFb1LZnnqhHy2Cqo_Y2DogUVM_C1F_zefek5vB6KQ&s=10' },
  { id: 10, category: 'Back',  name: 'Seated Row',           name_ar: 'رووينج كيبل جالس', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9uSrRBo5_uV7IbZk9Vqy6EG32S-Fjf3-1mqsZ4Fe_pw&s=10' },
];

const CAT_COLOR = {
  Chest:     { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)',  text: '#f87171' },
  Back:      { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',   text: '#60a5fa' },
  Shoulders: { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',   text: '#fbbf24' },
  Biceps:    { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',   text: '#34d399' },
  Triceps:   { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)',  text: '#a78bfa' },
  Legs:      { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)',   text: '#fb923c' },
  Glutes:    { bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)',  text: '#f472b6' },
  Abs:       { bg: 'rgba(34,211,238,0.12)',  border: 'rgba(34,211,238,0.3)',   text: '#22d3ee' },
  Calves:    { bg: 'rgba(163,230,53,0.12)',  border: 'rgba(163,230,53,0.3)',   text: '#a3e635' },
  Forearms:  { bg: 'rgba(251,207,232,0.12)', border: 'rgba(251,207,232,0.3)',  text: '#fbcfe8' },
};

function ShapeCard({ shape, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [imgError, setImgError] = useState(false);
  const cat = CAT_COLOR[shape.category] || CAT_COLOR.Chest;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
    >
      <motion.div
        whileHover={{ y: -6, borderColor: 'rgba(61,127,255,0.45)', boxShadow: '0 16px 48px rgba(61,127,255,0.18)' }}
        style={{ position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, transition: 'all 300ms ease', height: '100%' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)' }} />

        {/* Image */}
        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(61,127,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!imgError && shape.imageUrl ? (
            <img
              src={shape.imageUrl}
              alt={shape.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'rgba(61,127,255,0.3)' }}>IMG</div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--chalk)', lineHeight: 1.2, marginBottom: 4 }}>
            {shape.name}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', direction: 'rtl', fontFamily: 'sans-serif', marginBottom: 12 }}>
            {shape.name_ar}
          </div>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: cat.bg, border: '1px solid ' + cat.border, color: cat.text }}>
            {shape.category}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ShapesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [...new Set(SHAPES.map(s => s.category))];

  const filtered = SHAPES.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || s.name_ar.includes(search);
    const matchCat = !category || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Head><title>Exercise Shapes - GYMX</title></Head>

      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12 }}>— Exercise Shapes</div>
            <h1 className="display-lg" style={{ marginBottom: 0 }}>Perfect<br /><span style={{ color: 'var(--volt)' }}>Form</span></h1>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 64, zIndex: 50, background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input className="input" placeholder="Search shapes..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: '1 1 160px', cursor: 'pointer' }}>
              <option value="">All Muscles</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || category) && (
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setCategory(''); }}>Clear</button>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="mono" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>{filtered.length} shapes found</div>
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map((shape, i) => <ShapeCard key={shape.id} shape={shape} index={i} />)}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(61,127,255,0.15)', marginBottom: 16 }}>X</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>No shapes found</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>Try different filters</div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
