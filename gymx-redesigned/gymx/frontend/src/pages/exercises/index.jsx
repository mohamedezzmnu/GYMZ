import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, ChevronRight } from 'lucide-react';
import Head from 'next/head';
import { api } from '../context/AuthContext';

const fetcher = (url) => api.get(url).then(r => r.data);

// Exercise Card — Liquid Glass
function ExerciseCard({ exercise, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/exercises/${exercise.id}`} style={{ textDecoration: 'none' }}>
        <motion.div
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--glass-shadow)',
            transition: 'all 300ms ease',
          }}
          whileHover="hover"
          variants={{
            hover: {
              borderColor: 'rgba(61,127,255,0.45)',
              boxShadow: '0 16px 48px rgba(61,127,255,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
              y: -6,
            },
          }}
        >
          {/* Top shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          }} />

          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--iron)', overflow: 'hidden' }}>
            {exercise.image_url ? (
              <Image
                src={exercise.image_url}
                alt={exercise.name}
                fill
                style={{ objectFit: 'cover', transition: 'transform 500ms ease' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '5rem',
                color: 'rgba(61,127,255,0.10)',
              }}>
                X
              </div>
            )}

            <motion.div
              variants={{ hover: { opacity: 1 } }}
              initial={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(8,8,16,0.85), transparent)',
              }}
            />
          </div>

          {/* Info */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: 'var(--chalk)',
                  lineHeight: 1.2,
                }}>
                  {exercise.name}
                </div>
                {exercise.name_ar && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--ash)', marginTop: 2, direction: 'rtl' }}>
                    {exercise.name_ar}
                  </div>
                )}
              </div>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'var(--volt-dim)',
                border: '1px solid rgba(61,127,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                <ChevronRight size={14} style={{ color: 'var(--volt)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {exercise.difficulty && (
                <span className={`badge badge-${exercise.difficulty}`}>
                  {exercise.difficulty}
                </span>
              )}
              {exercise.muscle_group && (
                <span className="badge badge-volt">
                  {exercise.muscle_group}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 20, marginBottom: 8, width: '70%' }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (muscleGroup) params.set('muscle_group', muscleGroup);
  if (difficulty) params.set('difficulty', difficulty);
  params.set('page', page);
  params.set('limit', '12');

  const { data, isLoading } = useSWR(`/exercises?${params}`, fetcher, { keepPreviousData: true });
  const { data: mgData } = useSWR('/exercises/muscle-groups', fetcher);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <>
      <Head><title>Exercises — GYMX</title></Head>

      {/* Page Header */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12, textShadow: '0 0 12px rgba(61,127,255,0.4)' }}>
              — Exercise Library
            </div>
            <h1 className="display-lg" style={{ marginBottom: 0 }}>
              Every<br />
              <span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.3)' }}>Movement</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Filters — Liquid Glass sticky bar */}
      <section style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky', top: 64, zIndex: 50,
        background: 'rgba(8,8,16,0.80)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
              <input
                className="input"
                placeholder="Search exercises..."
                value={search}
                onChange={handleSearch}
                style={{ paddingLeft: 40 }}
              />
            </div>

            <select
              className="input"
              value={muscleGroup}
              onChange={(e) => { setMuscleGroup(e.target.value); setPage(1); }}
              style={{ flex: '1 1 160px', cursor: 'pointer' }}
            >
              <option value="">All Muscles</option>
              {mgData?.muscleGroups?.map(mg => (
                <option key={mg.id} value={mg.name}>{mg.name}</option>
              ))}
            </select>

            <select
              className="input"
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              style={{ flex: '1 1 140px', cursor: 'pointer' }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {(search || muscleGroup || difficulty) && (
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setMuscleGroup(''); setDifficulty(''); setPage(1); }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          {data && (
            <div className="mono" style={{ color: 'var(--ash)', marginBottom: 24 }}>
              {data.pagination.total} exercises found
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {isLoading
              ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
              : data?.exercises?.map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)
            }
          </div>

          {!isLoading && data?.exercises?.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(61,127,255,0.15)', marginBottom: 16 }}>X</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>No exercises found</div>
              <div style={{ color: 'var(--ash)' }}>Try different filters</div>
            </motion.div>
          )}

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {[...Array(data.pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: 40, height: 40,
                    border: `1px solid ${page === i + 1 ? 'var(--volt)' : 'var(--glass-border)'}`,
                    background: page === i + 1
                      ? 'linear-gradient(135deg, var(--volt), #5A9BFF)'
                      : 'var(--glass-bg)',
                    backdropFilter: 'blur(8px)',
                    color: page === i + 1 ? '#fff' : 'var(--chalk)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    transition: 'all 150ms ease',
                    boxShadow: page === i + 1 ? '0 4px 16px var(--volt-glow)' : 'none',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
