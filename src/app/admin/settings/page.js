'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Image as ImageIcon, Layout, Loader2, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { getDirectImageUrl } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const THEMES = [
  { id: 'default', name: 'Default Modern', desc: 'Tema bersih dan serbaguna' },
  { id: 'guidebook', name: 'Digital Guide Book', desc: 'Layout navigasi buku saku' },
  { id: 'claude', name: 'Editorial (Claude)', desc: 'Hangat, cream, font serif elegan' },
  { id: 'spotify', name: 'Dark Mode (Spotify)', desc: 'Gelap, rounded pill, fokus konten' },
  { id: 'pinterest', name: 'Masonry Grid (Pinterest)', desc: 'Layout grid foto rapat, CTA merah' },
  { id: 'luxury', name: 'Luxury Elegant', desc: 'Elegan, gelap dengan aksen emas/tembaga' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    theme: 'default',
    logoUrl: '',
    faviconUrl: '',
    heroImageUrl: '',
    googleDriveApiKey: '',
    videoCategories: [],
    photoCategories: [],
    showVideo: true,
    showGallery: true,
    showComic: true,
    showSoundtrack: true,
    showBonus: true,
    showRewards: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        theme: settings.theme || 'default',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        heroImageUrl: settings.heroImageUrl || '',
        googleDriveApiKey: settings.googleDriveApiKey || '',
        videoCategories: settings.videoCategories || [{ value: 'opening', label: 'Opening' }, { value: 'dance', label: 'Dance' }, { value: 'band', label: 'Band' }],
        photoCategories: settings.photoCategories || [{ value: 'backstage', label: 'Backstage' }, { value: 'performance', label: 'Penampilan' }],
        showVideo: settings.showVideo !== false,
        showGallery: settings.showGallery !== false,
        showComic: settings.showComic !== false,
        showSoundtrack: settings.showSoundtrack !== false,
        showBonus: settings.showBonus !== false,
        showRewards: settings.showRewards !== false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), formData, { merge: true });
      showToast('Pengaturan berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Gagal menyimpan: ' + error.message, 'error');
    }
    setSaving(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <h1 className="display-sm" style={{ marginBottom: 8 }}>Pengaturan Theme & Branding</h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Kustomisasi tampilan website, layout, dan identitas visual acara.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 800 }}>
        {/* THEME SELECTION */}
        <motion.div variants={fadeUp} custom={1} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Layout color="var(--primary)" />
            <h2 className="title-lg">Pilih Tema & Layout</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {THEMES.map((theme) => (
              <div 
                key={theme.id}
                onClick={() => setFormData({ ...formData, theme: theme.id })}
                style={{
                  border: formData.theme === theme.id ? '2px solid var(--primary)' : '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                  cursor: 'pointer',
                  backgroundColor: formData.theme === theme.id ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'var(--canvas)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{theme.name}</div>
                <div className="body-sm" style={{ color: 'var(--muted)' }}>{theme.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BRANDING */}
        <motion.div variants={fadeUp} custom={2} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <ImageIcon color="var(--primary)" />
            <h2 className="title-lg">Branding Gambar (URL Bebas)</h2>
          </div>
          
          <div className="body-sm" style={{ backgroundColor: 'var(--surface-soft)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
            Karena Firebase Storage tidak digunakan, Anda bisa menyalin dan menempel (paste) <strong>URL Gambar/Foto</strong> langsung dari internet (misal dari Google Photos, Imgur, Postimages.org, dll).
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Logo */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 8 }}>Logo Kustom URL (opsional)</label>
              <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 12 }}>URL ke file logo (disarankan PNG transparan). Biarkan kosong untuk menggunakan teks logo bawaan.</div>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 14, color: 'var(--muted-soft)' }}><LinkIcon size={18} /></div>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="input" 
                  style={{ paddingLeft: 40 }} 
                />
              </div>
              
              {formData.logoUrl && (
                <div style={{ marginTop: 12, padding: 12, border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)', display: 'inline-block', backgroundColor: 'var(--surface-dark)' }}>
                  <img src={getDirectImageUrl(formData.logoUrl)} alt="Preview Logo" style={{ height: 40, objectFit: 'contain' }} 
                       onError={(e) => { e.target.style.display = 'none'; if (e.target.parentElement) { e.target.parentElement.innerHTML = '<span style="color:red;font-size:12px">URL Gambar tidak valid</span>'; } }} />
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--hairline-soft)' }} />

            {/* Favicon */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 8 }}>Favicon URL (opsional)</label>
              <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 12 }}>URL ke icon tab browser (disarankan format .ico atau .png persegi).</div>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 14, color: 'var(--muted-soft)' }}><LinkIcon size={18} /></div>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={formData.faviconUrl}
                  onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                  className="input" 
                  style={{ paddingLeft: 40 }} 
                />
              </div>
              
              {formData.faviconUrl && (
                <div style={{ marginTop: 12, padding: 12, border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)', display: 'inline-block', backgroundColor: 'var(--surface-soft)' }}>
                  <img src={getDirectImageUrl(formData.faviconUrl)} alt="Preview Favicon" style={{ width: 32, height: 32, objectFit: 'contain' }} 
                       onError={(e) => { e.target.style.display = 'none'; if (e.target.parentElement) { e.target.parentElement.innerHTML = '<span style="color:red;font-size:12px">URL Gambar tidak valid</span>'; } }} />
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--hairline-soft)' }} />

            {/* Hero Image */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 8 }}>Hero Image URL (opsional)</label>
              <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 12 }}>URL gambar besar yang muncul di halaman beranda / dashboard user.</div>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 14, color: 'var(--muted-soft)' }}><LinkIcon size={18} /></div>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  className="input" 
                  style={{ paddingLeft: 40 }} 
                />
              </div>
              
              {formData.heroImageUrl && (
                <div style={{ marginTop: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--hairline)' }}>
                  <img src={getDirectImageUrl(formData.heroImageUrl)} alt="Preview Hero" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} 
                       onError={(e) => { e.target.style.display = 'none'; if (e.target.parentElement) { e.target.parentElement.innerHTML = '<div style="padding:16px;color:red;font-size:12px;text-align:center;">URL Gambar tidak valid</div>'; } }} />
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--hairline-soft)' }} />

            {/* Google Drive API Key */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 8 }}>Google Drive API Key</label>
              <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 12 }}>Diperlukan untuk fitur baca "Link Folder" otomatis di Galeri Foto. Dapatkan dari Google Cloud Console.</div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder="AIzaSyB..." 
                  value={formData.googleDriveApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, googleDriveApiKey: e.target.value })}
                  className="input" 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* MENU VISIBILITY */}
        <motion.div variants={fadeUp} custom={3} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Layout color="var(--primary)" />
            <h2 className="title-lg">Visibilitas Menu</h2>
          </div>
          
          <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 24 }}>
            Pilih menu mana saja yang ingin Anda tampilkan atau sembunyikan dari pengunjung.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { id: 'showVideo', label: 'Video Penampilan' },
              { id: 'showGallery', label: 'Galeri Foto' },
              { id: 'showComic', label: 'Komik Digital' },
              { id: 'showSoundtrack', label: 'Soundtrack' },
              { id: 'showBonus', label: 'Bonus Content' },
              { id: 'showRewards', label: 'Digital Reward' },
            ].map(menu => (
              <label key={menu.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', backgroundColor: 'var(--surface-dark)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <input 
                  type="checkbox" 
                  checked={formData[menu.id]} 
                  onChange={(e) => setFormData({ ...formData, [menu.id]: e.target.checked })} 
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
                <span className="body-strong">{menu.label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* CATEGORIES */}
        <motion.div variants={fadeUp} custom={3} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Layout color="var(--primary)" />
            <h2 className="title-lg">Kategori Konten</h2>
          </div>
          
          <div className="body-sm" style={{ color: 'var(--muted)', marginBottom: 24 }}>
            Sesuaikan label dan ID kategori untuk video dan foto Anda. Kategori "Semua" otomatis ditambahkan. Jangan gunakan spasi pada "ID Kategori".
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Video Categories */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 12 }}>Kategori Video Penampilan</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(formData.videoCategories || []).map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text" 
                      placeholder="Label Kategori (cth: Drama)" 
                      value={cat.label}
                      onChange={(e) => {
                        const newCats = [...formData.videoCategories];
                        newCats[idx].label = e.target.value;
                        if(!newCats[idx].value) newCats[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setFormData({ ...formData, videoCategories: newCats });
                      }}
                      className="input" 
                      style={{ flex: 1 }} 
                    />
                    <input 
                      type="text" 
                      placeholder="ID (cth: drama-1)" 
                      value={cat.value}
                      onChange={(e) => {
                        const newCats = [...formData.videoCategories];
                        newCats[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setFormData({ ...formData, videoCategories: newCats });
                      }}
                      className="input" 
                      style={{ width: 150 }} 
                    />
                    <button 
                      className="btn-text" 
                      style={{ color: 'var(--error)' }}
                      onClick={() => {
                        const newCats = formData.videoCategories.filter((_, i) => i !== idx);
                        setFormData({ ...formData, videoCategories: newCats });
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button 
                  className="btn-secondary" 
                  style={{ width: 'max-content', marginTop: 8 }}
                  onClick={() => {
                    const newCats = [...(formData.videoCategories || []), { label: '', value: '' }];
                    setFormData({ ...formData, videoCategories: newCats });
                  }}
                >
                  + Tambah Kategori Video
                </button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--hairline-soft)' }} />

            {/* Photo Categories */}
            <div>
              <label className="body-strong" style={{ display: 'block', marginBottom: 12 }}>Kategori Foto & Dokumentasi</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(formData.photoCategories || []).map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text" 
                      placeholder="Label Kategori (cth: Backstage)" 
                      value={cat.label}
                      onChange={(e) => {
                        const newCats = [...formData.photoCategories];
                        newCats[idx].label = e.target.value;
                        if(!newCats[idx].value) newCats[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setFormData({ ...formData, photoCategories: newCats });
                      }}
                      className="input" 
                      style={{ flex: 1 }} 
                    />
                    <input 
                      type="text" 
                      placeholder="ID (cth: backstage-1)" 
                      value={cat.value}
                      onChange={(e) => {
                        const newCats = [...formData.photoCategories];
                        newCats[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setFormData({ ...formData, photoCategories: newCats });
                      }}
                      className="input" 
                      style={{ width: 150 }} 
                    />
                    <button 
                      className="btn-text" 
                      style={{ color: 'var(--error)' }}
                      onClick={() => {
                        const newCats = formData.photoCategories.filter((_, i) => i !== idx);
                        setFormData({ ...formData, photoCategories: newCats });
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button 
                  className="btn-secondary" 
                  style={{ width: 'max-content', marginTop: 8 }}
                  onClick={() => {
                    const newCats = [...(formData.photoCategories || []), { label: '', value: '' }];
                    setFormData({ ...formData, photoCategories: newCats });
                  }}
                >
                  + Tambah Kategori Foto
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ACTIONS */}
        <motion.div variants={fadeUp} custom={4} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary btn-lg"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              backgroundColor: 'var(--surface-elevated)',
              border: `1px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              zIndex: 9999,
            }}
          >
            {toast.type === 'success' ? (
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--success) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="var(--success)" />
              </div>
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--error) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={14} color="var(--error)" />
              </div>
            )}
            <span className="body-strong" style={{ color: 'var(--ink)' }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
