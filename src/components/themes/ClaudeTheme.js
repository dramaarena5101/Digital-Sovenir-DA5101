import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/utils';
import { fadeUp, steps } from '@/lib/themeData';

export default function ClaudeTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  const heroImage = settings?.heroImageUrl ? getDirectImageUrl(settings.heroImageUrl) : null;

  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAVBAR */}
      <nav style={{ padding: '24px 0', borderBottom: '1px solid var(--hairline)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>
            {logoSrc ? (
              <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 40 }} />
            ) : (
              <span>Drama Arena <span style={{ color: 'var(--primary)' }}>5101</span></span>
            )}
          </div>
          <div>
            <button className="btn-primary" onClick={handleCTA} style={{ borderRadius: 'var(--radius-xs)', padding: '8px 24px' }}>
              {user ? (isActivated ? 'Dashboard' : 'Aktivasi') : 'Mulai Akses'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ paddingTop: 80, paddingBottom: 80, flex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1.1, marginBottom: 24, color: 'var(--ink)' }}>
                Dokumentasi Eksklusif Pentas Seni
              </h1>
              <p style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}>
                Simpan dan nikmati kembali setiap momen bersejarah dari Drama Arena 5101. 
                Satu platform untuk seluruh memori penampilan.
              </p>
              <button className="btn-primary btn-lg" onClick={handleCTA} style={{ borderRadius: 'var(--radius-xs)' }}>
                Jelajahi Koleksi Sekarang
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
              {heroImage ? (
                <img src={heroImage} alt="Hero" style={{ width: '100%', height: 600, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <div style={{ width: '100%', height: 600, backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-md)' }} />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES LIST */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)', backgroundColor: 'var(--surface-soft)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800, margin: '0 auto' }}>
            {visibleFeatures.map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingBottom: 32, borderBottom: i !== visibleFeatures.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                <div style={{ padding: 16, backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-xs)' }}>
                  <feature.icon size={24} color="var(--ink)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8, color: 'var(--ink)' }}>{feature.title}</h3>
                  <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
