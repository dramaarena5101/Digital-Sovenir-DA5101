'use client';

import { useState, useEffect } from 'react';
import { getAudios, addAudio, deleteAudio } from '@/lib/firestore';
import { uploadAudioFile } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Trash2, X, Upload, Save } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';

const sampleTracks = [
  {
    title: "Tangguh (Theme Song)",
    artist: "Band 5101",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop",
    duration: 372
  },
  {
    title: "Semangat Membara",
    artist: "Drama Arena Orchestra",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop",
    duration: 425
  },
  {
    title: "Langkah Kemenangan",
    artist: "Vocal Group 5101",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f56468?q=80&w=200&auto=format&fit=crop",
    duration: 344
  },
  {
    title: "Memori Indah",
    artist: "Acoustic Session",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=200&auto=format&fit=crop",
    duration: 302
  }
];

export default function AdminAudioPage() {
  const { showToast, showDialog } = useDialog();
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', coverUrl: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  useEffect(() => { loadAudios(); }, []);
  const loadAudios = async () => { setLoading(true); try { setAudios(await getAudios()); } catch (e) { console.error(e); } setLoading(false); };

  const handleInjectSamples = async () => {
    setLoading(true);
    try {
      for (let i = 0; i < sampleTracks.length; i++) {
        await addAudio({ ...sampleTracks[i], order: i });
      }
      await loadAudios();
      showToast('Berhasil menambahkan 4 contoh audio!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal menambah contoh', 'error');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (!urlInput) return;
    
    setSaving(true);
    try {
      let audioUrl = urlInput.trim();
      
      // Auto-convert Google Drive viewing links to direct stream links
      if (audioUrl.includes('drive.google.com/file/d/')) {
        const match = audioUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          audioUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      }
      
      await addAudio({ ...form, audioUrl });
      setShowForm(false); setForm({ title: '', artist: '', coverUrl: '', order: audios.length }); setUrlInput('');
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
        <div style={{ display: 'flex', gap: 12 }}>
          {audios.length === 0 && (
            <button className="btn-secondary" onClick={handleInjectSamples} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}>
              Inject Contoh
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}><Plus size={14} /> Tambah Audio</button>
        </div>
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
                
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Link Cover / Logo Lagu (opsional)</label>
                  <input type="url" className="input" placeholder="Paste link gambar (opsional)..." value={form.coverUrl} onChange={(e) => setForm({...form, coverUrl: e.target.value})} />
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Link Audio (YouTube / Google Drive)</label>
                  <input 
                    type="url" 
                    className="input" 
                    placeholder="Paste link YouTube atau Google Drive..." 
                    value={urlInput} 
                    onChange={(e) => setUrlInput(e.target.value)} 
                    required
                  />
                  <p className="caption" style={{ color: 'var(--muted-soft)', marginTop: 4 }}>
                    Mendukung link video YouTube. Pemutar akan otomatis mengambil suaranya saja.
                  </p>
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
