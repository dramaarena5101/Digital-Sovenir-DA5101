'use client';

import { useState, useEffect } from 'react';
import { getPhotos } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  const filteredPhotos = photos.filter(photo => 
    photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    photo.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photoCategories.find(c => c.value === photo.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (e, imageUrl) => {
    e.stopPropagation();
    let dlUrl = imageUrl;
    const match = imageUrl.match(/id=([^&]+)/);
    if (match) {
      dlUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    window.open(dlUrl, '_blank');
  };

  useEffect(() => {
    if (filteredPhotos.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % filteredPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredPhotos.length]);

  const handleNextHero = () => {
    setHeroIndex(prev => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevHero = () => {
    setHeroIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const heroPhoto = filteredPhotos.length > 0 ? filteredPhotos[heroIndex % filteredPhotos.length] : null;

  return (
    <motion.div initial="hidden" animate="visible" style={{ position: 'relative' }}>
      
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

      {/* HERO SECTION */}
      {!loading && heroPhoto && !searchQuery && activeCategory === 'all' && (
        <motion.div variants={fadeUp} custom={1} style={{ position: 'relative', width: '100%', height: '55vh', minHeight: 400, backgroundColor: '#000', marginBottom: 40, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.img 
              key={heroPhoto.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              src={heroPhoto.imageUrl} 
              alt={heroPhoto.title || 'Sorotan'} 
              referrerPolicy="no-referrer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} 
            />
          </AnimatePresence>
          {/* Gradient Overlay linking to background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)', zIndex: 3 }} />
          
          {/* Navigation Arrows */}
          <button 
            onClick={handlePrevHero}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: 12, borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNextHero}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: 12, borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight size={24} />
          </button>

          <div style={{ position: 'absolute', bottom: '12%', left: '5%', right: '5%', maxWidth: 700, zIndex: 10 }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={heroPhoto.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 12, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  Sorotan Utama • {heroPhoto.category ? (photoCategories.find(c => c.value === heroPhoto.category)?.label || heroPhoto.category) : 'Momen'}
                </p>
                <h1 className="display-md" style={{ marginBottom: 20, textShadow: '0 4px 24px rgba(0,0,0,1)' }}>
                  {heroPhoto.title || 'Momen Terbaik'}
                </h1>
                <button 
                  onClick={(e) => handleDownload(e, heroPhoto.imageUrl)}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 28px', backgroundColor: 'white', color: 'black', border: 'none', fontWeight: 600, borderRadius: 'var(--radius-full)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                >
                  <Download size={18} /> Unduh Resolusi Penuh
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <motion.div variants={fadeUp} custom={2} style={{
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

      {/* Masonry Photo Grid */}
      {loading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ breakInside: 'avoid', marginBottom: 16, height: i % 2 === 0 ? 250 : 350, borderRadius: 'var(--radius-md)' }} />
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
        <motion.div variants={fadeUp} custom={3} className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 w-full">
          {filteredPhotos.map((photo, i) => (
            <div 
              key={photo.id}
              className="gallery-item-masonry"
              style={{
                breakInside: 'avoid',
                marginBottom: 16,
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-card)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const actions = e.currentTarget.querySelector('.overlay-actions');
                const overlay = e.currentTarget.querySelector('.bg-overlay');
                if (actions) {
                  actions.style.opacity = '1';
                  actions.style.transform = 'translateY(0)';
                }
                if (overlay) overlay.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const actions = e.currentTarget.querySelector('.overlay-actions');
                const overlay = e.currentTarget.querySelector('.bg-overlay');
                if (actions) {
                  actions.style.opacity = '0';
                  actions.style.transform = 'translateY(10px)';
                }
                if (overlay) overlay.style.opacity = '0';
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.imageUrl} 
                alt={photo.title || 'Foto'} 
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
              />
              
              {/* Dark Gradient Overlay */}
              <div 
                className="bg-overlay"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 50%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }} 
              />
              
              {/* Category Badge */}
              {photo.category && (
                <div style={{
                  position: 'absolute', top: 12, left: 12, zIndex: 10,
                  padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.6)', 
                  backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-full)', 
                  fontSize: 11, fontWeight: 600, color: 'white'
                }}>
                  {photoCategories.find(c => c.value === photo.category)?.label || photo.category}
                </div>
              )}

              {/* Title & Download Button */}
              <div 
                className="overlay-actions"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  padding: 16, zIndex: 10,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  opacity: 0, transform: 'translateY(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                <h3 className="body-md" style={{ color: 'white', fontWeight: 600, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {photo.title || 'Foto'}
                </h3>
                <button 
                  onClick={(e) => handleDownload(e, photo.imageUrl)}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '8px 0', fontSize: 13,
                    backgroundColor: 'white', color: 'black', border: 'none',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Download size={14} /> Unduh Gambar
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
      {/* Lightbox / Pop Preview */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title || 'Preview'}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: 40,
                height: 40,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}
            >
              ×
            </button>
            <button 
              onClick={(e) => handleDownload(e, selectedPhoto.imageUrl)}
              style={{
                position: 'absolute',
                bottom: 32,
                background: 'white',
                border: 'none',
                color: 'black',
                padding: '12px 24px',
                borderRadius: '99px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}
            >
              <Download size={18} /> Unduh Resolusi Penuh
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
