'use client';

import { useState, useEffect } from 'react';
import { getPhotos } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ImageIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4 },
  }),
};

export default function GalleryPage() {
  const { settings } = useSettings();
  const photoCategories = settings?.photoCategories || [];
  const allCategories = [{ value: 'all', label: 'Semua' }, ...photoCategories];

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPhotos();
  }, [activeCategory]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getPhotos(activeCategory);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
    setLoading(false);
  };

  const goNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const filteredPhotos = photos.filter(photo => 
    photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    photo.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photoCategories.find(c => c.value === photo.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>GALERI FOTO</p>
          <h1 className="display-md" style={{ marginBottom: 8 }}>
            Galeri <span style={{ color: 'var(--primary)' }}>Foto</span>
          </h1>
          <p className="body-md" style={{ color: 'var(--muted)' }}>
            Album foto resmi Pentas Seni Drama Arena 5101.
          </p>
        </div>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari foto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40, height: 44, borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={fadeUp} custom={1} style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32,
      }}>
        {allCategories.map((cat) => (
          <button
            key={cat.value}
            className={`tab ${activeCategory === cat.value ? 'tab-active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Photo Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <motion.div variants={fadeUp} custom={2} style={{ textAlign: 'center', padding: 'var(--space-section) 0' }}>
          <ImageIcon size={48} color="var(--muted-soft)" style={{ margin: '0 auto 16px' }} />
          <h3 className="title-md" style={{ marginBottom: 8 }}>Belum Ada Foto</h3>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            {searchQuery ? 'Tidak ada foto yang cocok dengan pencarian.' : 'Foto akan segera ditambahkan. Nantikan koleksi lengkapnya!'}
          </p>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {filteredPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              variants={fadeUp}
              custom={i + 2}
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                paddingTop: i % 5 === 0 ? '130%' : i % 3 === 0 ? '100%' : '75%',
                backgroundColor: 'var(--surface-card)',
              }}
              onClick={() => setSelectedIndex(i)}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title || 'Foto'}
                referrerPolicy="no-referrer"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
              />
              {photo.category && (
                <span className="badge" style={{
                  position: 'absolute', bottom: 8, left: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11,
                }}>
                  {photoCategories.find(c => c.value === photo.category)?.label || photo.category}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && filteredPhotos[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-lg)',
            }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedIndex(null)}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'white', cursor: 'pointer', padding: 10,
                borderRadius: 'var(--radius-full)', zIndex: 10,
              }}
            >
              <X size={24} />
            </button>

            {/* Prev */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'white', cursor: 'pointer', padding: 12,
                  borderRadius: 'var(--radius-full)', zIndex: 10,
                }}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next */}
            {selectedIndex < photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'white', cursor: 'pointer', padding: 12,
                  borderRadius: 'var(--radius-full)', zIndex: 10,
                }}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={filteredPhotos[selectedIndex].imageUrl}
              alt={filteredPhotos[selectedIndex].title || 'Foto'}
              referrerPolicy="no-referrer"
              style={{
                maxWidth: '90vw', maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div style={{
              position: 'absolute', bottom: 20,
              color: 'rgba(255,255,255,0.6)', fontSize: 14,
            }}>
              {selectedIndex + 1} / {filteredPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
