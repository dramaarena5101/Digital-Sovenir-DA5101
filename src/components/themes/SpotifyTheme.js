import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/utils';
import { fadeUp, steps } from '@/lib/themeData';
import { Play } from 'lucide-react';

export default function SpotifyTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  const heroImage = settings?.heroImageUrl ? getDirectImageUrl(settings.heroImageUrl) : null;

  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* NAVBAR */}
      <nav style={{ padding: '24px 32px', position: 'absolute', width: '100%', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.5px' }}>
            {logoSrc ? (
              <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 32 }} />
            ) : (
              <span>Drama Arena <span style={{ color: 'var(--primary)' }}>5101</span></span>
            )}
          </div>
          <div>
            <button 
              onClick={handleCTA}
              style={{ 
                backgroundColor: 'var(--ink)', color: 'var(--canvas)', 
                border: 'none', padding: '12px 32px', borderRadius: '500px',
                fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1.5px',
                cursor: 'pointer'
              }}
            >
              {user ? (isActivated ? 'Dashboard' : 'Aktivasi') : 'Log In'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative', 
        paddingTop: 160, 
        paddingBottom: 80,
        background: heroImage ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, var(--canvas) 100%), url(${heroImage}) center/cover` : 'var(--surface-dark)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-2px', marginBottom: 24, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              Memori yang <br/>Selalu Berputar.
            </h1>
            <p style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
              Putar ulang semua kenangan Drama Arena 5101. Koleksi eksklusif ini milikmu.
            </p>
            <button 
              onClick={handleCTA}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#000',
                border: 'none',
                padding: '16px 48px',
                borderRadius: '500px',
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(30, 215, 96, 0.3)'
              }}
            >
              Mainkan Sekarang
            </button>
          </motion.div>
        </div>
      </section>

      {/* FEATURES / TRACKLIST */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Daftar Putar Koleksi</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visibleFeatures.map((feature, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 24, 
                padding: '16px 24px', backgroundColor: 'var(--surface-card)', 
                borderRadius: '8px', cursor: 'pointer'
              }}>
                <div style={{ color: 'var(--muted)', width: 24, textAlign: 'center', fontWeight: 500 }}>
                  {i + 1}
                </div>
                <div style={{ width: 48, height: 48, backgroundColor: 'var(--surface-dark)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <feature.icon size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{feature.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>{feature.description}</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={16} color="var(--ink)" fill="var(--ink)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
