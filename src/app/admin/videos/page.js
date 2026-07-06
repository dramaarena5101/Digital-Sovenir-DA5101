'use client';

import { useState, useEffect } from 'react';
import { getVideos, addVideo, updateVideo, deleteVideo } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plus, Edit, Trash2, X, Save, Search } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function AdminVideosPage() {
  const { settings } = useSettings();
  const videoCategories = settings?.videoCategories || [];
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    setLoading(true);
    try { setVideos(await getVideos()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openForm = (video = null) => {
    const defaultCat = videoCategories.length > 0 ? videoCategories[0].value : '';
    if (video) {
      setEditingVideo(video);
      setForm({ title: video.title, description: video.description || '', videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl || '', category: video.category || defaultCat, order: video.order || 0 });
    } else {
      setEditingVideo(null);
      setForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: defaultCat, order: videos.length });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) return;
    setSaving(true);
    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, form);
      } else {
        await addVideo(form);
      }
      setShowForm(false);
      await loadVideos();
    } catch (err) { console.error(err); alert('Gagal menyimpan.'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus video ini?')) return;
    try { await deleteVideo(id); await loadVideos(); } catch (e) { console.error(e); }
  };

  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    videoCategories.find(c => c.value === video.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="display-sm" style={{ marginBottom: 4 }}>Kelola Video</h1>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>Tambah metadata video (YouTube / Google Drive URL).</p>
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 400 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
            <input
              type="text"
              className="input"
              placeholder="Cari judul, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, height: 36, fontSize: 13 }}
            />
          </div>
          <button className="btn-primary" onClick={() => openForm()} style={{ fontSize: 13, height: 36, padding: '8px 14px', flexShrink: 0 }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* Video List */}
      <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}</div>
        ) : filteredVideos.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Video size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} />
            <p className="body-sm" style={{ color: 'var(--muted)' }}>
              {searchQuery ? 'Tidak ada video yang cocok dengan pencarian.' : 'Belum ada video. Klik "Tambah" untuk mulai.'}
            </p>
          </div>
        ) : (
          filteredVideos.map((video, i) => (
            <div key={video.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
              borderBottom: i < filteredVideos.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
            }}>
              <div style={{ width: 80, height: 45, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-dark)', flexShrink: 0, overflow: 'hidden' }}>
                {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="title-sm" style={{ marginBottom: 2 }}>{video.title}</div>
                <div className="caption" style={{ color: 'var(--muted-soft)' }}>
                  {videoCategories.find(c => c.value === video.category)?.label || video.category}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-icon" onClick={() => openForm(video)} style={{ width: 32, height: 32 }}><Edit size={14} /></button>
                <button className="btn-icon" onClick={() => handleDelete(video.id)} style={{ width: 32, height: 32, color: 'var(--error)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 className="title-lg">{editingVideo ? 'Edit Video' : 'Tambah Video'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                {[
                  { label: 'Judul', key: 'title', type: 'text', required: true, placeholder: 'cth: Opening Ceremony' },
                  { label: 'Video URL (YouTube/Drive)', key: 'videoUrl', type: 'url', required: true, placeholder: 'https://youtube.com/... atau https://drive.google.com/...' },
                  { label: 'Thumbnail URL (opsional)', key: 'thumbnailUrl', type: 'url', placeholder: 'URL thumbnail custom' },
                  { label: 'Deskripsi', key: 'description', type: 'textarea', placeholder: 'Deskripsi video...' },
                ].map((field) => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea className="input" style={{ height: 80, resize: 'vertical' }} placeholder={field.placeholder}
                        value={form[field.key]} onChange={(e) => setForm({...form, [field.key]: e.target.value})} />
                    ) : (
                      <input type={field.type} className="input" placeholder={field.placeholder} required={field.required}
                        value={form[field.key]} onChange={(e) => setForm({...form, [field.key]: e.target.value})} />
                    )}
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Kategori</label>
                    <select className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                      {videoCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Urutan</label>
                    <input type="number" className="input" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    <Save size={14} />{saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
