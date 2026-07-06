'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { deleteUser } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Key, Shield, LogOut, CheckCircle, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteCodeInput, setDeleteCodeInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!deleteCodeInput) {
      setDeleteError('Masukkan kode aktivasi Anda untuk melanjutkan.');
      return;
    }
    
    if (deleteCodeInput.toUpperCase() !== userData?.activationCode?.toUpperCase()) {
      setDeleteError('Kode aktivasi salah. Penghapusan dibatalkan.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteUser(user.uid);
      await signOut();
      router.push('/');
    } catch (error) {
      console.error(error);
      setDeleteError('Gagal menghapus akun. Silakan coba lagi.');
      setIsDeleting(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" style={{ maxWidth: 600 }}>
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>PROFIL</p>
        <h1 className="display-md">
          Profil <span style={{ color: 'var(--primary)' }}>Saya</span>
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={fadeUp} custom={1} style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--on-primary)',
              fontSize: 28, fontWeight: 600,
              fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}>
              {userData?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="title-lg" style={{ marginBottom: 4 }}>
                {userData?.name || user?.displayName || 'User'}
              </h2>
              <div className="badge badge-success" style={{ fontSize: 12 }}>
                <CheckCircle size={12} /> Digital Collector Aktif
              </div>
            </div>
          </div>

          {/* Info list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: User, label: 'Nama', value: userData?.name || user?.displayName || '-' },
              { icon: Key, label: 'Kode Aktivasi', value: userData?.activationCode || '-', mono: true },
              { icon: Calendar, label: 'Tanggal Aktivasi', value: formatDate(userData?.activationDate) },
              { icon: Shield, label: 'Status', value: userData?.activated ? 'Aktif' : 'Belum Aktif' },
              { icon: Calendar, label: 'Bergabung', value: formatDate(userData?.createdAt) },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 0',
                borderBottom: i < 5 ? '1px solid var(--hairline-soft)' : 'none',
              }}>
                <item.icon size={18} color="var(--muted-soft)" />
                <div style={{ flex: 1 }}>
                  <div className="caption" style={{ color: 'var(--muted-soft)', marginBottom: 2 }}>{item.label}</div>
                  <div className="body-sm" style={{
                    color: 'var(--ink)', fontWeight: 500,
                    fontFamily: item.mono ? 'var(--font-mono)' : 'var(--font-body)',
                  }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={18} />
          Keluar dari Akun
        </button>
        <button
          onClick={() => { setDeleteError(''); setDeleteCodeInput(''); setDeleteModal(true); }}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', borderColor: 'var(--error)' }}
        >
          <Trash2 size={18} />
          Hapus Akun Saya
        </button>
      </motion.div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Hapus Akun Permanen"
        message="Perhatian! Menghapus akun akan mencabut seluruh akses Anda ke Digital Souvenir. Data tidak dapat dikembalikan. Untuk melanjutkan, silakan ketik ulang kode aktivasi Anda di bawah ini:"
        confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
        cancelText="Batal"
        onConfirm={handleDeleteAccount}
        onCancel={() => { if (!isDeleting) setDeleteModal(false); }}
      >
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            className="input"
            placeholder="Contoh: DA-ABCD-1234"
            value={deleteCodeInput}
            onChange={(e) => {
              setDeleteCodeInput(e.target.value.toUpperCase());
              setDeleteError('');
            }}
            style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            disabled={isDeleting}
          />
          {deleteError && (
            <p className="caption" style={{ color: 'var(--error)', marginTop: 8 }}>
              {deleteError}
            </p>
          )}
        </div>
      </ConfirmModal>
    </motion.div>
  );
}
