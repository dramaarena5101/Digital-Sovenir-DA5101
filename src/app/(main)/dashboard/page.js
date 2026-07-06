'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getDirectImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Video, Camera, BookOpen, Music, Gift, Award, ArrowRight, Sparkles, Star } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const collections = [
  { icon: Video, label: 'Video Penampilan', desc: 'Seluruh video penampilan acara', href: '/videos', color: 'var(--primary)' },
  { icon: Camera, label: 'Galeri Foto', desc: 'Album foto resmi acara', href: '/gallery', color: 'var(--accent-teal)' },
  { icon: BookOpen, label: 'Komik Digital', desc: 'Baca komik versi digital', href: '/comic', color: 'var(--accent-amber)' },
  { icon: Music, label: 'Soundtrack', desc: 'Audio resmi acara', href: '/soundtrack', color: 'var(--success)' },
  { icon: Gift, label: 'Bonus Content', desc: 'Konten eksklusif BTS', href: '/bonus', color: 'var(--primary)' },
  { icon: Award, label: 'Reward Saya', desc: 'Badge & sertifikat digital', href: '/rewards', color: 'var(--accent-amber)' },
];

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const firstName = (userData?.name || user?.displayName || 'User').split(' ')[0];

  const heroImageRaw = settings?.heroImageUrl || null;
  const heroImage = heroImageRaw ? getDirectImageUrl(heroImageRaw) : null;
  const logoSrcRaw = settings?.logoUrl || null;
  const logoSrc = logoSrcRaw ? getDirectImageUrl(logoSrcRaw) : null;

  const visibleCollections = collections.filter(item => {
    if (item.href === '/videos' && settings?.showVideo === false) return false;
    if (item.href === '/gallery' && settings?.showGallery === false) return false;
    if (item.href === '/comic' && settings?.showComic === false) return false;
    if (item.href === '/soundtrack' && settings?.showSoundtrack === false) return false;
    if (item.href === '/bonus' && settings?.showBonus === false) return false;
    if (item.href === '/rewards' && settings?.showRewards === false) return false;
    return true;
  });

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Welcome Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>
              DIGITAL SOUVENIR
            </p>
            <h1 className="display-md" style={{ marginBottom: 8 }}>
              Selamat datang, <span style={{ color: 'var(--primary)' }}>{firstName}</span>
            </h1>
            <p className="body-md" style={{ color: 'var(--muted)', maxWidth: 500 }}>
              Seluruh koleksi Digital Souvenir Pentas Seni Drama Arena 5101 telah terbuka untuk Anda. Selamat menikmati!
            </p>
          </div>
          <div className="badge badge-success" style={{ fontSize: 13 }}>
            <Sparkles size={14} />
            Akun Aktif
          </div>
        </div>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        variants={fadeUp}
        custom={1}
        style={{
          background: heroImage 
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${heroImage}) center/cover no-repeat` 
            : 'linear-gradient(135deg, var(--surface-dark) 0%, var(--surface-dark-soft) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {!heroImage && (
          <>
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(204,120,92,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: -30, left: '30%',
              width: 150, height: 150,
              background: 'radial-gradient(circle, rgba(93,184,166,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
          </>
        )}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" style={{ height: 72, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Star size={36} color="var(--on-primary)" fill="var(--on-primary)" />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 4 }}>
              Drama Arena 5101
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
              Pentas Seni • Koleksi Digital Eksklusif • 2025
            </p>
          </div>
          <span className="badge badge-coral">PREMIUM</span>
        </div>
      </motion.div>

      {/* Collection Grid */}
      <motion.div variants={fadeUp} custom={2} style={{ marginBottom: 16 }}>
        <h2 className="title-lg" style={{ marginBottom: 20 }}>Koleksi Anda</h2>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {visibleCollections.map((item, i) => (
          <motion.div
            key={item.href}
            variants={fadeUp}
            custom={i + 3}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(item.href)}
          >
            <div className="card" style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px 24px',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                backgroundColor: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <item.icon size={24} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="title-sm" style={{ marginBottom: 2 }}>{item.label}</h3>
                <p className="body-sm" style={{ color: 'var(--muted)', fontSize: 13 }}>{item.desc}</p>
              </div>
              <ArrowRight size={18} color="var(--muted-soft)" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Appreciation Section */}
      <motion.div variants={fadeUp} custom={10} style={{ marginTop: 40 }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          <Sparkles size={28} color="var(--on-primary)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--on-primary)', letterSpacing: '-0.3px', marginBottom: 8 }}>
            Terima Kasih
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Terima kasih telah menjadi bagian dari Pentas Seni Drama Arena 5101.
            Koleksi ini adalah kenang-kenangan resmi untuk Anda simpan selamanya.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
