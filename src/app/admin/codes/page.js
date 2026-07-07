'use client';

import { useState, useEffect } from 'react';
import { generateCodes, getActivationCodes, deleteActivationCode, checkIfUserExists } from '@/lib/firestore';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Key, Plus, Download, Search, CheckCircle, XCircle, Copy, Check, Trash2 } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';
import * as XLSX from 'xlsx';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function AdminCodesPage() {
  const { showToast, showDialog } = useDialog();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [batchName, setBatchName] = useState('');
  const [showGenForm, setShowGenForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newlyGenerated, setNewlyGenerated] = useState([]);

  useEffect(() => {
    loadCodes();
  }, [filter]);

  const handleDeleteClick = async (code) => {
    if (code.status === 'used' && code.usedBy) {
      const exists = await checkIfUserExists(code.usedBy);
      if (exists) {
        showDialog({ title: 'Perhatian', message: 'Kode ini sedang dipakai oleh pengguna yang masih aktif. Hapus pengguna terlebih dahulu.' });
        return;
      }
    }
    
    showDialog({
      title: 'Hapus Kode Aktivasi',
      message: `Yakin ingin menghapus kode ${code.code}? Data tidak dapat dikembalikan.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteActivationCode(code.id);
          setCodes(codes.filter(c => c.id !== code.id));
          showToast('Kode berhasil dihapus', 'success');
        } catch (e) {
          console.error(e);
          showToast('Gagal menghapus kode', 'error');
        }
      }
    });
  };

  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await getActivationCodes(filter);
      setCodes(data);
    } catch (error) {
      console.error('Error loading codes:', error);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (genCount < 1 || genCount > 500) return;
    setGenerating(true);
    try {
      const generatedCodes = await generateCodes(genCount, batchName || undefined);
      setNewlyGenerated(generatedCodes);
      setShowGenForm(false);
      setGenCount(10);
      setBatchName('');
      await loadCodes();
      showToast('Berhasil generate kode', 'success');
    } catch (error) {
      console.error('Error generating codes:', error);
      showToast('Gagal generate kode. Silakan coba lagi.', 'error');
    }
    setGenerating(false);
  };

  const exportToExcel = () => {
    const data = filteredCodes.map((code) => ({
      'Kode Aktivasi': code.code,
      'Status': code.status === 'used' ? 'Terpakai' : 'Tersedia',
      'Digunakan Oleh': code.usedBy || '-',
      'Tanggal Digunakan': code.usedDate ? formatDateTime(code.usedDate) : '-',
      'Batch': code.batch || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activation Codes');
    XLSX.writeFile(wb, `activation-codes-${filter}-${Date.now()}.xlsx`);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = codes.filter(c =>
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.usedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usedCount = codes.filter(c => c.status === 'used').length;
  const unusedCount = codes.filter(c => c.status === 'unused').length;

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="display-sm" style={{ marginBottom: 8 }}>Kode Aktivasi</h1>
            <p className="body-sm" style={{ color: 'var(--muted)' }}>
              Generate dan kelola kode aktivasi untuk pembeli komik.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={exportToExcel} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}>
              <Download size={14} /> Export Excel
            </button>
            <button className="btn-primary" onClick={() => setShowGenForm(true)} style={{ fontSize: 13, height: 36, padding: '8px 14px' }}>
              <Plus size={14} /> Generate Kode
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats mini */}
      <motion.div variants={fadeUp} custom={1} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="badge" style={{ fontSize: 13 }}>Total: {codes.length}</div>
        <div className="badge badge-success" style={{ fontSize: 13 }}><CheckCircle size={12} /> Terpakai: {usedCount}</div>
        <div className="badge" style={{ fontSize: 13, backgroundColor: 'var(--surface-soft)' }}><XCircle size={12} /> Tersedia: {unusedCount}</div>
      </motion.div>

      {/* Generate Form Modal */}
      {showGenForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setShowGenForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)', width: '100%', maxWidth: 420,
            }}
          >
            <h3 className="title-lg" style={{ marginBottom: 20 }}>Generate Kode Aktivasi</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: 'var(--body-strong)' }}>
                Jumlah Kode
              </label>
              <input
                type="number"
                className="input"
                min={1}
                max={500}
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value) || 0)}
              />
              <p className="caption" style={{ marginTop: 4, color: 'var(--muted-soft)' }}>Maksimal 500 kode per batch</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: 'var(--body-strong)' }}>
                Nama Batch (opsional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="cth: Batch Juli 2025"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setShowGenForm(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleGenerate} disabled={generating || genCount < 1} style={{ flex: 1, justifyContent: 'center' }}>
                {generating ? 'Generating...' : `Generate ${genCount} Kode`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Newly Generated Codes */}
      {newlyGenerated.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(93, 184, 114, 0.08)',
            border: '1px solid rgba(93, 184, 114, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="title-sm" style={{ color: 'var(--success)' }}>
              ✅ {newlyGenerated.length} kode berhasil di-generate!
            </h3>
            <button className="btn-text" onClick={() => setNewlyGenerated([])}>Tutup</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {newlyGenerated.slice(0, 20).map((code) => (
              <button
                key={code}
                onClick={() => copyCode(code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)',
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                {code}
                {copiedCode === code ? <Check size={12} color="var(--success)" /> : <Copy size={12} color="var(--muted-soft)" />}
              </button>
            ))}
            {newlyGenerated.length > 20 && (
              <span className="body-sm" style={{ color: 'var(--muted)', padding: '6px 0' }}>
                +{newlyGenerated.length - 20} kode lainnya
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Search & Filter */}
      <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Cari kode, user, batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-scroll-container">
          <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
            {['all', 'unused', 'used'].map((f) => (
              <button key={f} className={`tab ${filter === f ? 'tab-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Semua' : f === 'unused' ? 'Tersedia' : 'Terpakai'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Codes Table */}
      <motion.div variants={fadeUp} custom={3}>
        <div className="table-scroll-container" style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ minWidth: 700 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 1fr 1fr 60px',
            padding: '12px 20px', borderBottom: '1px solid var(--hairline)',
            gap: 12,
          }}>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Kode</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Status</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Digunakan Oleh</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Batch</span>
            <span></span>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 'var(--radius-sm)' }} />
              ))}
            </div>
          ) : filteredCodes.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Key size={32} color="var(--muted-soft)" style={{ margin: '0 auto 12px' }} />
              <p className="body-sm" style={{ color: 'var(--muted)' }}>
                {searchTerm ? 'Tidak ditemukan kode yang cocok.' : 'Belum ada kode aktivasi. Klik "Generate Kode" untuk membuat.'}
              </p>
            </div>
          ) : (
            filteredCodes.map((code, i) => (
              <div
                key={code.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 1fr 1fr 90px',
                  padding: '12px 20px',
                  borderBottom: i < filteredCodes.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                  alignItems: 'center', gap: 12,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  {code.code}
                </span>
                <span className={`badge ${code.status === 'used' ? 'badge-success' : ''}`} style={{ fontSize: 11, width: 'fit-content' }}>
                  {code.status === 'used' ? 'Terpakai' : 'Tersedia'}
                </span>
                <span className="body-sm" style={{ color: 'var(--muted)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {code.usedBy || '-'}
                </span>
                <span className="body-sm" style={{ color: 'var(--muted-soft)', fontSize: 12 }}>
                  {code.batch || '-'}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => copyCode(code.code)}
                    className="btn-icon"
                    style={{ width: 30, height: 30 }}
                    title="Copy kode"
                  >
                    {copiedCode === code.code ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(code)}
                    className="btn-icon"
                    style={{ width: 30, height: 30, color: 'var(--error)' }}
                    title="Hapus kode"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
