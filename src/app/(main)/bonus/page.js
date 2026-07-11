'use client';

import { useState, useEffect } from 'react';
import { getVideos, getResolvedPhotos as getPhotos } from '@/lib/firestore';
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Play, X, Film, Camera } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

export default function BonusPage() {
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Bonus content uses specific categories
      const [bonusVideos, btsPhotos] = await Promise.all([
        getVideos('bonus'),
        getPhotos('backstage'),
      ]);
      setVideos(bonusVideos);
      setPhotos(btsPhotos);
    } catch (error) {
      console.error('Error loading bonus content:', error);
    }
    setLoading(false);
  };

  const isEmpty = videos.length === 0 && photos.length === 0;

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>EKSKLUSIF</p>
        <h1 className="display-md" style={{ marginBottom: 8 }}>
          Bonus <span style={{ color: 'var(--primary)' }}>Content</span>
        </h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Konten eksklusif behind the scenes, wawancara, dan dokumentasi yang tidak ditampilkan saat acara.
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : isEmpty ? (
        <motion.div variants={fadeUp} custom={1} style={{ textAlign: 'center', padding: 'var(--space-section) 0' }}>
          <Gift size={48} color="var(--muted-soft)" style={{ margin: '0 auto 16px' }} />
          <h3 className="title-md" style={{ marginBottom: 8 }}>Bonus Content Segera Hadir</h3>
          <p className="body-sm" style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto' }}>
            Konten eksklusif behind the scenes, wawancara panitia, dan dokumentasi spesial akan segera ditambahkan. Stay tuned!
          </p>
        </motion.div>
      ) : (
        <>
          {/* Bonus Videos */}
          {videos.length > 0 && (
            <motion.div variants={fadeUp} custom={1} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Film size={20} color="var(--primary)" />
                <h2 className="title-lg">Behind The Scenes</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {videos.map((video, i) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--surface-card)',
                      cursor: 'pointer',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: 'var(--surface-dark)', overflow: 'hidden' }}>
                      {(video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)) && (
                        <img src={video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)} alt={video.title}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(204,120,92,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={22} color="white" fill="white" />
                        </div>
                      </div>
                      <span className="badge badge-coral" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>BONUS</span>
                    </div>
                    <div style={{ padding: '14px 18px' }}>
                      <h3 className="title-sm">{video.title}</h3>
                      {video.description && <p className="body-sm" style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{video.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bonus Photos */}
          {photos.length > 0 && (
            <motion.div variants={fadeUp} custom={2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Camera size={20} color="var(--accent-teal)" />
                <h2 className="title-lg">Backstage Gallery</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    style={{
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      cursor: 'pointer', position: 'relative', paddingTop: '100%',
                      backgroundColor: 'var(--surface-card)',
                    }}
                  >
                    <img src={photo.imageUrl} alt={photo.title || 'Backstage'}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              style={{ width: '100%', maxWidth: 800, backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                <h3 style={{ color: 'var(--on-dark)', fontSize: 15, fontWeight: 500 }}>{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} style={{ background: 'var(--surface-dark-elevated)', border: 'none', color: 'var(--on-dark-soft)', cursor: 'pointer', padding: 8, borderRadius: 'var(--radius-full)' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe 
                  src={getVideoEmbedUrl(selectedVideo.videoUrl)} 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} 
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}
            onClick={() => setSelectedPhoto(null)}
          >
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: 10, borderRadius: 'var(--radius-full)', zIndex: 10 }}>
              <X size={24} />
            </button>
            <motion.img initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              src={selectedPhoto.imageUrl} alt={selectedPhoto.title || 'Photo'}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
