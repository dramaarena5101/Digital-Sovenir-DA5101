'use client';

import { useState, useEffect } from 'react';
import { getDocuments, addDocument, deleteDocument } from '@/lib/firestore';
import { uploadPDF } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, X, Upload, Save, ExternalLink } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';

export default function AdminDocumentsPage() {
  const { showToast, showDialog } = useDialog();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'comic' });
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => { loadDocs(); }, []);
  const loadDocs = async () => { setLoading(true); try { setDocs(await getDocuments()); } catch (e) { console.error(e); } setLoading(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (!urlInput) return;
    
    setSaving(true);
    try {
      const pdfUrl = urlInput.trim();
      
      await addDocument({ ...form, pdfUrl });
      setShowForm(false); setForm({ title: '', description: '', type: 'comic' }); setUrlInput('');
      await loadDocs();
      showToast('Dokumen berhasil diupload', 'success');
    } catch (err) { console.error(err); showToast('Gagal upload', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    showDialog({
      title: 'Hapus Dokumen',
      message: 'Apakah Anda yakin ingin menghapus dokumen ini?',
      isDanger: true,
      onConfirm: async () => {
        try { await deleteDocument(id); await loadDocs(); showToast('Dokumen dihapus', 'success'); } catch (e) { console.error(e); showToast('Gagal menghapus', 'error'); }
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 className="display-sm" style={{ marginBottom: 4 }}>Kelola Dokumen</h1><p className="body-sm" style={{ color: 'var(--muted)' }}>Upload komik digital dan dokumen PDF.</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}><Plus size={14} /> Tambah PDF</button>
      </div>

      <div className="table-scroll-container" style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ minWidth: 600 }}>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}><FileText size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} /><p className="body-sm" style={{ color: 'var(--muted)' }}>Belum ada dokumen.</p></div>
        ) : (
          docs.map((doc, i) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < docs.length - 1 ? '1px solid var(--hairline-soft)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--accent-amber)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="title-sm">{doc.title}</div>
                <div className="caption" style={{ color: 'var(--muted-soft)' }}>{doc.type === 'comic' ? 'Komik' : 'Dokumen'}</div>
              </div>
              <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: 32, height: 32 }}><ExternalLink size={14} /></a>
              <button className="btn-icon" onClick={() => handleDelete(doc.id)} style={{ width: 32, height: 32, color: 'var(--error)' }}><Trash2 size={14} /></button>
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
              <h3 className="title-lg" style={{ marginBottom: 20 }}>Tambah Dokumen</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Judul Dokumen</label>
                  <input type="text" className="input" placeholder="cth: Komik Episode 1" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Deskripsi Singkat</label>
                  <textarea className="input" placeholder="Deskripsi dokumen..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} style={{ resize: 'none' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Jenis Dokumen</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="comic">Komik</option>
                    <option value="document">Dokumen Biasa</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Link Google Drive atau URL PDF</label>
                  <input 
                    type="url" 
                    className="input" 
                    placeholder="Paste link Google Drive atau URL PDF..." 
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
