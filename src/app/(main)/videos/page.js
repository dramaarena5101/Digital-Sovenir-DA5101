'use client';

import { useState, useEffect } from 'react';
import { getVideos } from '@/lib/firestore';
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Film, Search } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

export default function VideosPage() {
  const { settings } = useSettings();
  const videoCategories = settings?.videoCategories || [];
  const allCategories = [{ value: 'all', label: 'Semua' }, ...videoCategories];

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVideos();
  }, [activeCategory]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getVideos(activeCategory);
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
    setLoading(false);
  };

  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    videoCategories.find(c => c.value === video.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>KOLEKSI VIDEO</p>
          <h1 className="display-md" style={{ marginBottom: 8 }}>
            Video <span style={{ color: 'var(--primary)' }}>Penampilan</span>
          </h1>
          <p className="body-md" style={{ color: 'var(--muted)' }}>
            Seluruh dokumentasi video Pentas Seni Drama Arena 5101.
          </p>
        </div>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40, height: 44, borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={fadeUp} custom={1} style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32,
        overflowX: 'auto', paddingBottom: 4,
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

      {/* Video Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 180 }} />
              <div style={{ padding: 16, backgroundColor: 'var(--surface-card)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <motion.div variants={fadeUp} custom={2} style={{
          textAlign: 'center', padding: 'var(--space-section) 0',
        }}>
          <Film size={48} color="var(--muted-soft)" style={{ margin: '0 auto 16px' }} />
          <h3 className="title-md" style={{ marginBottom: 8 }}>Belum Ada Video</h3>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            {searchQuery ? 'Tidak ada video yang cocok dengan pencarian.' : 'Video akan segera ditambahkan. Nantikan koleksi lengkapnya!'}
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredVideos.map((video, i) => (
            <motion.div
              key={video.id}
              variants={fadeUp}
              custom={i + 2}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedVideo(video)}
            >
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-card)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Thumbnail */}
                <div style={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  backgroundColor: 'var(--surface-dark)',
                  overflow: 'hidden',
                }}>
                  {(video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)) && (
                    <img
                      src={video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)}
                      alt={video.title}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {/* Play overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      backgroundColor: 'rgba(204, 120, 92, 0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.2s ease',
                    }}>
                      <Play size={24} color="white" fill="white" />
                    </div>
                  </div>
                  {/* Category badge */}
                  {video.category && (
                    <span className="badge" style={{
                      position: 'absolute', top: 12, left: 12,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white', fontSize: 11,
                    }}>
                      {videoCategories.find(c => c.value === video.category)?.label || video.category}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px 20px' }}>
                  <h3 className="title-sm" style={{ marginBottom: 4, lineHeight: 1.3 }}>{video.title}</h3>
                  {video.description && (
                    <p className="body-sm" style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                      {video.description.length > 80 ? video.description.substring(0, 80) + '...' : video.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-lg)',
            }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                width: '100%', maxWidth: 900,
                backgroundColor: 'var(--surface-dark)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px',
              }}>
                <h3 style={{ color: 'var(--on-dark)', fontSize: 16, fontWeight: 500 }}>{selectedVideo.title}</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  style={{
                    background: 'var(--surface-dark-elevated)', border: 'none',
                    color: 'var(--on-dark-soft)', cursor: 'pointer', padding: 8,
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video iframe */}
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={getVideoEmbedUrl(selectedVideo.videoUrl)}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    border: 'none',
                  }}
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Block Google Drive pop-out button in top right corner */}
                {selectedVideo.videoUrl?.includes('drive.google.com') && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '80px', height: '80px',
                    zIndex: 10, cursor: 'default'
                  }} title=" " />
                )}
                {/* Strict Overlays for YouTube to block Share and Watch on YouTube */}
                {(selectedVideo.videoUrl?.includes('youtube') || selectedVideo.videoUrl?.includes('youtu.be')) && (
                  <>
                    {/* Top bar (blocks Title) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', zIndex: 10, cursor: 'default' }} title=" " />
                    {/* Bottom left corner (blocks Share, Watch Later) */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
                    {/* Bottom right corner (blocks Watch on YT, More videos) */}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '250px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
                  </>
                )}
              </div>

              {/* Description */}
              {selectedVideo.description && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'var(--on-dark-soft)', fontSize: 14, lineHeight: 1.6 }}>
                    {selectedVideo.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
