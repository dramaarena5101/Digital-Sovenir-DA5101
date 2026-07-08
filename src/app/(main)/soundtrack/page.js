'use client';

import { useState, useEffect, useRef } from 'react';
import { getAudios } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, VolumeX, ListMusic, Repeat, Shuffle } from 'lucide-react';
import Hero3DModel from '@/components/ui/Hero3DModel';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// Sample Data Generator
const sampleTracks = [
  {
    title: "Tangguh (Theme Song)",
    artist: "Band 5101",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop",
    duration: 372
  },
  {
    title: "Semangat Membara",
    artist: "Drama Arena Orchestra",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop",
    duration: 425
  },
  {
    title: "Langkah Kemenangan",
    artist: "Vocal Group 5101",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f56468?q=80&w=200&auto=format&fit=crop",
    duration: 344
  },
  {
    title: "Memori Indah",
    artist: "Acoustic Session",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=200&auto=format&fit=crop",
    duration: 302
  }
];

export default function SoundtrackPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const ytRef = useRef(null);
  const isYouTube = currentTrack?.audioUrl?.includes('youtube.com') || currentTrack?.audioUrl?.includes('youtu.be');
  const [isMobile, setIsMobile] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one

  useEffect(() => {
    loadTracks();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Suppress harmless browser AbortErrors caused by rapid play/pause
    const handleUnhandledRejection = (e) => {
      if (e.reason && e.reason.name === 'AbortError') {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (!isYouTube) {
        if (audioRef.current.src !== currentTrack.audioUrl) {
          audioRef.current.src = currentTrack.audioUrl;
        }
        if (isPlaying) {
          const p = audioRef.current.play();
          if (p !== undefined) {
            p.catch(error => {
              if (error.name !== 'AbortError') {
                console.warn("Playback prevented:", error);
                setIsPlaying(false);
              }
            });
          }
        } else {
          audioRef.current.pause();
        }
      } else {
        // If switched to YouTube, make sure native audio stops
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isYouTube, currentTrack]);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const data = await getAudios();
      setTracks(data);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
    setLoading(false);
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const skipNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    if (isShuffle) {
      let next = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && tracks[next].id === currentTrack.id) {
        next = (next + 1) % tracks.length;
      }
      playTrack(tracks[next]);
      return;
    }
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const next = (idx + 1) % tracks.length;
    playTrack(tracks[next]);
  };

  const skipPrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    if (isShuffle) {
      let prev = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && tracks[prev].id === currentTrack.id) {
        prev = (prev - 1 + tracks.length) % tracks.length;
      }
      playTrack(tracks[prev]);
      return;
    }
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const prev = (idx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prev]);
  };

  const handleEnded = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    if (repeatMode === 0 && !isShuffle && idx === tracks.length - 1) {
      setIsPlaying(false);
      return;
    }
    skipNext();
  };

  const seek = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = pct * duration;
    setCurrentTime(newTime);
    
    if (isYouTube && ytRef.current) {
      ytRef.current.seekTo(pct, 'fraction');
    } else if (!isYouTube && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = isMuted ? (volume || 1) : 0;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (s) => {
    if (isNaN(s)) return '0:00';
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: 'calc(100vh - 64px)', margin: '-32px -24px', borderRadius: '24px 24px 0 0', color: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: 'linear-gradient(to bottom, rgba(255,107,0,0.3), #121212)', opacity: 0.6, pointerEvents: 'none' }} />

      {/* Responsive Styles & Fire Particles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fireFloat {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }
        .fire-particle {
          position: absolute;
          background: radial-gradient(circle, rgba(255,150,0,1) 0%, rgba(255,50,0,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: fireFloat linear infinite;
        }
        .st-header {
          position: relative;
          margin-bottom: 32px;
          padding-top: 60px;
          min-height: 400px;
          display: flex;
          align-items: center;
        }
        .st-model-layer {
          position: absolute;
          top: -50px; left: -100px; right: -100px; bottom: -50px;
          pointer-events: none;
          z-index: 10;
        }
        .st-text-layer {
          margin-left: 450px;
          z-index: 20;
          position: relative;
        }
        .st-title {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0 0 16px 0;
          line-height: 1.1;
        }
        .st-meta {
          color: #b3b3b3;
          font-size: 14px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .st-header {
            flex-direction: column;
            padding-top: 24px;
            min-height: auto;
          }
          .st-model-layer {
            position: relative;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw;
            height: 350px;
            margin-left: -24px; /* offset container padding */
          }
          .st-text-layer {
            margin-left: 0;
            text-align: center;
            margin-top: -20px;
          }
          .st-title {
            font-size: 2.5rem;
          }
          .st-meta {
            justify-content: center;
          }
        }
      `}} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="fire-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50 + 50}%`,
            width: `${Math.random() * 15 + 10}px`,
            height: `${Math.random() * 15 + 10}px`,
            animationDuration: `${Math.random() * 2 + 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
      </div>

      <audio
        ref={audioRef}
        loop={repeatMode === 2}
        onTimeUpdate={(e) => { if (!isYouTube) setCurrentTime(e.target.currentTime); }}
        onDurationChange={(e) => { if (!isYouTube) setDuration(e.target.duration); }}
        onEnded={() => { if (!isYouTube) handleEnded(); }}
      />

      <ReactPlayer
        ref={ytRef}
        url={isYouTube ? currentTrack?.audioUrl : undefined}
        playing={isYouTube && isPlaying}
        loop={repeatMode === 2}
        volume={isMuted ? 0 : volume}
        onProgress={(state) => {
          if (isYouTube) {
            setCurrentTime(state.playedSeconds);
            if (ytRef.current) {
              const d = ytRef.current.getDuration();
              if (d && d !== duration) setDuration(d);
            }
          }
        }}
        onEnded={() => { if (isYouTube) handleEnded(); }}
        onError={(e) => {
          console.warn('Player Error:', e);
        }}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        width="1px"
        height="1px"
        playsinline={true}
      />

      {/* Main Content Area */}
      <div style={{ padding: isMobile ? '32px 24px 200px' : '32px 24px 120px', position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Playlist Header (Spotify Style) */}
        <div className="st-header">
          
          {/* Edge-to-Edge 3D Canvas Layer */}
          <div className="st-model-layer">
            <Hero3DModel 
              inline={true} 
              animateOnMount={true} 
              hideSparkles={true} 
              pointerEvents="auto"
              modelPosition={isMobile ? [0, 0, 0] : [-3.5, 0, 0]}
              modelScale={isMobile ? 3.0 : 3.5}
            />
          </div>

          <div className="st-text-layer">
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Playlist</span>
            <h1 className="st-title">
              Soundtrack<br/>DA 5101
            </h1>
            <p className="st-meta">
              <span style={{ color: 'white', fontWeight: 600 }}>Drama Arena 5101</span>
              <span>•</span>
              <span>{tracks.length} lagu</span>
              <span>•</span>
              <span>Koleksi lagu resmi dari penampilan spesial</span>
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#FF6B00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 20 }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <button 
                onClick={() => tracks.length > 0 && playTrack(tracks[0])}
                style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#FF6B00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 8px 16px rgba(255,107,0,0.4)' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Play size={24} color="white" fill="white" style={{ marginLeft: 4 }} />
              </button>
            </div>

            {/* Track List Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#b3b3b3', fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
              <div style={{ width: 40, textAlign: 'center' }}>#</div>
              <div style={{ flex: 1 }}>JUDUL</div>
              <div style={{ width: 100, textAlign: 'right', paddingRight: 32 }}><span style={{ display: 'inline-block' }}>WAKTU</span></div>
            </div>

            {/* Track List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tracks.map((track, index) => {
                const isActive = currentTrack?.id === track.id;
                return (
                  <div 
                    key={track.id}
                    onClick={() => playTrack(track)}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '40px 1fr 100px', 
                      alignItems: 'center', 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                    onMouseOut={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    
                    {/* Number / Play Icon */}
                    <div style={{ textAlign: 'center', color: isActive ? '#FF6B00' : '#b3b3b3', fontSize: 15 }}>
                      {isActive && isPlaying ? (
                        <div style={{ display: 'flex', gap: 2, height: 14, justifyContent: 'center', alignItems: 'flex-end' }}>
                          <div style={{ width: 3, height: '100%', backgroundColor: '#FF6B00', animation: 'bounce 1s infinite' }} />
                          <div style={{ width: 3, height: '70%', backgroundColor: '#FF6B00', animation: 'bounce 1s infinite 0.2s' }} />
                          <div style={{ width: 3, height: '40%', backgroundColor: '#FF6B00', animation: 'bounce 1s infinite 0.4s' }} />
                        </div>
                      ) : (
                        <>
                          <span style={{ display: 'block' }}>{index + 1}</span>
                        </>
                      )}
                    </div>

                    {/* Title and Artist */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: '#282828', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {track.coverUrl ? (
                          <img 
                            src={track.coverUrl} 
                            alt={track.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        <ListMusic size={20} color="#b3b3b3" style={{ display: track.coverUrl ? 'none' : 'block' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ color: isActive ? '#FF6B00' : 'white', fontSize: 16, fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {track.title}
                        </span>
                        <span style={{ color: '#b3b3b3', fontSize: 14, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {track.artist || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{ color: '#b3b3b3', fontSize: 14, display: 'flex', justifyContent: 'flex-end', paddingRight: 32 }}>
                      {formatTime(track.duration)}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Player Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .st-player {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 800px;
          height: 80px;
          background-color: rgba(24, 24, 24, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          z-index: 100;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }
        .st-player-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .st-player-center {
          flex: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 500px;
        }
        .st-player-right {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .st-cover {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #282828;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        @media (max-width: 768px) {
          .st-player {
            left: 50%;
            bottom: 16px;
            width: calc(100% - 32px);
            height: auto;
            padding: 12px 16px;
            border-radius: 24px;
            flex-direction: column;
            gap: 12px;
          }
          .st-player-left {
            width: 100%;
            flex: none;
          }
          .st-player-center {
            width: 100%;
            flex: none;
            max-width: 100%;
          }
          .st-player-right {
            display: none; /* Hide volume on mobile to save space */
          }
        }
      `}} />

      {/* Floating Sticky Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 150, x: '-50%', opacity: 0 }} 
            animate={{ y: 0, x: '-50%', opacity: 1 }} 
            exit={{ y: 150, x: '-50%', opacity: 0 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="st-player"
          >
            {/* Left: Track Info */}
            <div className="st-player-left">
              <div className="st-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentTrack.coverUrl ? (
                  <img 
                    src={currentTrack.coverUrl} 
                    alt={currentTrack.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                  />
                ) : null}
                <ListMusic size={24} color="#b3b3b3" style={{ display: currentTrack.coverUrl ? 'none' : 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingRight: 8 }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.title}
                </span>
                <span style={{ color: '#b3b3b3', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.artist}
                </span>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="st-player-center">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
                <button onClick={() => setIsShuffle(!isShuffle)} style={{ background: 'none', border: 'none', color: isShuffle ? '#FF6B00' : '#b3b3b3', cursor: 'pointer' }}><Shuffle size={16} /></button>
                <button onClick={skipPrev} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><SkipBack size={20} fill="currentColor" /></button>
                <button 
                  onClick={togglePlay} 
                  style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#FF6B00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 4px 12px rgba(255,107,0,0.4)' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? <Pause size={20} color="white" fill="white" /> : <Play size={20} color="white" fill="white" style={{ marginLeft: 2 }} />}
                </button>
                <button onClick={skipNext} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><SkipForward size={20} fill="currentColor" /></button>
                <button onClick={() => setRepeatMode((repeatMode + 1) % 3)} style={{ background: 'none', border: 'none', color: repeatMode > 0 ? '#FF6B00' : '#b3b3b3', cursor: 'pointer', position: 'relative' }}>
                  <Repeat size={16} />
                  {repeatMode === 2 && <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 9, fontWeight: 800, background: '#FF6B00', color: 'white', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>}
                </button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', userSelect: 'none' }}>
                <span style={{ color: '#b3b3b3', fontSize: 11, minWidth: 32, textAlign: 'right' }}>{formatTime(currentTime)}</span>
                <div 
                  className="progress-bar-container"
                  style={{ flex: 1, padding: '8px 0', cursor: 'pointer', position: 'relative' }}
                  onClick={seek}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                    .progress-bar-container:hover .progress-bar-thumb { display: block !important; }
                  `}} />
                  <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, position: 'relative' }}>
                    <div className="progress-bar-fill" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${duration ? (currentTime / duration) * 100 : 0}%`, backgroundColor: 'white', borderRadius: 2 }}>
                      <div className="progress-bar-thumb" style={{ position: 'absolute', right: -6, top: -4, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'white', display: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
                    </div>
                  </div>
                </div>
                <span style={{ color: '#b3b3b3', fontSize: 11, minWidth: 32 }}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume */}
            <div className="st-player-right">
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div style={{ width: 80, height: 12, display: 'flex', alignItems: 'center' }} className="progress-bar-container">
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange} 
                  style={{ width: '100%', height: 4, appearance: 'none', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          display: none;
        }
        .progress-bar-container:hover input[type='range']::-webkit-slider-thumb {
          display: block;
        }
        @media (max-width: 768px) {
          .spotify-player {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
