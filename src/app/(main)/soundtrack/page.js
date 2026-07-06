'use client';

import { useState, useEffect, useRef } from 'react';
import { getAudios } from '@/lib/firestore';
import { motion } from 'framer-motion';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

export default function SoundtrackPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    loadTracks();
  }, []);

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
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play();
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const next = (idx + 1) % tracks.length;
    playTrack(tracks[next]);
  };

  const skipPrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const prev = (idx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prev]);
  };

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial="hidden" animate="visible">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={skipNext}
      />

      {/* Header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <p className="caption-uppercase" style={{ color: 'var(--primary)', marginBottom: 8 }}>SOUNDTRACK</p>
        <h1 className="display-md" style={{ marginBottom: 8 }}>
          <span style={{ color: 'var(--primary)' }}>Soundtrack</span> Acara
        </h1>
        <p className="body-md" style={{ color: 'var(--muted)' }}>
          Koleksi audio resmi Pentas Seni Drama Arena 5101.
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <motion.div variants={fadeUp} custom={1} style={{ textAlign: 'center', padding: 'var(--space-section) 0' }}>
          <Music2 size={48} color="var(--muted-soft)" style={{ margin: '0 auto 16px' }} />
          <h3 className="title-md" style={{ marginBottom: 8 }}>Belum Ada Soundtrack</h3>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            Soundtrack akan segera ditambahkan. Nantikan!
          </p>
        </motion.div>
      ) : (
        <>
          {/* Track List */}
          <motion.div variants={fadeUp} custom={1}>
            <div style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              {tracks.map((track, i) => {
                const isActive = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 24px',
                      borderBottom: i < tracks.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                      backgroundColor: isActive ? 'var(--surface-cream-strong)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Track number / Play icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--canvas)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isActive && isPlaying ? (
                        <Pause size={18} color={isActive ? 'var(--on-primary)' : 'var(--ink)'} />
                      ) : (
                        <Play size={18} color={isActive ? 'var(--on-primary)' : 'var(--ink)'} fill={isActive ? 'var(--on-primary)' : 'var(--ink)'} />
                      )}
                    </div>

                    {/* Track info */}
                    <div style={{ flex: 1 }}>
                      <div className="title-sm" style={{ color: isActive ? 'var(--primary)' : 'var(--ink)', marginBottom: 2 }}>
                        {track.title}
                      </div>
                      {track.artist && (
                        <div className="body-sm" style={{ color: 'var(--muted)', fontSize: 13 }}>
                          {track.artist}
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <span className="caption" style={{ color: 'var(--muted-soft)' }}>
                      {track.duration ? formatTime(track.duration) : '--:--'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Sticky Player */}
          {currentTrack && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                position: 'fixed', bottom: 0, left: 260, right: 0,
                backgroundColor: 'var(--surface-dark)',
                padding: '16px 24px',
                zIndex: 30,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
              className="audio-player-bar"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: 800, margin: '0 auto' }}>
                {/* Track info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--on-dark)', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentTrack.title}
                  </div>
                  {currentTrack.artist && (
                    <div style={{ color: 'var(--on-dark-soft)', fontSize: 12 }}>{currentTrack.artist}</div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={skipPrev} style={{ background: 'none', border: 'none', color: 'var(--on-dark-soft)', cursor: 'pointer', padding: 4 }}>
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={togglePlay}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      backgroundColor: 'var(--primary)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={20} color="white" />
                    ) : (
                      <Play size={20} color="white" fill="white" />
                    )}
                  </button>
                  <button onClick={skipNext} style={{ background: 'none', border: 'none', color: 'var(--on-dark-soft)', cursor: 'pointer', padding: 4 }}>
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Progress */}
                <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--on-dark-soft)', fontSize: 12, minWidth: 40, textAlign: 'right' }}>
                    {formatTime(currentTime)}
                  </span>
                  <div
                    onClick={seek}
                    style={{
                      flex: 1, height: 4, backgroundColor: 'var(--surface-dark-elevated)',
                      borderRadius: 2, cursor: 'pointer', position: 'relative',
                    }}
                  >
                    <div style={{
                      height: '100%', width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      backgroundColor: 'var(--primary)', borderRadius: 2,
                      transition: 'width 0.1s linear',
                    }} />
                  </div>
                  <span style={{ color: 'var(--on-dark-soft)', fontSize: 12, minWidth: 40 }}>
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .audio-player-bar {
            left: 0 !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
