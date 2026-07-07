'use client';

import { useState, useEffect } from 'react';
import { getRewards, addReward, updateReward, deleteReward } from '@/lib/firestore';
import { uploadBadge } from '@/lib/storage';
import { REWARD_TYPES } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Edit, Trash2, X, Save, Upload } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';

export default function AdminRewardsPage() {
  const { showToast, showDialog } = useDialog();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'collector', active: true });
  const [badgeFile, setBadgeFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRewards(); }, []);
  const loadRewards = async () => { setLoading(true); try { setRewards(await getRewards()); } catch (e) { console.error(e); } setLoading(false); };

  const openForm = (reward = null) => {
    if (reward) { setEditingReward(reward); setForm({ title: reward.title, description: reward.description || '', type: reward.type || 'collector', active: reward.active !== false }); }
    else { setEditingReward(null); setForm({ title: '', description: '', type: 'collector', active: true }); }
    setBadgeFile(null); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      let badgeImageUrl = editingReward?.badgeImageUrl || '';
      if (badgeFile) { badgeImageUrl = await uploadBadge(badgeFile); }
      const data = { ...form, badgeImageUrl };
      if (editingReward) { await updateReward(editingReward.id, data); }
      else { await addReward(data); }
      setShowForm(false); await loadRewards();
      showToast('Reward berhasil disimpan', 'success');
    } catch (err) { console.error(err); showToast('Gagal menyimpan reward', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    showDialog({
      title: 'Hapus Reward',
      message: 'Apakah Anda yakin ingin menghapus reward ini?',
      isDanger: true,
      onConfirm: async () => {
        try { await deleteReward(id); await loadRewards(); showToast('Reward dihapus', 'success'); } catch (e) { console.error(e); showToast('Gagal menghapus reward', 'error'); }
      }
    });
  };

  const getRewardIcon = (type) => REWARD_TYPES.find(r => r.value === type)?.icon || '🏅';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 className="display-sm" style={{ marginBottom: 4 }}>Kelola Reward</h1><p className="body-sm" style={{ color: 'var(--muted)' }}>Buat dan kelola badge dan sertifikat digital.</p></div>
        <button className="btn-primary" onClick={() => openForm()} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}><Plus size={14} /> Tambah Reward</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)
        ) : rewards.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}><Award size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} /><p className="body-sm" style={{ color: 'var(--muted)' }}>Belum ada reward. Reward default akan ditampilkan ke user.</p></div>
        ) : (
          rewards.map((reward) => (
            <div key={reward.id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
              {reward.badgeImageUrl ? (
                <img src={reward.badgeImageUrl} alt={reward.title} style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 12px' }} />
              ) : (
                <div style={{ fontSize: 48, marginBottom: 12 }}>{getRewardIcon(reward.type)}</div>
              )}
              <h3 className="title-sm" style={{ marginBottom: 4 }}>{reward.title}</h3>
              <p className="body-sm" style={{ color: 'var(--muted)', fontSize: 13 }}>{reward.description}</p>
              <div style={{ marginTop: 12 }}>
                <span className={`badge ${reward.active ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                  {reward.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                <button className="btn-icon" onClick={() => openForm(reward)} style={{ width: 28, height: 28 }}><Edit size={12} /></button>
                <button className="btn-icon" onClick={() => handleDelete(reward.id)} style={{ width: 28, height: 28, color: 'var(--error)' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => !saving && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 440 }}>
              <h3 className="title-lg" style={{ marginBottom: 20 }}>{editingReward ? 'Edit Reward' : 'Tambah Reward'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Judul</label>
                  <input type="text" className="input" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="cth: Digital Collector Badge" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tipe</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    {REWARD_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Deskripsi</label>
                  <textarea className="input" style={{ height: 80, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Deskripsi reward..." />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Badge Image (opsional)</label>
                  <div style={{ border: '2px dashed var(--hairline)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => document.getElementById('badge-input').click()}>
                    <Upload size={20} color="var(--muted-soft)" style={{ margin: '0 auto 6px' }} />
                    <p className="body-sm" style={{ color: 'var(--muted)', fontSize: 12 }}>{badgeFile ? badgeFile.name : 'Upload gambar badge'}</p>
                  </div>
                  <input id="badge-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setBadgeFile(e.target.files[0])} />
                </div>
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} />
                  <label htmlFor="active" className="body-sm" style={{ fontWeight: 500 }}>Aktif (tampilkan ke user)</label>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}><Save size={14} />{saving ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
