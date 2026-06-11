import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown, Zap, Target, TrendingUp } from 'lucide-react';
import Head from 'next/head';

function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Stat Card — Liquid Glass
function StatCard({ number, label, icon: Icon, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      style={{
        textAlign: 'center',
        padding: '32px 24px',
        position: 'relative',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--glass-shadow)',
        transition: 'all 300ms ease',
        overflow: 'hidden',
      }}
      whileHover={{
        borderColor: 'rgba(61,127,255,0.4)',
        boxShadow: '0 16px 48px rgba(61,127,255,0.2)',
        y: -4,
      }}
    >
      {/* Inner top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
      }} />

      {Icon && (
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'var(--volt-dim)',
          border: '1px solid rgba(61,127,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--volt)',
        }}>
          <Icon size={18} />
        </div>
      )}

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        color: 'var(--volt)',
        lineHeight: 1,
        textShadow: '0 0 30px rgba(61,127,255,0.4)',
      }}>
        {number}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        color: 'var(--ash-light)',
        marginTop: 8,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </motion.div>
  );
}

// Program Card — Liquid Glass
function ProgramCard({ title, days, level, goal, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const levelColor = {
    beginner: '#4ade80',
    intermediate: '#facc15',
    advanced: 'var(--fire)',
  }[level];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        minWidth: 260,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--glass-shadow)',
        transition: 'all 300ms ease',
      }}
      whileHover={{
        borderColor: 'rgba(61,127,255,0.45)',
        boxShadow: '0 16px 48px rgba(61,127,255,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
        y: -6,
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      }} />

      {/* X watermark */}
      <div style={{
        position: 'absolute',
        right: -20, top: -20,
        fontFamily: 'var(--font-display)',
        fontSize: '10rem',
        color: 'rgba(61,127,255,0.04)',
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        X
      </div>

      {/* Level accent strip */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${levelColor}, transparent)`,
        opacity: 0.7,
      }} />

      <div style={{ padding: '28px 24px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: levelColor,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 12,
          textShadow: `0 0 12px ${levelColor}55`,
        }}>
          {level} · {goal}
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          marginBottom: 20,
        }}>
          {title}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            color: 'var(--volt)',
            lineHeight: 1,
            textShadow: '0 0 24px rgba(61,127,255,0.4)',
          }}>
            {days}
            <span style={{ fontSize: '1rem', color: 'var(--ash)', marginLeft: 4 }}>days/wk</span>
          </div>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'var(--volt-dim)',
            border: '1px solid rgba(61,127,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--volt)',
            backdropFilter: 'blur(8px)',
          }}>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================
// HOME PAGE
// =============================================
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const samplePrograms = [
    { title: 'Power Builder', days: 5, level: 'intermediate', goal: 'Strength' },
    { title: 'Shred Protocol', days: 4, level: 'advanced', goal: 'Fat Loss' },
    { title: 'First Steps', days: 3, level: 'beginner', goal: 'General' },
    { title: 'Mass Phase', days: 6, level: 'advanced', goal: 'Hypertrophy' },
  ];

  return (
    <>
      <Head>
        <title>GYMX — Train Like You Mean It</title>
        <meta name="description" content="Premium gym training programs and exercises. Built for those who are serious." />
        <meta name="theme-color" content="#3D7FFF" />
      </Head>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 24px 80px',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient — blue/orange tones */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 20% 80%, rgba(61,127,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 20%, rgba(255,107,43,0.07) 0%, transparent 60%), linear-gradient(180deg, transparent 40%, rgba(8,8,16,0.9) 100%)',
          zIndex: 1,
        }} />

        {/* Animated grid lines */}
        <motion.div
          style={{ position: 'absolute', inset: 0, opacity: 0.04, y: heroY }}
          aria-hidden
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i / 12) * 100}%`,
                top: 0, bottom: 0,
                width: 1,
                background: 'linear-gradient(180deg, transparent, var(--volt), transparent)',
              }}
            />
          ))}
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', width: '100%', y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              color: 'var(--volt)',
              textTransform: 'uppercase',
              marginBottom: 24,
              textShadow: '0 0 16px rgba(61,127,255,0.5)',
            }}
          >
            Est. 2024 · Premium Training
          </motion.div>

          <motion.h1
            className="display-xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ color: 'var(--chalk)', marginBottom: 4 }}
          >
            Train
          </motion.h1>

          <motion.h1
            className="display-xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              color: 'var(--volt)',
              textShadow: '0 0 60px rgba(61,127,255,0.35)',
              marginBottom: 4,
            }}
          >
            Like You
          </motion.h1>

          <motion.h1
            className="display-xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ color: 'var(--chalk)', marginBottom: 48 }}
          >
            Mean It
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <Link href="/programs" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Start Training <ArrowRight size={18} />
            </Link>
            <Link href="/exercises" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Browse Exercises
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: 32, right: 32,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ color: 'var(--ash)' }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS — Liquid Glass Pills ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}>
            <StatCard number="50+" label="Exercises" icon={Dumbbell} delay={0} />
            <StatCard number="12" label="Programs" icon={Target} delay={0.1} />
            <StatCard number="3" label="Difficulty Levels" icon={TrendingUp} delay={0.2} />
            <StatCard number="8" label="Muscle Groups" icon={Zap} delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── PROGRAMS PREVIEW ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <Reveal>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 48,
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div className="mono" style={{ color: 'var(--volt)', marginBottom: 12, textShadow: '0 0 12px rgba(61,127,255,0.4)' }}>
                  — Featured Programs
                </div>
                <h2 className="display-lg" style={{ color: 'var(--chalk)' }}>
                  Built for<br />
                  <span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.3)' }}>Results</span>
                </h2>
              </div>
              <Link href="/programs" className="btn btn-outline">
                All Programs <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {samplePrograms.map((p, i) => (
              <ProgramCard key={i} {...p} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MUSCLE GROUPS — Glass tiles ── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <Reveal>
            <div className="mono" style={{ color: 'var(--ash)', marginBottom: 12 }}>
              — Target any muscle
            </div>
            <h2 className="display-lg" style={{ marginBottom: 48 }}>
              Every<br />
              <span style={{ color: 'var(--volt)', textShadow: '0 0 40px rgba(61,127,255,0.3)' }}>Muscle Group</span>
            </h2>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}>
            {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'].map((muscle, i) => (
              <Reveal key={muscle} delay={i * 0.06}>
                <Link href={`/exercises?muscle_group=${muscle}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{
                      backgroundColor: 'rgba(61,127,255,0.1)',
                      borderColor: 'rgba(61,127,255,0.4)',
                      color: 'var(--volt)',
                      boxShadow: '0 4px 20px rgba(61,127,255,0.15)',
                      y: -2,
                    }}
                    style={{
                      padding: '20px 16px',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--chalk)',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    {muscle}
                    <span style={{ color: 'var(--volt)', opacity: 0.6, fontSize: '1.1rem' }}>→</span>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — Glass Panel ── */}
      <section style={{ padding: '120px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Reveal>
            <div style={{
              display: 'inline-block',
              padding: '60px 80px',
              background: 'linear-gradient(135deg, rgba(61,127,255,0.08) 0%, rgba(255,107,43,0.05) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top shimmer */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              }} />

              <div className="mono" style={{ color: 'var(--ash)', marginBottom: 24 }}>
                — No excuses. No shortcuts.
              </div>
              <h2 className="display-lg" style={{ marginBottom: 40 }}>
                Ready to Start?
              </h2>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                Join For Free <ArrowRight size={20} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
