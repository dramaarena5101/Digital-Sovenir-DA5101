'use client';

import { useState, useEffect } from 'react';
import { getAudios, addAudio, deleteAudio } from '@/lib/firestore';
import { uploadAudioFile } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Trash2, X, Upload, Save } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';

export default function AdminAudioPage() {
  const { showToast, showDialog } = useDialog();
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  useEffect(() => { loadAudios(); }, []);
  const loadAudios = async () => { setLoading(true); try { setAudios(await getAudios()); } catch (e) { console.error(e); } setLoading(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (!urlInput) return;
    
    setSaving(true);
    try {
      const audioUrl = urlInput.trim();
      
      await addAudio({ ...form, audioUrl });
      setShowForm(false); setForm({ title: '', artist: '', order: audios.length }); setUrlInput('');
      await loadAudios();
      showToast('Audio berhasil disimpan', 'success');
    } catch (err) { console.error(err); showToast('Gagal menyimpan', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    showDialog({
      title: 'Hapus Audio',
      message: 'Apakah Anda yakin ingin menghapus audio ini?',
      isDanger: true,
      onConfirm: async () => {
        try { await deleteAudio(id); await loadAudios(); showToast('Audio dihapus', 'success'); } catch (e) { console.error(e); showToast('Gagal menghapus', 'error'); }
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 className="display-sm" style={{ marginBottom: 4 }}>Kelola Audio</h1><p className="body-sm" style={{ color: 'var(--muted)' }}>Upload soundtrack dan audio acara.</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}><Plus size={14} /> Tambah Audio</button>
      </div>

      <div className="table-scroll-container" style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ minWidth: 600 }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}</div>
        ) : audios.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}><Music size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} /><p className="body-sm" style={{ color: 'var(--muted)' }}>Belum ada audio.</p></div>
        ) : (
          audios.map((audio, i) => (
            <div key={audio.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < audios.length - 1 ? '1px solid var(--hairline-soft)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={18} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}><div className="title-sm">{audio.title}</div>{audio.artist && <div className="caption" style={{ color: 'var(--muted-soft)' }}>{audio.artist}</div>}</div>
              <button className="btn-icon" onClick={() => handleDelete(audio.id)} style={{ width: 32, height: 32, color: 'var(--error)' }}><Trash2 size={14} /></button>
            </div>
          ))
        )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => !saving && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 440 }}>
              <h3 className="title-lg" style={{ marginBottom: 20 }}>Tambah Audio</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Judul</label>
                  <input type="text" className="input" placeholder="cth: Opening Theme" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Artis/Sumber (opsional)</label>
                  <input type="text" className="input" placeholder="cth: Drama Arena Orchestra" value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Urutan</label>
                  <input type="number" className="input" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} />
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Link Google Drive atau URL</label>
                  <input 
                    type="url" 
                    className="input" 
                    placeholder="Paste link Google Drive atau URL audio..." 
                    value={urlInput} 
                    onChange={(e) => setUrlInput(e.target.value)} 
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={saving || !urlInput} style={{ flex: 1, justifyContent: 'center' }}><Save size={14} />{saving ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
