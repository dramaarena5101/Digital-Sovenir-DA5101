'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideos } from '@/lib/firestore';
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Info, ChevronLeft, ChevronRight, Film, Search } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const VideoRow = ({ title, videos, onSelect, isPortrait = false, showProgress = false }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: 40, position: 'relative' }} className="video-row-container">
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, paddingLeft: 4, letterSpacing: '-0.3px', textTransform: 'capitalize' }}>{title}</h3>
      
      {/* Scroll Arrows */}
      <button onClick={() => scroll('left')} className="row-arrow left"><ChevronLeft size={36}/></button>
      <button onClick={() => scroll('right')} className="row-arrow right"><ChevronRight size={36}/></button>
      
      <div ref={rowRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 16, paddingLeft: 4, paddingRight: 20 }} className="hide-scrollbar">
        {videos.map((video, i) => (
          <div key={video.id} onClick={() => onSelect(video)} className="video-card" style={{ flex: '0 0 auto', width: isPortrait ? 180 : 280, cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
             <div style={{ position: 'relative', paddingTop: isPortrait ? '150%' : '56.25%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#181818', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                {(video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)) && (
                  <img src={video.thumbnailUrl || getVideoThumbnailUrl(video.videoUrl)} alt={video.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  PART {video.order || i + 1}
                </div>
                
                {!isPortrait && (
                  <div style={{ position: 'absolute', bottom: showProgress ? 16 : 8, right: 8, background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 500, backdropFilter: 'blur(4px)' }}>
                    HD
                  </div>
                )}
                
                {showProgress && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ height: '100%', width: '45%', background: 'var(--error)' }} />
                  </div>
                )}
                
                <div className="play-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <Play size={24} color="white" fill="white" style={{ marginLeft: 4 }} />
                  </div>
                </div>
             </div>
             <h4 style={{ marginTop: 10, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{video.title}</h4>
             <p style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2, textTransform: 'capitalize' }}>{video.category || 'Video Penampilan'}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .video-row-container:hover .row-arrow { opacity: 1; }
        .row-arrow {
          position: absolute; top: 40px; bottom: 44px; width: 40px; background: rgba(0,0,0,0.5); border: none; color: white; cursor: pointer; opacity: 0; transition: opacity 0.3s, background 0.2s; z-index: 10; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
        }
        .row-arrow.left { left: -20px; border-radius: 0 8px 8px 0; }
        .row-arrow.right { right: -20px; border-radius: 8px 0 0 8px; }
        .row-arrow:hover { background: rgba(0,0,0,0.8); color: white; transform: scale(1.1); }
        .video-card:hover { transform: scale(1.05); z-index: 2; }
        .video-card:hover .play-overlay { opacity: 1 !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        @media (max-width: 768px) {
          .row-arrow { display: none; }
          .video-card { width: ${isPortrait ? '140px' : '240px'} !important; }
        }
      `}</style>
    </div>
  );
};

export default function VideosPage() {
  const { settings } = useSettings();
  const settingCategories = settings?.videoCategories || [];

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [recentVideoIds, setRecentVideoIds] = useState([]);
  
  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getVideos('all');
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('da_recent_videos');
      if (saved) setRecentVideoIds(JSON.parse(saved));
    } catch(e) {}
  }, []);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setRecentVideoIds(prev => {
      const newRecent = [video.id, ...prev.filter(id => id !== video.id)].slice(0, 10);
      localStorage.setItem('da_recent_videos', JSON.stringify(newRecent));
      return newRecent;
    });
  };

  // Hero Carousel Auto-play
  const heroVideos = videos.slice(0, 5); // Featured top 5
  useEffect(() => {
    if (heroVideos.length <= 1 || isSearching) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroVideos.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroVideos.length, isSearching]);

  const heroVideo = heroVideos[heroIndex];

  // Filtering & Grouping
  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get array of categories from a string or array
  const getVideoCategories = (categoryData) => {
    if (!categoryData) return [];
    let arr = Array.isArray(categoryData) ? categoryData : categoryData.split(',');
    return arr.map(s => s.trim().toLowerCase()).filter(Boolean);
  };

  // Dynamically extract all unique categories from the videos
  const allCats = filteredVideos.flatMap(v => getVideoCategories(v.category));
  const uniqueCategories = [...new Set(allCats)];
  
  // Map them to objects with labels
  const allCategoryLabels = uniqueCategories.map(cat => {
    // Also lowercase settings value for robust matching
    const settingCat = settingCategories.find(c => c.value?.toLowerCase() === cat);
    return settingCat ? settingCat : { value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }; // fallback
  });

  const groupedVideos = allCategoryLabels.map(cat => ({
    ...cat,
    videos: filteredVideos.filter(v => getVideoCategories(v.category).includes(cat.value))
  })).filter(g => g.videos.length > 0);

  const uncatVideos = filteredVideos.filter(v => getVideoCategories(v.category).length === 0);
  if (uncatVideos.length > 0) {
    groupedVideos.push({ value: 'other', label: 'Lainnya', videos: uncatVideos });
  }

  return (
    <div style={{ 
      backgroundColor: '#0A0810', 
      color: 'white', 
      minHeight: 'calc(100vh - 64px)', 
      margin: '-32px -24px', 
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
      overflowX: 'hidden',
      fontFamily: 'var(--font-body)',
      position: 'relative'
    }}>
      
      {/* Search Navbar (Sticky) */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '24px 5%', display: 'flex', justifyContent: 'flex-end',
        background: 'linear-gradient(to bottom, rgba(10,8,16,0.8) 0%, transparent 100%)'
      }}>
        <div style={{ position: 'relative', width: isSearching || searchQuery ? 300 : 40, transition: 'width 0.3s ease' }}>
          <div 
            onClick={() => setIsSearching(true)}
            style={{ 
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 2
            }}
          >
            <Search size={20} color="white" />
          </div>
          <input
            type="text"
            placeholder="Cari video, kategori, babak..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={() => !searchQuery && setIsSearching(false)}
            style={{ 
              width: '100%', height: 40, paddingLeft: 16, paddingRight: 40,
              backgroundColor: isSearching || searchQuery ? 'rgba(0,0,0,0.6)' : 'transparent',
              border: isSearching || searchQuery ? '1px solid rgba(255,255,255,0.2)' : 'none',
              borderRadius: 20, color: 'white', outline: 'none',
              opacity: isSearching || searchQuery ? 1 : 0, transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)'
            }}
          />
        </div>
      </div>

      {/* HERO SECTION */}
      {!loading && heroVideo && !searchQuery ? (
        <div style={{ position: 'relative', width: '100%', height: '75vh', minHeight: 500, backgroundColor: '#000' }}>
          <AnimatePresence mode="wait">
            <motion.img 
              key={heroVideo.id}
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
              src={heroVideo.thumbnailUrl || getVideoThumbnailUrl(heroVideo.videoUrl)} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </AnimatePresence>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0810 0%, transparent 60%, rgba(10,8,16,0.3) 100%)' }} />
          
          <div style={{ position: 'absolute', bottom: '15%', left: '5%', right: '5%', maxWidth: 700, zIndex: 10 }}>
            <AnimatePresence mode="wait">
              <motion.div key={heroVideo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
                <p style={{ color: 'var(--primary)', letterSpacing: 3, fontSize: 13, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>
                  Top Penampilan • {heroVideo.category || 'Spesial'}
                </p>
                <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(3.5rem, 8vw, 6rem)', lineHeight: 0.9, marginBottom: 16, textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
                  {heroVideo.title}
                </h1>
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, fontSize: 13, color: '#D0D0D0', fontWeight: 600 }}>
                  <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 4 }}>2025</span>
                  <span>•</span>
                  <span>Pentas Seni 5101</span>
                  <span>•</span>
                  <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>HD</span>
                </div>
                
                <p style={{ color: '#E5E5E5', fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: 1.6, marginBottom: 32, textShadow: '0 2px 4px rgba(0,0,0,0.8)', maxWidth: 600 }}>
                  {heroVideo.description || 'Saksikan penampilan luar biasa dan momen-momen magis dari persembahan terbaik Drama Arena 5101 secara eksklusif.'}
                </p>
                
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => handleSelectVideo(heroVideo)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = 'var(--primary-active)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'var(--primary)' }}
                  >
                    <Play size={22} fill="white" /> Tonton Sekarang
                  </button>
                  <button onClick={() => {
                    const rows = document.getElementById('category-rows');
                    if (rows) rows.scrollIntoView({ behavior: 'smooth' });
                  }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px', backgroundColor: 'rgba(109, 109, 110, 0.7)', color: 'white', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'transform 0.2s, background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = 'rgba(109, 109, 110, 0.9)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(109, 109, 110, 0.7)' }}
                  >
                    <Info size={22} /> Selengkapnya
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Carousel Indicators */}
          <div style={{ position: 'absolute', bottom: 32, right: '5%', display: 'flex', gap: 8, zIndex: 10 }}>
            {heroVideos.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setHeroIndex(idx)}
                style={{ 
                  width: heroIndex === idx ? 24 : 8, height: 8, 
                  backgroundColor: heroIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.3)', 
                  borderRadius: 4, cursor: 'pointer', transition: 'all 0.3s' 
                }} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ height: searchQuery ? '100px' : '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: searchQuery ? 80 : 0 }}>
          {loading ? <div className="spinner" style={{ borderColor: 'var(--primary)', borderRightColor: 'transparent' }} /> : (
            !searchQuery && (
              <div style={{ textAlign: 'center', color: '#888' }}>
                <Film size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>Belum ada video tersedia</p>
              </div>
            )
          )}
        </div>
      )}

      {/* CATEGORY ROWS */}
      <div id="category-rows" style={{ padding: '0 5%', marginTop: (heroVideo && !searchQuery) ? -60 : 40, position: 'relative', zIndex: 20, paddingBottom: 80 }}>
        {searchQuery && <h2 style={{ fontSize: 24, marginBottom: 24 }}>Hasil pencarian: "{searchQuery}"</h2>}
        
        {!loading && !searchQuery && recentVideoIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <VideoRow 
              title="Lanjutkan Nonton" 
              videos={recentVideoIds.map(id => videos.find(v => v.id === id)).filter(Boolean)} 
              onSelect={handleSelectVideo} 
              isPortrait={false} 
              showProgress={true}
            />
          </motion.div>
        )}

        {!loading && groupedVideos.map((group, idx) => (
          <motion.div key={group.value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1) }}>
            <VideoRow 
              title={group.label} 
              videos={group.videos} 
              onSelect={handleSelectVideo} 
              isPortrait={true} // Default all actual categories to portrait as requested
            />
          </motion.div>
        ))}
        
        {!loading && groupedVideos.length === 0 && searchQuery && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Tidak ada video yang cocok dengan pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                width: '100%', maxWidth: 1000,
                backgroundColor: '#111',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div style={{
                position: 'absolute', top: 24, right: 24, zIndex: 10
              }}>
                <button
                  onClick={() => setSelectedVideo(null)}
                  style={{
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', cursor: 'pointer', padding: 12,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)', transition: 'background 0.2s, transform 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Video iframe */}
              <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
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
                
                {selectedVideo.videoUrl?.includes('drive.google.com') && (
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', zIndex: 10, cursor: 'default' }} title=" " />
                )}
                {(selectedVideo.videoUrl?.includes('youtube') || selectedVideo.videoUrl?.includes('youtu.be')) && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', zIndex: 10, cursor: 'default' }} title=" " />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '250px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
                  </>
                )}
              </div>

              {/* Player Details */}
              <div style={{ padding: '32px', background: 'linear-gradient(to bottom, #111 0%, #0A0810 100%)' }}>
                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '0.02em', color: 'white', marginBottom: 8 }}>{selectedVideo.title}</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, fontSize: 13, color: '#A0A0A0', fontWeight: 600 }}>
                  <span style={{ color: '#10b981' }}>98% Cocok</span>
                  <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 4 }}>2025</span>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>HD</span>
                  <span style={{ textTransform: 'capitalize' }}>{selectedVideo.category || 'Video'}</span>
                </div>
                {selectedVideo.description && (
                  <p style={{ color: '#E0E0E0', fontSize: 15, lineHeight: 1.6, maxWidth: 800 }}>
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
