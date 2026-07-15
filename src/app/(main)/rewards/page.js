'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRewards } from '@/lib/firestore';
import { REWARD_TYPES, formatDate, getDirectImageUrl, getVideoEmbedUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Award, Star, Sparkles, Shield, Trophy, Eye, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function RewardsPage() {
  const { userData } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const data = await getRewards();
      setRewards(data.filter(r => r.active !== false));
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
    setLoading(false);
  };

  const getRewardIcon = (type) => {
    const rt = REWARD_TYPES.find(r => r.value === type);
    return rt?.icon || '🏅';
  };

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>REWARD DIGITAL</p>
        <h1 className="display-md" style={{ marginBottom: 8 }}>
          Reward <span style={{ color: 'var(--primary)' }}>Saya</span>
        </h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Badge kolektor, sertifikat digital, dan penghargaan eksklusif Anda.
        </p>
      </motion.div>

      {/* Collector Status Card */}
      <motion.div variants={fadeUp} custom={1} style={{ marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--surface-dark) 0%, var(--surface-dark-soft) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative */}
          <div style={{
            position: 'absolute', top: -50, right: -50,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(232,165,90,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-amber) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Trophy size={40} color="var(--on-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--on-dark)', letterSpacing: '-0.3px' }}>
                  Digital Collector
                </h2>
                <span className="badge badge-coral" style={{ fontSize: 10 }}>VERIFIED</span>
              </div>
              <p style={{ color: 'var(--on-dark-soft)', fontSize: 14 }}>
                {userData?.name || 'Collector'} • Diaktivasi {formatDate(userData?.activationDate)}
              </p>
              <p style={{ color: 'var(--on-dark-soft)', fontSize: 13, marginTop: 4 }}>
                Kode: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>{userData?.activationCode || 'DA-XXXX-XXXX'}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rewards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <>
          {/* Default rewards when none are added by admin */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { icon: '🏅', title: 'Digital Collector Badge', desc: 'Lencana kolektor resmi Pentas Seni Drama Arena 5101.', color: 'var(--primary)' },
              { icon: '📜', title: 'Digital Appreciation Certificate', desc: 'Sertifikat digital sebagai pendukung dan pembeli resmi.', color: 'var(--accent-teal)' },
              { icon: '🎖', title: 'Early Supporter Badge', desc: 'Badge khusus bagi pembeli gelombang awal.', color: 'var(--accent-amber)' },
            ].map((reward, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2}>
                <div className="card" style={{ height: '100%', textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{reward.icon}</div>
                  <h3 className="title-md" style={{ marginBottom: 8 }}>{reward.title}</h3>
                  <p className="body-sm" style={{ color: 'var(--muted)' }}>{reward.desc}</p>
                  <div style={{ marginTop: 16 }}>
                    <span className="badge badge-success" style={{ fontSize: 12 }}>
                      <Sparkles size={12} /> Dimiliki
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {rewards.map((reward, i) => (
            <motion.div key={reward.id} variants={fadeUp} custom={i + 2}>
              <div className="card" style={{ height: '100%', textAlign: 'center', padding: 'var(--space-xl)' }}>
                {reward.badgeImageUrl ? (
                  <img src={getDirectImageUrl(reward.badgeImageUrl)} alt={reward.title} 
                       style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 16px' }} 
                       onError={(e) => { e.target.style.display = 'none'; if (e.target.parentElement) { e.target.parentElement.innerHTML = '<span style="color:red;font-size:12px">Image Error</span>'; } }}
                  />
                ) : (
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{getRewardIcon(reward.type)}</div>
                )}
                <h3 className="title-md" style={{ marginBottom: 8 }}>{reward.title}</h3>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>{reward.description}</p>
                
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <span className="badge badge-success" style={{ fontSize: 12 }}>
                    <Sparkles size={12} /> Dimiliki
                  </span>
                  {reward.badgeImageUrl && (
                    <button 
                      onClick={() => setPreviewUrl(reward.badgeImageUrl)}
                      className="btn-secondary" 
                      style={{ fontSize: 11, padding: '4px 10px', height: 26 }}
                    >
                      <Eye size={12} style={{ marginRight: 4 }} /> Lihat Detail
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Appreciation Section */}
      <motion.div variants={fadeUp} custom={6} style={{ marginTop: 40 }}>
        <div style={{
          backgroundColor: 'var(--surface-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          <Star size={28} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 className="display-sm" style={{ marginBottom: 8 }}>Terima Kasih, {(userData?.name || 'Collector').split(' ')[0]}!</h3>
          <p className="body-md" style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto' }}>
            Terima kasih telah mendukung Pentas Seni Drama Arena 5101.
            Koleksi dan reward ini adalah bentuk apresiasi kami untuk Anda.
          </p>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setPreviewUrl(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 800, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--hairline)' }}>
                <h3 className="title-md">Preview Reward</h3>
                <button onClick={() => setPreviewUrl(null)} className="btn-icon"><X size={20} /></button>
              </div>
              
              <div style={{ width: '100%', height: '75vh', backgroundColor: '#f0f0f0' }}>
                <iframe 
                  src={getVideoEmbedUrl(previewUrl)} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                  allow="autoplay"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
