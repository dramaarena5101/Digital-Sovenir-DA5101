import { motion } from 'framer-motion';
import { Star, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { getDirectImageUrl } from '@/lib/utils';
import { fadeUp, steps } from '@/lib/themeData';

export default function DefaultTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  return (
    <div style={{ backgroundColor: 'var(--canvas)' }}>
      {/* ====== NAVBAR ====== */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 64, backgroundColor: 'rgba(250, 249, 245, 0.9)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {logoSrc ? (
              <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Star size={20} color="var(--on-primary)" fill="var(--on-primary)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                  Drama Arena <span style={{ color: 'var(--primary)' }}>5101</span>
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <button className="btn-primary" onClick={() => router.push(isActivated ? '/dashboard' : '/activate')}>
                {isActivated ? 'Dashboard' : 'Aktivasi'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="btn-text" onClick={() => router.push('/login')} style={{ fontSize: 14 }}>
                  Masuk
                </button>
                <button className="btn-primary" onClick={() => router.push('/login')}>
                  Daftar Sekarang
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section style={{ paddingTop: 160, paddingBottom: 'var(--space-section)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <motion.div initial="hidden" animate="visible" style={{ maxWidth: 560 }}>
              <motion.div variants={fadeUp} custom={0}>
                <span className="badge badge-coral" style={{ marginBottom: 20, display: 'inline-block' }}>
                  ✦ DIGITAL SOUVENIR EKSKLUSIF
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="display-xl" style={{ marginBottom: 24 }}>
                Kenang-kenangan
                <br />
                <span style={{ color: 'var(--primary)' }}>Drama Arena</span>
                <br />
                5101
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="body-md" style={{ color: 'var(--muted)', marginBottom: 40, maxWidth: 440, fontSize: 18, lineHeight: 1.7 }}>
                Koleksi digital eksklusif Pentas Seni. Video penampilan, galeri foto, komik digital, soundtrack, dan konten bonus — semua dalam genggaman Anda.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-primary btn-lg" onClick={handleCTA}>
                  <Sparkles size={18} />
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </button>
                <a href="#features" className="btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                  Lihat Koleksi
                  <ChevronDown size={18} />
                </a>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40, rotateY: -5 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <div style={{ backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(204,120,92,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(93,184,166,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Koleksi Digital
                    </span>
                    <h3 style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.3px', marginTop: 8 }}>
                      Drama Arena 5101
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { icon: 'Video', count: '11+ Video' },
                      { icon: 'Foto', count: '200+ Foto' },
                      { icon: 'Komik', count: 'Digital' },
                      { icon: 'Audio', count: 'Soundtrack' },
                      { icon: 'Bonus', count: 'Eksklusif' },
                      { icon: 'Reward', count: 'Badge' },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }} style={{ backgroundColor: 'var(--surface-dark-elevated)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ color: 'var(--on-dark)', fontSize: 13, fontWeight: 500 }}>{item.icon}</div>
                          <div style={{ color: 'var(--on-dark-soft)', fontSize: 11 }}>{item.count}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--on-dark-soft)', fontSize: 12 }}>Satu komik, satu aktivasi</span>
                    <span className="badge badge-coral" style={{ fontSize: 10 }}>PREMIUM</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" style={{ padding: 'var(--space-section) 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.span variants={fadeUp} custom={0} className="caption-uppercase" style={{ color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              APA YANG ANDA DAPATKAN
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="display-lg" style={{ marginBottom: 16 }}>
              Koleksi Digital <span style={{ color: 'var(--primary)' }}>Eksklusif</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="body-md" style={{ color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>
              Sekali aktivasi, seluruh koleksi langsung terbuka. Akses kapan saja, di mana saja, selamanya.
            </motion.p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {visibleFeatures.map((feature, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i}>
                <div className="card" style={{ height: '100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <feature.icon size={22} color={feature.color} />
                  </div>
                  <h3 className="title-md" style={{ marginBottom: 8 }}>{feature.title}</h3>
                  <p className="body-sm" style={{ color: 'var(--muted)' }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section style={{ backgroundColor: 'var(--surface-soft)', padding: 'var(--space-section) 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.span variants={fadeUp} custom={0} className="caption-uppercase" style={{ color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              CARA MENGAKSES
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="display-lg">
              Empat Langkah <span style={{ color: 'var(--primary)' }}>Mudah</span>
            </motion.h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {steps.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', backgroundColor: i === steps.length - 1 ? 'var(--primary)' : 'var(--canvas)', border: i === steps.length - 1 ? 'none' : '2px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: i === steps.length - 1 ? 'var(--on-primary)' : 'var(--primary)' }}>
                    {step.number}
                  </span>
                </div>
                <h3 className="title-md" style={{ marginBottom: 8 }}>{step.title}</h3>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA BAND ====== */}
      <section style={{ padding: 'var(--space-section) 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="section-coral" style={{ textAlign: 'center' }}>
            <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 8 }}>
              <Sparkles size={32} color="var(--on-primary)" style={{ margin: '0 auto', opacity: 0.8 }} />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="display-md" style={{ color: 'var(--on-primary)', marginBottom: 16 }}>
              Satu Komik. Satu Aktivasi.
              <br />
              Seluruh Koleksi.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="body-md" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
              Dapatkan akses ke seluruh Digital Souvenir Pentas Seni Drama Arena 5101 sekarang juga.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <button className="btn-secondary btn-lg" onClick={handleCTA} style={{ backgroundColor: 'var(--canvas)', color: 'var(--ink)' }}>
                Mulai Sekarang
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer style={{ backgroundColor: 'var(--surface-dark)', color: 'var(--on-dark-soft)', padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={16} color="var(--on-primary)" fill="var(--on-primary)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--on-dark)', letterSpacing: '-0.3px' }}>
                  Drama Arena 5101
                </span>
              </div>
              <p className="body-sm" style={{ color: 'var(--on-dark-soft)', maxWidth: 300 }}>
                Digital Souvenir Eksklusif Pentas Seni. Kenang-kenangan resmi acara dalam koleksi digital premium.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
