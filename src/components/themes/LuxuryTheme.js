import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/utils';
import { fadeUp } from '@/lib/themeData';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LuxuryTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  const heroImage = settings?.heroImageUrl ? getDirectImageUrl(settings.heroImageUrl) : null;

  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* NAVBAR */}
      <nav style={{ 
        position: 'absolute', width: '100%', zIndex: 50, 
        padding: '24px 0', borderBottom: '1px solid rgba(200, 120, 70, 0.1)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {logoSrc ? (
              <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 32 }} />
            ) : (
              <span style={{ color: 'var(--primary)' }}>Drama Arena 5101</span>
            )}
          </div>
          
          <div>
            <button 
              onClick={handleCTA}
              style={{ 
                backgroundColor: 'transparent', color: 'var(--primary)', 
                border: '1px solid var(--primary)', padding: '10px 32px', 
                fontWeight: 400, fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              {user ? (isActivated ? 'Dashboard' : 'Aktivasi') : 'Eksklusif Akses'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        paddingTop: 160, paddingBottom: 100, textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(200,120,70,0.15) 0%, transparent 60%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ height: 1, width: 40, backgroundColor: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: 12 }}>
                Digital Souvenir
              </span>
              <div style={{ height: 1, width: 40, backgroundColor: 'var(--primary)' }} />
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 400, marginBottom: 40, lineHeight: 1.2 }}>
              Koleksi Maha Karya<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Drama Arena 5101</span>
            </h1>

            {/* Glowing Hero Image */}
            <div style={{ 
              width: '100%', maxWidth: 400, height: 400, margin: '0 auto 60px',
              borderRadius: '50%', padding: 4,
              background: 'linear-gradient(45deg, var(--primary), transparent)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                backgroundColor: 'var(--surface-card)', position: 'relative'
              }}>
                {heroImage ? (
                  <img src={heroImage} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Sparkles size={64} color="var(--primary)" opacity={0.5} />
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>
              Persembahan eksklusif untuk mengenang kembali setiap detik penampilan memukau dalam balutan digital premium.
            </p>
          </motion.div>
        </div>
      </section>

      {/* LUXURY FEATURES */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-soft)', borderTop: '1px solid rgba(200, 120, 70, 0.1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic' }}>Fasilitas Eksklusif</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {visibleFeatures.map((feature, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid rgba(200,120,70,0.1)', backgroundColor: 'var(--canvas)' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <feature.icon size={32} color="var(--primary)" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 16, color: 'var(--primary)' }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{feature.description}</p>
                <div style={{ marginTop: 24, height: 1, width: 40, backgroundColor: 'var(--primary)', margin: '24px auto 0' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BLOCK */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 32 }}>Miliki Koleksi Ini Sekarang</h2>
        <button 
          onClick={handleCTA}
          style={{ 
            backgroundColor: 'var(--primary)', color: 'var(--canvas)', 
            border: 'none', padding: '16px 48px', 
            fontWeight: 400, fontSize: 14, textTransform: 'uppercase', letterSpacing: '2px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto'
          }}
        >
          Masuk ke Galeri <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
