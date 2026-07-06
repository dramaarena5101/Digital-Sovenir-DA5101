'use client';

import { useState, useEffect } from 'react';
import { getStats, getUsers, getActivationCodes, deleteUser } from '@/lib/firestore';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BarChart3, Users, Key, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentCodes, setRecentCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData, codesData] = await Promise.all([
        getStats(), getUsers(), getActivationCodes('used'),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRecentCodes(codesData.slice(0, 10));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

  const executeDeleteUser = async () => {
    const user = deleteModal.user;
    if (!user) return;
    
    try {
      await deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      setDeleteModal({ isOpen: false, user: null });
    } catch (e) {
      console.error(e);
      setAlertModal({ isOpen: true, title: 'Gagal', message: 'Gagal menghapus pengguna.' });
    }
  };

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <h1 className="display-sm" style={{ marginBottom: 4 }}>Statistik</h1>
        <p className="body-sm" style={{ color: 'var(--muted)' }}>Analisis dan data pengguna Digital Souvenir.</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          {stats && (
            <motion.div variants={fadeUp} custom={1} style={{ marginBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'var(--primary)' },
                  { label: 'Pengguna Aktif', value: stats.activatedUsers, icon: TrendingUp, color: 'var(--success)' },
                  { label: 'Kode Terpakai', value: stats.usedCodes, icon: Key, color: 'var(--accent-amber)' },
                  { label: 'Kode Tersedia', value: stats.unusedCodes, icon: Key, color: 'var(--accent-teal)' },
                  { label: 'Total Video', value: stats.totalVideos, icon: BarChart3, color: 'var(--primary)' },
                  { label: 'Total Foto', value: stats.totalPhotos, icon: BarChart3, color: 'var(--accent-teal)' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      backgroundColor: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <s.icon size={20} color={s.color} />
                    </div>
                    <div>
                      <div className="caption" style={{ color: 'var(--muted)' }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion rate */}
              {stats.totalUsers > 0 && (
                <div style={{
                  marginTop: 16, padding: '16px 24px',
                  backgroundColor: 'var(--surface-soft)', borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span className="title-sm">Tingkat Konversi Aktivasi</span>
                  <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {Math.round((stats.activatedUsers / stats.totalUsers) * 100)}%
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Activations */}
          <motion.div variants={fadeUp} custom={2} style={{ marginBottom: 32 }}>
            <h2 className="title-lg" style={{ marginBottom: 16 }}>Aktivasi Terbaru</h2>
            <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {recentCodes.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <p className="body-sm" style={{ color: 'var(--muted)' }}>Belum ada aktivasi.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid var(--hairline)', gap: 12 }}>
                    <span className="caption-uppercase" style={{ fontSize: 10 }}>Kode</span>
                    <span className="caption-uppercase" style={{ fontSize: 10 }}>User UID</span>
                    <span className="caption-uppercase" style={{ fontSize: 10 }}>Tanggal</span>
                  </div>
                  {recentCodes.map((code, i) => (
                    <div key={code.id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 20px',
                      borderBottom: i < recentCodes.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                      gap: 12,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{code.code}</span>
                      <span className="body-sm" style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{code.usedBy || '-'}</span>
                      <span className="body-sm" style={{ fontSize: 12, color: 'var(--muted-soft)' }}>{formatDateTime(code.usedDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* All Users */}
          <motion.div variants={fadeUp} custom={3}>
            <h2 className="title-lg" style={{ marginBottom: 16 }}>Daftar Pengguna</h2>
            <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr 40px', padding: '10px 20px', borderBottom: '1px solid var(--hairline)', gap: 12 }}>
                <span className="caption-uppercase" style={{ fontSize: 10 }}>Nama</span>
                <span className="caption-uppercase" style={{ fontSize: 10 }}>Email</span>
                <span className="caption-uppercase" style={{ fontSize: 10 }}>Status</span>
                <span className="caption-uppercase" style={{ fontSize: 10 }}>Bergabung</span>
                <span></span>
              </div>
              {users.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}><p className="body-sm" style={{ color: 'var(--muted)' }}>Belum ada pengguna.</p></div>
              ) : (
                users.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr 40px', padding: '10px 20px',
                    borderBottom: i < users.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                    gap: 12, alignItems: 'center',
                  }}>
                    <span className="body-sm" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{u.name || '-'}</span>
                    <span className="body-sm" style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                    <span className={`badge ${u.activated ? 'badge-success' : ''}`} style={{ fontSize: 10, width: 'fit-content' }}>
                      {u.activated ? 'Aktif' : 'Belum'}
                    </span>
                    <span className="body-sm" style={{ fontSize: 12, color: 'var(--muted-soft)' }}>{formatDateTime(u.createdAt)}</span>
                    <button 
                      onClick={() => setDeleteModal({ isOpen: true, user: u })}
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Pengguna"
        message={`Yakin ingin menghapus pengguna ${deleteModal.user?.name || deleteModal.user?.email}? Semua akses aktivasi untuk akun ini akan dicabut. Data tidak dapat dikembalikan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={executeDeleteUser}
        onCancel={() => setDeleteModal({ isOpen: false, user: null })}
      />

      <ConfirmModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="OK"
        hideCancel={true}
        onConfirm={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        onCancel={() => setAlertModal({ isOpen: false, title: '', message: '' })}
      />
    </motion.div>
  );
}
