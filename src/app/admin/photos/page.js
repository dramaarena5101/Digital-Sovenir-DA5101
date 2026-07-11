'use client';

import { useState, useEffect } from 'react';
import { getPhotos, addPhoto, deletePhoto } from '@/lib/firestore';
import { uploadImage } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Plus, Trash2, X, Upload, Save, Search, AlertTriangle, Folder } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useDialog } from '@/contexts/DialogContext';

export default function AdminPhotosPage() {
  const { settings } = useSettings();
  const { showToast, showDialog } = useDialog();
  const photoCategories = settings?.photoCategories || [];
  const allCategories = [{ value: 'all', label: 'Semua' }, ...photoCategories];

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Set default category when form opens
  useEffect(() => {
    if (showForm && !category && photoCategories.length > 0) {
      setCategory(photoCategories[0].value);
    }
  }, [showForm, photoCategories]);

  useEffect(() => { loadPhotos(); }, [activeFilter]);

  const loadPhotos = async () => {
    setLoading(true);
    try { setPhotos(await getPhotos(activeFilter)); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u);
      if (urls.length === 0) { setUploading(false); return; }
        
        let totalFilesToProcess = urls.length;
        let processedCount = 0;

        for (let i = 0; i < urls.length; i++) {
          let imageUrl = urls[i];
          const folderMatch = imageUrl.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/);
          
          if (folderMatch) {
            // It's a folder link. Instead of fetching all photos, we just save the folder reference!
            processedCount++;
            setUploadProgress(Math.min(100, Math.round((processedCount / totalFilesToProcess) * 100)));
            const folderId = folderMatch[1];
            await addPhoto({ title: `Folder Drive ${folderId.substring(0,6)}...`, type: 'folder', folderId, category });
          } else {
            // Regular link
            processedCount++;
            setUploadProgress(Math.min(100, Math.round((processedCount / totalFilesToProcess) * 100)));
            const driveMatch = imageUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (driveMatch) {
              imageUrl = `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
            }
            await addPhoto({ title: `Foto_${Date.now()}_${i}`, type: 'image', imageUrl, category });
          }
        }
        setShowForm(false); setUrlInput('');
        await loadPhotos();
        showToast('Foto berhasil diproses', 'success');
    } catch (err) { console.error(err); showToast('Gagal memproses foto', 'error'); }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (id) => {
    showDialog({
      title: 'Hapus Foto',
      message: 'Apakah Anda yakin ingin menghapus foto ini?',
      isDanger: true,
      onConfirm: async () => {
        try { await deletePhoto(id); await loadPhotos(); showToast('Foto dihapus', 'success'); } catch (e) { console.error(e); showToast('Gagal menghapus', 'error'); }
      }
    });
  };

  const handleDeleteAll = async () => {
    showDialog({
      title: 'Hapus Semua Foto',
      message: 'AWAS! Anda yakin ingin menghapus SEMUA FOTO yang sedang tampil ini? Tindakan ini tidak bisa dibatalkan.',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          for (const photo of filteredPhotos) {
            await deletePhoto(photo.id);
          }
          await loadPhotos();
          showToast('Semua foto berhasil dihapus', 'success');
        } catch(e) {
          console.error(e);
          showToast('Gagal menghapus beberapa foto', 'error');
        }
        setLoading(false);
      }
    });
  };

  const filteredPhotos = photos.filter(photo => 
    photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    photo.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photoCategories.find(c => c.value === photo.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="display-sm" style={{ marginBottom: 4 }}>Kelola Foto</h1>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>Upload dan kelola galeri foto acara.</p>
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
          {filteredPhotos.length > 0 && (
            <button className="btn-secondary" onClick={handleDeleteAll} style={{ fontSize: 13, height: 36, padding: '8px 14px', flexShrink: 0, color: 'var(--error)', borderColor: 'color-mix(in srgb, var(--error) 20%, transparent)' }}>
              Hapus Semua
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: 13, height: 36, padding: '8px 14px', flexShrink: 0 }}>
            <Plus size={14} /> Upload Foto
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {allCategories.map(cat => (
          <button key={cat.value} className={`tab ${activeFilter === cat.value ? 'tab-active' : ''}`}
            onClick={() => setActiveFilter(cat.value)} style={{ fontSize: 12 }}>{cat.label}</button>
        ))}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <ImageIcon size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} />
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            {searchQuery ? 'Tidak ada foto yang cocok dengan pencarian.' : 'Belum ada foto.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {filteredPhotos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', paddingTop: '100%', backgroundColor: 'var(--surface-card)' }}>
              {photo.type === 'folder' ? (
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', flexDirection: 'column' }}>
                   <Folder size={48} color="#64748b" />
                   <span style={{ fontSize: 12, marginTop: 8, color: '#475569', fontWeight: 500 }}>Folder Drive</span>
                 </div>
              ) : (
                 <img src={photo.imageUrl} alt={photo.title || ''} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button onClick={() => handleDelete(photo.id)} style={{
                position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%',
                backgroundColor: 'rgba(198,69,69,0.9)', border: 'none', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Trash2 size={14} /></button>
              <span className="badge" style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}>
                {photoCategories.find(c => c.value === photo.category)?.label || photo.category}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => !uploading && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 460 }}>
              <h3 className="title-lg" style={{ marginBottom: 20 }}>Tambah Foto</h3>
              <form onSubmit={handleUpload}>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Kategori</label>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {photoCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Paste Link Google Drive (Bisa lebih dari 1, pisahkan dengan Enter)</label>
                  <textarea className="input" style={{ height: 120, resize: 'vertical' }} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://drive.google.com/file/d/abc...&#10;https://drive.google.com/file/d/xyz..." required />
                  <p className="caption" style={{ color: 'var(--muted)', marginTop: 6 }}>* Web akan otomatis mengekstrak foto dari link Google Drive yang Anda masukkan.</p>
                </div>

                {uploading && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 6, backgroundColor: 'var(--hairline)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s' }} />
                    </div>
                    <p className="caption" style={{ marginTop: 4, textAlign: 'center' }}>Menyimpan... {uploadProgress}%</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={uploading || !urlInput.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                    {uploading ? 'Memproses...' : `Simpan Foto`}
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
