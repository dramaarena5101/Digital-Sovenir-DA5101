'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/firestore';
import { motion } from 'framer-motion';
import { Users, Key, Video, Camera, Music, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const statCards = stats ? [
    { icon: Users, label: 'Total Pengguna', value: stats.totalUsers, color: 'var(--primary)' },
    { icon: CheckCircle, label: 'Pengguna Aktif', value: stats.activatedUsers, color: 'var(--success)' },
    { icon: Key, label: 'Kode Terpakai', value: `${stats.usedCodes}/${stats.totalCodes}`, color: 'var(--accent-amber)' },
    { icon: XCircle, label: 'Kode Tersedia', value: stats.unusedCodes, color: 'var(--accent-teal)' },
    { icon: Video, label: 'Total Video', value: stats.totalVideos, color: 'var(--primary)' },
    { icon: Camera, label: 'Total Foto', value: stats.totalPhotos, color: 'var(--accent-teal)' },
    { icon: Music, label: 'Total Audio', value: stats.totalAudios, color: 'var(--accent-amber)' },
    { icon: TrendingUp, label: 'Konversi', value: stats.totalUsers > 0 ? `${Math.round((stats.activatedUsers / stats.totalUsers) * 100)}%` : '0%', color: 'var(--success)' },
  ] : [];

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <h1 className="display-sm" style={{ marginBottom: 8 }}>Dashboard Admin</h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Kelola konten dan pantau statistik Digital Souvenir.
        </p>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {statCards.map((stat, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1}>
              <div className="card" style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
                <div>
                  <div className="caption" style={{ color: 'var(--muted)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp} custom={10} style={{ marginTop: 32 }}>
        <h2 className="title-lg" style={{ marginBottom: 16 }}>Aksi Cepat</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Generate Kode', href: '/admin/codes' },
            { label: 'Upload Video', href: '/admin/videos' },
            { label: 'Upload Foto', href: '/admin/photos' },
            { label: 'Upload Audio', href: '/admin/audio' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
