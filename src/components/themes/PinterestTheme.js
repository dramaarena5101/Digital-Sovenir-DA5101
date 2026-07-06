import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/utils';
import { fadeUp } from '@/lib/themeData';
import { Search } from 'lucide-react';

export default function PinterestTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  const heroImage = settings?.heroImageUrl ? getDirectImageUrl(settings.heroImageUrl) : null;

  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* NAVBAR */}
      <nav style={{ 
        position: 'fixed', width: '100%', zIndex: 50, 
        backgroundColor: 'var(--canvas)', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>
          {logoSrc ? (
            <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 32 }} />
          ) : (
            <span style={{ color: 'var(--primary)' }}>DA5101</span>
          )}
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} color="var(--muted)" style={{ position: 'absolute', left: 16, top: 14 }} />
          <div style={{ 
            backgroundColor: 'var(--surface-card)', borderRadius: '9999px',
            padding: '12px 16px 12px 48px', color: 'var(--muted)', fontSize: 16
          }}>
            Temukan koleksi digital...
          </div>
        </div>

        <div>
          <button 
            onClick={handleCTA}
            style={{ 
              backgroundColor: 'var(--primary)', color: 'white', 
              border: 'none', padding: '12px 24px', borderRadius: '24px',
              fontWeight: 700, fontSize: 16, cursor: 'pointer'
            }}
          >
            {user ? (isActivated ? 'Dashboard' : 'Aktivasi') : 'Masuk'}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ paddingTop: 120, paddingBottom: 60, textAlign: 'center' }}>
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 600, letterSpacing: '-1.2px', marginBottom: 24 }}>
              Temukan inspirasi <br/>dari penampilan terbaik.
            </h1>
            <p style={{ fontSize: 20, color: 'var(--muted)', maxWidth: 600, margin: '0 auto' }}>
              Jelajahi setiap momen Drama Arena 5101 dalam satu tempat.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MASONRY GRID (Simulated via columns) */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          columnCount: 3,
          columnGap: '16px',
        }}>
          {/* Inject Hero Image as a tall pin if available */}
          {heroImage && (
            <div style={{ marginBottom: 16, breakInside: 'avoid' }}>
              <img src={heroImage} alt="Hero" style={{ width: '100%', borderRadius: '16px', display: 'block' }} />
            </div>
          )}

          {visibleFeatures.map((feature, i) => (
            <div key={i} style={{ 
              marginBottom: 16, breakInside: 'avoid',
              backgroundColor: 'var(--surface-card)',
              borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '24px',
                backgroundColor: 'var(--canvas)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <feature.icon size={24} color="var(--ink)" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.4 }}>{feature.description}</p>
              </div>
              <button onClick={handleCTA} style={{
                marginTop: 'auto', backgroundColor: 'var(--canvas)', border: 'none',
                padding: '8px 16px', borderRadius: '9999px', fontWeight: 700,
                alignSelf: 'flex-start', cursor: 'pointer'
              }}>
                Buka
              </button>
            </div>
          ))}
          
          {/* Add some dummy skeleton pins for the masonry look */}
          <div style={{ marginBottom: 16, breakInside: 'avoid', backgroundColor: 'var(--surface-card)', borderRadius: '16px', height: 300 }} />
          <div style={{ marginBottom: 16, breakInside: 'avoid', backgroundColor: 'var(--surface-card)', borderRadius: '16px', height: 200 }} />
          <div style={{ marginBottom: 16, breakInside: 'avoid', backgroundColor: 'var(--surface-card)', borderRadius: '16px', height: 250 }} />
        </div>
      </section>
    </div>
  );
}
