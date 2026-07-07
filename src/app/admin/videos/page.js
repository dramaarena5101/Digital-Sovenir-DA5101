'use client';

import { useState, useEffect } from 'react';
import { getVideos, addVideo, updateVideo, deleteVideo } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plus, Edit, Trash2, X, Save, Search } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useDialog } from '@/contexts/DialogContext';

export default function AdminVideosPage() {
  const { settings } = useSettings();
  const { showToast } = useDialog();
  const videoCategories = settings?.videoCategories || [];
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkMode, setBulkMode] = useState('append');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', isDanger: false, onConfirm: null });

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
      setForm({ title: video.title, description: video.description || '', videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl || '', category: Array.isArray(video.category) ? video.category.join(', ') : (video.category || ''), order: video.order || 0 });
    } else {
      setEditingVideo(null);
      setForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: '', order: videos.length });
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
      showToast('Video berhasil disimpan', 'success');
    } catch (err) { console.error(err); showToast('Gagal menyimpan video', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Video',
      message: 'Apakah Anda yakin ingin menghapus video ini?',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try { await deleteVideo(id); await loadVideos(); } catch (e) { console.error(e); }
      }
    });
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredVideos.map(v => v.id));
    else setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Video Massal',
      message: `Hapus ${selectedIds.length} video terpilih secara permanen?`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        setSaving(true);
        try {
          for (const id of selectedIds) await deleteVideo(id);
          await loadVideos();
          setSelectedIds([]);
          showToast(`${selectedIds.length} video berhasil dihapus`, 'success');
        } catch(e) { console.error(e); showToast('Gagal menghapus video', 'error'); }
        setSaving(false);
      }
    });
  };

  const handleBulkEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const id of selectedIds) {
        const vid = videos.find(v => v.id === id);
        if (vid) {
          let newCategory = bulkCategory;
          if (bulkMode === 'append') {
             let currentCats = vid.category || '';
             if (Array.isArray(currentCats)) currentCats = currentCats.join(', ');
             newCategory = currentCats ? currentCats + ', ' + bulkCategory : bulkCategory;
          }
          await updateVideo(id, { ...vid, category: newCategory });
        }
      }
      await loadVideos();
      setSelectedIds([]);
      setShowBulkForm(false);
      setBulkCategory('');
      showToast('Kategori berhasil diperbarui', 'success');
    } catch(e) { console.error(e); showToast('Gagal mengubah kategori', 'error'); }
    setSaving(false);
  };

  const injectRundown = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Inject Rundown',
      message: 'Tambahkan 40 video rundown otomatis ke database?',
      isDanger: false,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        setSaving(true);
    const rundown = [
      { no: 1,  item: 'Visual "Semangat Al-Akhku"',                   type: "visual" },
      { no: 2,  item: "Senandung Sholawat",                            type: "music" },
      { no: 3,  item: 'Visual "Bayangkan jika kita tidak menyerah"',  type: "visual" },
      { no: 4,  item: 'Band 5101: "Lomba Sihir!"',                    type: "music" },
      { no: 5,  item: "Visual Sapa MC",                               type: "visual" },
      { no: 6,  item: "Master of Ceremony",                           type: "language" },
      { no: 7,  item: "Tilawah Ayat Suci Al-Qur'an",                  type: "music" },
      { no: 8,  item: "Sambutan Ketua",                               type: "language" },
      { no: 9,  item: "Sambutan Bapak Pimpinan",                      type: "language" },
      { no: 10, item: "Udal Adul Well",                               type: "dance" },
      { no: 11, item: "SKA N DUT",                                    type: "dance" },
      { no: 12, item: "Visual POV 3 = Mudabbir",                      type: "visual" },
      { no: 13, item: "Drama POV 3 = Mudabbir",                       type: "theater" },
      { no: 14, item: 'Puisi "Antara Uswah dan Amanah"',              type: "theater" },
      { no: 15, item: 'Visual "Langkah Abadi"',                       type: "visual" },
      { no: 16, item: 'Band 5101: "Tangguh"',                         type: "music" },
      { no: 17, item: "Iklan Temukan Makna Bersama",                  type: "visual" },
      { no: 18, item: "Tari Ratoeh Jaroe",                            type: "dance" },
      { no: 19, item: 'Visual "Jati Diri Surgawi"',                   type: "visual" },
      { no: 20, item: 'Grand Opening: "OST DA 5101"',                 type: "music" },
      { no: 21, item: "Visual POV 1 = Bintang",                       type: "visual" },
      { no: 22, item: "Drama POV 1 = Bintang",                        type: "theater" },
      { no: 23, item: "Choir 5101",                                   type: "music" },
      { no: 24, item: 'Nasyid 5101: "Syukur Alhamdulillah"',         type: "music" },
      { no: 25, item: "Visual POV 2 = Azka",                          type: "visual" },
      { no: 26, item: "Drama POV 2 = Azka",                           type: "theater" },
      { no: 27, item: "Ya Maulay Ya Maulay",                          type: "dance" },
      { no: 28, item: "Black Mask Rhythm",                            type: "dance" },
      { no: 29, item: "Infinity Beatbox",                             type: "dance" },
      { no: 30, item: "Le Le Re Dance",                               type: "dance" },
      { no: 31, item: "Visual POV 4 = Atlan",                         type: "visual" },
      { no: 32, item: 'Band 5101: "Medley Tongkrongan"',             type: "music" },
      { no: 33, item: "Drama POV 4 = Atlan",                          type: "theater" },
      { no: 34, item: "Raqs Arabian",                                 type: "dance" },
      { no: 35, item: "Art of Balance",                               type: "dance" },
      { no: 36, item: "Hikaru Toki DA",                               type: "dance" },
      { no: 37, item: "Tong Basudara",                                type: "dance" },
      { no: 38, item: "Visual POV 5 = Pijar",                         type: "visual" },
      { no: 39, item: "Drama POV 5 = Pijar",                          type: "theater" },
      { no: 40, item: 'Grand Closing: "Api Perjuangan"',              type: "music" },
    ];
    try {
      const youtubeLinks = [
        "https://youtu.be/OQr2Ep3DCD8", "https://youtu.be/nI7g_DW3dw0", "https://youtu.be/8Sc0cTcEgkA",
        "https://youtu.be/DmuPr8dcuKE", "https://youtu.be/wX7DudR8pU0", "https://youtu.be/0OhIpxWNvI4",
        "https://youtu.be/ouhr0TeX5qs", "https://youtu.be/YaZuAkIvGV8", "https://youtu.be/2yj3DnuO3nk",
        "https://youtu.be/e3VNgnZh1rM", "https://youtu.be/XfhSbMex-vc", "https://youtu.be/bL1QrY7y47g"
      ];
      let linkIndex = 0;

      for (const r of rundown) {
        await addVideo({
          title: r.item,
          videoUrl: youtubeLinks[linkIndex % youtubeLinks.length],
          thumbnailUrl: '',
          description: `Penampilan No. ${r.no} - ${r.item}`,
          category: r.type,
          order: r.no
        });
        linkIndex++;
      }
      await loadVideos();
      showToast('Berhasil inject 40 rundown videos!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal inject videos.', 'error');
    }
    setSaving(false);
      }
    });
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
          <button className="btn-secondary" onClick={injectRundown} disabled={saving} style={{ fontSize: 13, height: 36, padding: '8px 14px', flexShrink: 0 }}>
            Inject Rundown
          </button>
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
          <>
            {selectedIds.length > 0 && (
              <div style={{ padding: '12px 20px', backgroundColor: 'var(--surface-dark)', borderBottom: '1px solid var(--hairline-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" checked={selectedIds.length === filteredVideos.length} onChange={handleSelectAll} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedIds.length} video terpilih</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setBulkMode('append'); setShowBulkForm(true); }} className="btn-secondary" style={{ padding: '6px 12px', height: 32, fontSize: 12 }}>+ Kategori</button>
                  <button onClick={() => { setBulkMode('overwrite'); setShowBulkForm(true); }} className="btn-secondary" style={{ padding: '6px 12px', height: 32, fontSize: 12 }}>Edit Kategori</button>
                  <button onClick={handleBulkDelete} disabled={saving} className="btn-primary" style={{ padding: '6px 12px', height: 32, fontSize: 12, backgroundColor: 'var(--error)' }}>Hapus</button>
                </div>
              </div>
            )}
            {filteredVideos.map((video, i) => (
              <div key={video.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                borderBottom: i < filteredVideos.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                backgroundColor: selectedIds.includes(video.id) ? 'rgba(255,107,0,0.05)' : 'transparent'
              }}>
                <input type="checkbox" checked={selectedIds.includes(video.id)} onChange={() => handleSelectRow(video.id)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
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
            ))}
          </>
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
                    <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                      Kategori <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 400 }}>(Pisahkan dgn koma)</span>
                    </label>
                    <input type="text" className="input" placeholder="cth: music, babak 1" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
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

      {/* Bulk Form Modal */}
      <AnimatePresence>
        {showBulkForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowBulkForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 className="title-lg">{bulkMode === 'append' ? 'Tambah Kategori' : 'Edit Kategori'} ({selectedIds.length} video)</h3>
                <button onClick={() => setShowBulkForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleBulkEditSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Kategori Baru <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 400 }}>{bulkMode === 'append' ? '(Ditambahkan ke yang sudah ada)' : '(Timpa kategori lama)'}</span>
                  </label>
                  <input type="text" className="input" placeholder="cth: music, favorit" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowBulkForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    <Save size={14} />{saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 400, textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className="title-lg">{confirmDialog.title}</h3>
                <p className="body-md" style={{ color: 'var(--muted)', marginTop: 8 }}>{confirmDialog.message}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="button" className="btn-primary" onClick={confirmDialog.onConfirm} disabled={saving} style={{ flex: 1, justifyContent: 'center', backgroundColor: confirmDialog.isDanger ? 'var(--error)' : 'var(--primary)' }}>
                  {saving ? 'Memproses...' : (confirmDialog.isDanger ? 'Ya, Hapus' : 'Ya, Lanjutkan')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
