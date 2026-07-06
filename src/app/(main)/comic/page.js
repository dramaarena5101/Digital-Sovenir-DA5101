'use client';

import { useState, useEffect } from 'react';
import { getDocuments } from '@/lib/firestore';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function ComicPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data.filter(d => d.type === 'comic' || !d.type));
      if (data.length > 0) {
        setSelectedDoc(data[0]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
    setLoading(false);
  };

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>KOMIK DIGITAL</p>
        <h1 className="display-md" style={{ marginBottom: 8 }}>
          Komik <span style={{ color: 'var(--primary)' }}>Digital</span>
        </h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Versi digital dari komik Pentas Seni yang Anda beli. Baca kapan saja, di mana saja.
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : documents.length === 0 ? (
        <motion.div variants={fadeUp} custom={1} style={{ textAlign: 'center', padding: 'var(--space-section) 0' }}>
          <FileText size={48} color="var(--muted-soft)" style={{ margin: '0 auto 16px' }} />
          <h3 className="title-md" style={{ marginBottom: 8 }}>Belum Ada Komik Digital</h3>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            Komik digital akan segera ditambahkan. Nantikan!
          </p>
        </motion.div>
      ) : (
        <div>
          {/* Document list */}
          {documents.length > 1 && (
            <motion.div variants={fadeUp} custom={1} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  className={`tab ${selectedDoc?.id === doc.id ? 'tab-active' : ''}`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <BookOpen size={14} style={{ marginRight: 6 }} />
                  {doc.title}
                </button>
              ))}
            </motion.div>
          )}

          {/* PDF Viewer */}
          {selectedDoc && (
            <motion.div variants={fadeUp} custom={2}>
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              }}>
                {/* Title bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--hairline)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BookOpen size={20} color="var(--primary)" />
                    <h3 className="title-sm">{selectedDoc.title}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={selectedDoc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ height: 36, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}
                    >
                      <Maximize2 size={14} />
                      Buka di Tab Baru
                    </a>
                  </div>
                </div>

                {/* PDF Embed */}
                <div style={{ height: '70vh', minHeight: 500 }}>
                  <iframe
                    src={selectedDoc.pdfUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={selectedDoc.title}
                  />
                </div>
              </div>

              {/* Description */}
              {selectedDoc.description && (
                <div style={{ marginTop: 16, padding: '16px 24px', backgroundColor: 'var(--surface-soft)', borderRadius: 'var(--radius-lg)' }}>
                  <p className="body-sm" style={{ color: 'var(--muted)' }}>{selectedDoc.description}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
