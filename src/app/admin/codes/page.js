'use client';

import { useState, useEffect } from 'react';
import { generateCodes, getActivationCodes, deleteActivationCode, resetActivationCode, toggleCodeAdminRole, checkIfUserExists } from '@/lib/firestore';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Key, Plus, Download, Search, CheckCircle, XCircle, Copy, Check, Trash2, RotateCcw, Shield, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isAdminBatch, setIsAdminBatch] = useState(false);
  const [showGenForm, setShowGenForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newlyGenerated, setNewlyGenerated] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    loadCodes();
  }, [filter]);

  // Reset pagination when search, filter, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, pageSize]);

  const handleDeleteClick = async (code) => {
    const isUsed = code.status === 'used';
    
    showDialog({
      title: 'Hapus Kode Aktivasi',
      message: isUsed 
        ? `Kode ${code.code} sedang TERPAKAI. Menghapus kode ini akan mencabut akses aktivasi pengguna terkait dan mengembalikannya ke halaman aktivasi. Yakin ingin menghapus?`
        : `Yakin ingin menghapus kode ${code.code}? Data tidak dapat dikembalikan.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteActivationCode(code.id);
          setCodes(codes.filter(c => c.id !== code.id));
          showToast(isUsed ? 'Kode dihapus & status aktivasi pengguna dicabut.' : 'Kode berhasil dihapus', 'success');
        } catch (e) {
          console.error(e);
          showToast('Gagal menghapus kode', 'error');
        }
      }
    });
  };

  const handleResetClick = async (code) => {
    showDialog({
      title: 'Reset Kode Aktivasi',
      message: `Yakin ingin mereset kode ${code.code} menjadi TERSEDIA lagi? Pengguna terkait akan dicabut akses aktivasinya dan dikembalikan ke halaman aktivasi.`,
      isDanger: false,
      onConfirm: async () => {
        try {
          await resetActivationCode(code.id);
          await loadCodes();
          showToast('Kode berhasil di-reset menjadi TERSEDIA!', 'success');
        } catch (e) {
          console.error(e);
          showToast('Gagal mereset kode', 'error');
        }
      }
    });
  };

  const handleToggleAdmin = async (code) => {
    const isCurrentAdmin = code.role === 'admin';
    const targetRoleLabel = isCurrentAdmin ? 'User Biasa' : 'Admin Web';

    showDialog({
      title: isCurrentAdmin ? 'Cabut Akses Admin' : 'Jadikan Sebagai Admin Web',
      message: `Apakah Anda yakin ingin mengubah status kode ${code.code} menjadi ${targetRoleLabel.toUpperCase()}? ${code.usedBy ? 'Pengguna yang menggunakan kode ini juga akan otomatis ' + (isCurrentAdmin ? 'dicabut hak adminnya.' : 'menjadi Admin web!') : 'Pengguna yang memakai kode ini nanti akan langsung otomatis menjadi Admin web!'}`,
      isDanger: isCurrentAdmin,
      onConfirm: async () => {
        try {
          const res = await toggleCodeAdminRole(code.id);
          if (res?.success) {
            await loadCodes();
            showToast(`Kode ${code.code} berhasil diubah menjadi ${targetRoleLabel}!`, 'success');
          }
        } catch (e) {
          console.error(e);
          showToast('Gagal mengubah role kode', 'error');
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
      const generatedCodes = await generateCodes(genCount, batchName || undefined, isAdminBatch);
      setNewlyGenerated(generatedCodes);
      setShowGenForm(false);
      setGenCount(10);
      setBatchName('');
      setIsAdminBatch(false);
      await loadCodes();
      showToast(`Berhasil generate ${generatedCodes.length} kode ${isAdminBatch ? '(Hak Akses: ADMIN)' : ''}`, 'success');
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

  const totalItems = filteredCodes.length;
  const itemsPerPage = pageSize === 'all' ? totalItems : (parseInt(pageSize) || 20);
  const totalPages = Math.max(1, Math.ceil(totalItems / (itemsPerPage || 1)));
  const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = pageSize === 'all' ? totalItems : Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCodes = filteredCodes.slice(startIndex, endIndex);

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="display-sm" style={{ marginBottom: 8 }}>Kode Aktivasi</h1>
            <p className="body-sm" style={{ color: 'var(--muted)' }}>
              Generate dan kelola kode aktivasi serta hak akses Admin web.
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
        <div className="badge" style={{ fontSize: 13, backgroundColor: 'rgba(255,107,0,0.1)', color: 'var(--color-da-orange)' }}>
          <ShieldCheck size={12} /> Kode Admin: {codes.filter(c => c.role === 'admin').length}
        </div>
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

            <div style={{ marginBottom: 20 }}>
              <label className="body-sm" style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: 'var(--body-strong)' }}>
                Nama Batch (opsional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="cth: Batch Panitia / Tim Admin"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 24, padding: '10px 14px', backgroundColor: 'rgba(255, 107, 0, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 107, 0, 0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="isAdminBatch"
                checked={isAdminBatch}
                onChange={(e) => setIsAdminBatch(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="isAdminBatch" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={15} color="var(--color-da-orange)" /> Set Sebagai Kode ADMIN Web
              </label>
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
          <div style={{ minWidth: 720 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 90px 90px 1.2fr 1fr 120px',
            padding: '12px 20px', borderBottom: '1px solid var(--hairline)',
            gap: 12, alignItems: 'center'
          }}>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Kode</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Role</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Status</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Digunakan Oleh</span>
            <span className="caption-uppercase" style={{ fontSize: 11 }}>Batch</span>
            <span className="caption-uppercase" style={{ fontSize: 11, textAlign: 'right' }}>Aksi</span>
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
            paginatedCodes.map((code, i) => (
              <div
                key={code.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 90px 90px 1.2fr 1fr 120px',
                  padding: '12px 20px',
                  borderBottom: i < paginatedCodes.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                  alignItems: 'center', gap: 12,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {code.code}
                </span>
                <div>
                  {code.role === 'admin' ? (
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: 'rgba(255, 107, 0, 0.15)', 
                        color: 'var(--color-da-orange)', 
                        border: '1px solid rgba(255, 107, 0, 0.3)', 
                        fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 
                      }}
                    >
                      <ShieldCheck size={11} /> ADMIN
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--muted-soft)', fontWeight: 500 }}>USER</span>
                  )}
                </div>
                <div>
                  <span className={`badge ${code.status === 'used' ? 'badge-success' : ''}`} style={{ fontSize: 11, width: 'fit-content' }}>
                    {code.status === 'used' ? 'Terpakai' : 'Tersedia'}
                  </span>
                </div>
                <span className="body-sm" style={{ color: 'var(--muted)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {code.usedBy || '-'}
                </span>
                <span className="body-sm" style={{ color: 'var(--muted-soft)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {code.batch || '-'}
                </span>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  {/* Toggle Admin Button */}
                  <button
                    onClick={() => handleToggleAdmin(code)}
                    className="btn-icon"
                    style={{ 
                      width: 30, height: 30, 
                      color: code.role === 'admin' ? 'var(--color-da-orange)' : 'var(--muted-soft)' 
                    }}
                    title={code.role === 'admin' ? 'Cabut Hak Admin (Jadikan User Biasa)' : 'Jadikan Sebagai Admin Web'}
                  >
                    {code.role === 'admin' ? <ShieldCheck size={15} /> : <Shield size={15} />}
                  </button>

                  {code.status === 'used' && (
                    <button
                      onClick={() => handleResetClick(code)}
                      className="btn-icon"
                      style={{ width: 30, height: 30, color: 'var(--primary)' }}
                      title="Reset Kode (Jadikan Tersedia & Revoke User)"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
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

          {/* Pagination Controls Bar */}
          {!loading && filteredCodes.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--hairline)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 13,
              color: 'var(--muted)',
              backgroundColor: 'var(--surface-soft)',
              borderBottomLeftRadius: 'var(--radius-lg)',
              borderBottomRightRadius: 'var(--radius-lg)'
            }}>
              <div>
                Menampilkan <strong>{totalItems > 0 ? startIndex + 1 : 0}-{endIndex}</strong> dari <strong>{totalItems}</strong> kode aktivasi
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Page Size Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>Per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="input"
                    style={{ height: 30, padding: '0 8px', fontSize: 12, width: 'auto', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">Tampilkan Semua</option>
                  </select>
                </div>

                {/* Page Navigation Buttons */}
                {pageSize !== 'all' && totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn-secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{ height: 30, padding: '0 8px', fontSize: 12, opacity: currentPage === 1 ? 0.4 : 1 }}
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '0 4px', color: 'var(--ink)' }}>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      className="btn-secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{ height: 30, padding: '0 8px', fontSize: 12, opacity: currentPage === totalPages ? 0.4 : 1 }}
                      title="Halaman Selanjutnya"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
