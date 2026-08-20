'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Captions,
} from 'lucide-react';

function getCleanVideoInfo(rawUrl) {
  console.log('[CustomVideoPlayer] getCleanVideoInfo received rawUrl:', rawUrl);
  if (!rawUrl || typeof rawUrl !== 'string') {
    console.log('[CustomVideoPlayer] Invalid rawUrl type or empty');
    return { type: 'invalid', url: '' };
  }
  const url = rawUrl.trim();

  // 1. YouTube 11-character video ID match (watch?v=, youtu.be/, embed/)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    console.log('[CustomVideoPlayer] matched YouTube ID:', ytMatch[1]);
    return {
      type: 'youtube',
      url: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
      id: ytMatch[1]
    };
  }

  // 2. Google Drive video file match
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    console.log('[CustomVideoPlayer] matched Google Drive ID:', driveMatch[1]);
    return {
      type: 'gdrive',
      url: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      id: driveMatch[1]
    };
  }

  // 3. Direct video files (mp4, webm, ogv, m3u8) or valid http/https URLs (excluding emails)
  if (!url.includes('@') && (/\.(mp4|webm|ogv|m3u8)(\?.*)?$/i.test(url) || url.startsWith('http://') || url.startsWith('https://'))) {
    console.log('[CustomVideoPlayer] matched Direct URL:', url);
    return {
      type: 'direct',
      url: url
    };
  }

  console.log('[CustomVideoPlayer] URL did not match any known types, returning invalid:', url);
  return { type: 'invalid', url: url };
}

export default function CustomVideoPlayer({ videoUrl, title, poster }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);

  const [hasMounted, setHasMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);

  // Settings menu, Subtitles & Volume hover states
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main'); // 'main' | 'quality' | 'speed' | 'subtitles'
  const [quality, setQuality] = useState('auto');
  const [subtitleTrack, setSubtitleTrack] = useState('off'); // 'off' | 'id' | 'en'
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Hover tooltip state for seek bar
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);

  // Animated feedback icon overlay (Play/Pause indicator on click)
  const [centerFeedback, setCenterFeedback] = useState(null);

  // Auto-hide controls timer
  const hideControlsTimer = useRef(null);

  const videoInfo = getCleanVideoInfo(videoUrl);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls auto-hide trigger on mouse move
  const triggerControlsActivity = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);

    if (playing) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsMenu(false);
      }, 3000);
    }
  }, [playing]);

  const handleMouseMove = () => {
    triggerControlsActivity();
  };

  const handleMouseLeave = () => {
    if (playing && !showSettingsMenu && !seeking) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  // Play / Pause Toggle
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (ended) {
      playerRef.current?.seekTo(0);
      setEnded(false);
      setPlaying(true);
      return;
    }

    const nextState = !playing;
    setPlaying(nextState);
    triggerControlsActivity();

    // Trigger visual feedback icon
    setCenterFeedback(nextState ? 'play' : 'pause');
    setTimeout(() => setCenterFeedback(null), 600);
  };

  // Fullscreen Toggle
  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Handle double click for fullscreen
  const handleContainerDoubleClick = (e) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  // Mute Toggle
  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  // Volume Change
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && muted) setMuted(false);
    if (newVol === 0 && !muted) setMuted(true);
  };

  // Progress Update from ReactPlayer
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
    }
    setIsBuffering(false);
  };

  // Seek Drag & Click Handler
  const getSeekFractionFromEvent = (e) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    return Math.max(0, Math.min(1, offsetX / rect.width));
  };

  const handleSeekMouseDown = (e) => {
    e.stopPropagation();
    setSeeking(true);
    const fraction = getSeekFractionFromEvent(e);
    setPlayed(fraction);
    setPlayedSeconds(fraction * duration);
  };

  const handleSeekMouseMove = useCallback((e) => {
    if (!progressBarRef.current) return;
    const fraction = getSeekFractionFromEvent(e);
    setHoverTime(fraction * duration);
    setHoverPos(fraction * 100);

    if (seeking) {
      setPlayed(fraction);
      setPlayedSeconds(fraction * duration);
    }
  }, [seeking, duration]);

  const handleSeekMouseUp = useCallback((e) => {
    if (seeking) {
      const fraction = getSeekFractionFromEvent(e);
      setSeeking(false);
      setPlayed(fraction);
      playerRef.current?.seekTo(fraction, 'fraction');
      if (ended) setEnded(false);
    }
  }, [seeking, ended]);

  useEffect(() => {
    if (seeking) {
      const onMove = (e) => handleSeekMouseMove(e);
      const onUp = (e) => handleSeekMouseUp(e);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
    }
  }, [seeking, handleSeekMouseMove, handleSeekMouseUp]);

  // Format Time Helper
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null) return '00:00';
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (duration >= 3600 || hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Speed, Quality & Subtitle Selectors
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const qualities = [
    { id: 'auto', label: 'Otomatis', badge: 'HD' },
    { id: '1080p', label: '1080p', badge: 'FHD' },
    { id: '720p', label: '720p', badge: 'HD' },
    { id: '480p', label: '480p', badge: 'SD' },
    { id: '360p', label: '360p', badge: 'SD' },
  ];
  const subtitleOptions = [
    { id: 'off', label: 'Nonaktif' },
    { id: 'id', label: 'Bahasa Indonesia' },
    { id: 'en', label: 'English' },
  ];

  const handleSpeedSelect = (rate, e) => {
    if (e) e.stopPropagation();
    setPlaybackRate(rate);
    setSettingsTab('main');
    setShowSettingsMenu(false);
  };

  const handleQualitySelect = (qId, e) => {
    if (e) e.stopPropagation();
    setQuality(qId);
    setSettingsTab('main');
    setShowSettingsMenu(false);
    
    try {
      const internal = playerRef.current?.getInternalPlayer();
      if (internal && typeof internal.setPlaybackQuality === 'function') {
        internal.setPlaybackQuality(qId === 'auto' ? 'default' : qId);
      }
    } catch (err) {
      console.log('Quality change requested:', qId);
    }
  };

  const handleSubtitleSelect = (subId, e) => {
    if (e) e.stopPropagation();
    setSubtitleTrack(subId);
    setSettingsTab('main');
    setShowSettingsMenu(false);

    try {
      const internal = playerRef.current?.getInternalPlayer();
      if (internal) {
        if (subId === 'off') {
          if (typeof internal.unloadModule === 'function') {
            internal.unloadModule('captions');
          }
          if (typeof internal.setOption === 'function') {
            internal.setOption('captions', 'track', {});
          }
        } else {
          if (typeof internal.loadModule === 'function') {
            internal.loadModule('captions');
          }
          if (typeof internal.setOption === 'function') {
            internal.setOption('captions', 'track', { languageCode: subId });
          }
        }
      }
    } catch (err) {
      console.log('Subtitle change requested:', subId);
    }
  };

  if (!hasMounted) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={36} color="#FF6B00" />
      </div>
    );
  }

  // INVALID URL STATE UI
  if (videoInfo.type === 'invalid') {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#0A0810',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <AlertCircle size={48} color="#FF6B00" />
        <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0, fontFamily: 'var(--font-body)' }}>
          URL Video Tidak Valid
        </h3>
        <p style={{ color: '#A0A0A0', fontSize: 14, maxWidth: 480, margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
          Tautan <code style={{ color: '#FF6B00', backgroundColor: 'rgba(255,107,0,0.1)', padding: '2px 8px', borderRadius: 4, wordBreak: 'break-all' }}>{videoUrl || '(kosong)'}</code> bukan merupakan URL video YouTube atau Google Drive yang valid. Silakan perbarui tautan video melalui Admin Panel.
        </p>
      </div>
    );
  }

  // GOOGLE DRIVE EMBED FALLBACK UI
  if (videoInfo.type === 'gdrive') {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#000000',
          borderRadius: isFullscreen ? 0 : 16,
          overflow: 'hidden',
          aspectRatio: '16/9',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <iframe
          src={videoInfo.url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        {/* Interaction overlay for Google Drive title pop-out icon */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, zIndex: 10, cursor: 'default' }} title=" " />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        aspectRatio: '16/9',
        maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 120px)',
      }}
    >
      {/* REACT PLAYER ENGINE */}
      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoInfo.url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={(d) => {
            setDuration(d);
            setIsBuffering(false);
          }}
          onBuffer={() => setIsBuffering(true)}
          onBufferEnd={() => setIsBuffering(false)}
          onReady={() => {
            setIsBuffering(false);
            setError(false);
          }}
          onStart={() => setIsBuffering(false)}
          onPlay={() => {
            setPlaying(true);
            setIsBuffering(false);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
            setShowControls(true);
          }}
          onError={() => {
            setError(true);
            setIsBuffering(false);
          }}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                disablekb: 1,
                iv_load_policy: 3,
                fs: 0,
                cc_load_policy: subtitleTrack !== 'off' ? 1 : 0,
                cc_lang_pref: subtitleTrack !== 'off' ? subtitleTrack : undefined,
                autohide: 1,
              },
            },
          }}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>

      {/* TRANSPARENT SHIELD & CLICK OVERLAY */}
      <div
        onClick={togglePlay}
        onDoubleClick={handleContainerDoubleClick}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          cursor: 'pointer',
          background: 'transparent',
        }}
      />

      {/* CENTER ANIMATED FEEDBACK RIPPLE */}
      {centerFeedback && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6B00',
            animation: 'pingFade 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        >
          {centerFeedback === 'play' ? <Play size={36} fill="#FF6B00" /> : <Pause size={36} fill="#FF6B00" />}
        </div>
      )}

      {/* ENDED STATE OVERLAY */}
      {ended && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 14,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FF6B00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(255,107,0,0.4)', transition: 'transform 0.2s',
          }}>
            <RotateCcw size={32} color="#ffffff" />
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-body)' }}>
            Putar Ulang Video
          </span>
        </div>
      )}

      {/* LOADING / BUFFERING SPINNER (NO DUPLICATE STACKING) */}
      {isBuffering && !error && !ended && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            pointerEvents: 'none',
            backgroundColor: played === 0 ? '#000000' : (videoInfo.type === 'youtube' ? 'transparent' : 'rgba(0,0,0,0.5)'),
            backdropFilter: played === 0 ? 'blur(8px)' : 'none',
          }}
        >
          {!(videoInfo.type === 'youtube' && played > 0) && (
            <>
              <Loader2 size={44} color="#FF6B00" className="animate-spin" />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)' }}>Memuat Video...</span>
            </>
          )}
        </div>
      )}

      {/* ERROR STATE UI */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            backgroundColor: '#0A0810',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <AlertCircle size={48} color="#ef4444" />
          <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0 }}>Gagal Memutar Video</h3>
          <p style={{ color: '#A0A0A0', fontSize: 14, maxWidth: 400, margin: 0, lineHeight: 1.5 }}>
            Video tidak dapat dimuat atau terjadi gangguan pada koneksi. Silakan periksa jaringan Anda atau coba muat ulang halaman.
          </p>
        </div>
      )}

      {/* TOP GRADIENT & TITLE SHADOW */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 11,
          pointerEvents: 'none',
          opacity: showControls || !playing ? 1 : 0,
          transition: 'opacity 0.3s ease',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      </div>

      {/* BOTTOM CUSTOM CONTROL BAR */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)',
          padding: '24px 20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          opacity: showControls || !playing || showSettingsMenu ? 1 : 0,
          transform: showControls || !playing || showSettingsMenu ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: showControls || !playing || showSettingsMenu ? 'auto' : 'none',
        }}
      >
        {/* CUSTOM SEEK / PROGRESS BAR */}
        <div
          ref={progressBarRef}
          onMouseDown={handleSeekMouseDown}
          onMouseMove={handleSeekMouseMove}
          onMouseLeave={() => {
            setHoverTime(null);
            setHoverPos(null);
          }}
          onTouchStart={handleSeekMouseDown}
          style={{
            position: 'relative',
            width: '100%',
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'height 0.15s ease',
          }}
        >
          {/* HOVER TIMESTAMP TOOLTIP */}
          {hoverTime !== null && hoverPos !== null && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: `${hoverPos}%`,
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* ACTIVE PROGRESS BAR (ORANGE) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${played * 100}%`,
              backgroundColor: '#FF6B00',
              borderRadius: 4,
              boxShadow: '0 0 10px rgba(255, 107, 0, 0.5)',
            }}
          />

          {/* PROGRESS HANDLE / THUMB */}
          <div
            style={{
              position: 'absolute',
              left: `${played * 100}%`,
              transform: 'translateX(-50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '2px solid #FF6B00',
              boxShadow: '0 0 8px rgba(255, 107, 0, 0.8)',
              pointerEvents: 'none',
              transition: seeking ? 'none' : 'transform 0.1s ease',
            }}
          />
        </div>

        {/* CONTROLS ROW */}
        <div className="player-controls-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          
          {/* LEFT: PLAY/PAUSE, VOLUME, TIME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
            >
              {ended ? (
                <RotateCcw size={20} />
              ) : playing ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" />
              )}
            </button>

            {/* Volume Control & Slider */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: muted || volume === 0 ? '#ef4444' : '#ffffff',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              {/* Volume Slider Dropdown / Expand */}
              <div
                className="volume-slider-box"
                style={{
                  width: showVolumeSlider ? 60 : 0,
                  overflow: 'hidden',
                  transition: 'width 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: showVolumeSlider ? 4 : 0,
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: 50,
                    height: 4,
                    accentColor: '#FF6B00',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Time Indicator */}
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              <span>{formatTime(playedSeconds)}</span>
              <span style={{ margin: '0 3px', opacity: 0.5 }}>/</span>
              <span style={{ opacity: 0.7 }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT: SETTINGS MENU & FULLSCREEN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Settings Selector Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(!showSettingsMenu);
                  setSettingsTab('main');
                }}
                style={{
                  background: showSettingsMenu ? 'rgba(255,107,0,0.2)' : 'none',
                  border: '1px solid',
                  borderColor: showSettingsMenu ? '#FF6B00' : 'rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  color: showSettingsMenu ? '#FF6B00' : 'rgba(255,255,255,0.9)',
                  padding: '4px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Pengaturan Video (Kualitas & Kecepatan)"
              >
                <Settings size={16} />
                <span className="speed-text-label">Pengaturan</span>
              </button>

              {showSettingsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 34,
                    right: 0,
                    backgroundColor: 'rgba(15, 12, 24, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 190,
                    zIndex: 50,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* MAIN TAB */}
                  {settingsTab === 'main' && (
                    <>
                      <div style={{ padding: '4px 14px 8px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        Pengaturan Video
                      </div>

                      {/* Quality menu item */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('quality'); }}
                        style={{
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.9)' }}>Kualitas</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF6B00', fontSize: 12 }}>
                          <span>{quality === 'auto' ? 'Otomatis' : quality}</span>
                          <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                      </button>

                      {/* Speed menu item */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('speed'); }}
                        style={{
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.9)' }}>Kecepatan</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF6B00', fontSize: 12 }}>
                          <span>{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                          <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                      </button>
                      {/* Subtitle menu item */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('subtitles'); }}
                        style={{
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)' }}>
                          <Captions size={15} color="rgba(255,255,255,0.7)" />
                          <span>Subtitle (CC)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF6B00', fontSize: 12 }}>
                          <span>
                            {subtitleTrack === 'off'
                              ? 'Nonaktif'
                              : subtitleOptions.find((s) => s.id === subtitleTrack)?.label || 'Aktif'}
                          </span>
                          <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                      </button>
                    </>
                  )}

                  {/* QUALITY TAB */}
                  {settingsTab === 'quality' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('main'); }}
                        style={{
                          padding: '6px 12px 8px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <ChevronLeft size={14} />
                        <span>Kualitas Video</span>
                      </button>

                      {qualities.map((q) => (
                        <button
                          key={q.id}
                          onClick={(e) => handleQualitySelect(q.id, e)}
                          style={{
                            padding: '8px 14px',
                            background: quality === q.id ? 'rgba(255, 107, 0, 0.15)' : 'none',
                            border: 'none',
                            color: quality === q.id ? '#FF6B00' : 'white',
                            fontSize: 13,
                            fontWeight: quality === q.id ? 600 : 400,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={(e) => { if (quality !== q.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={(e) => { if (quality !== q.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{q.label}</span>
                            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>{q.badge}</span>
                          </div>
                          {quality === q.id && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF6B00' }} />}
                        </button>
                      ))}
                    </>
                  )}

                  {/* SPEED TAB */}
                  {settingsTab === 'speed' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('main'); }}
                        style={{
                          padding: '6px 12px 8px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <ChevronLeft size={14} />
                        <span>Kecepatan Pemutaran</span>
                      </button>

                      {speeds.map((rate) => (
                        <button
                          key={rate}
                          onClick={(e) => handleSpeedSelect(rate, e)}
                          style={{
                            padding: '8px 14px',
                            background: playbackRate === rate ? 'rgba(255, 107, 0, 0.15)' : 'none',
                            border: 'none',
                            color: playbackRate === rate ? '#FF6B00' : 'white',
                            fontSize: 13,
                            fontWeight: playbackRate === rate ? 600 : 400,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={(e) => { if (playbackRate !== rate) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={(e) => { if (playbackRate !== rate) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span>{rate === 1.0 ? 'Normal (1.0x)' : `${rate}x`}</span>
                          {playbackRate === rate && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF6B00' }} />}
                        </button>
                      ))}
                    </>
                  )}

                  {/* SUBTITLES TAB */}
                  {settingsTab === 'subtitles' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsTab('main'); }}
                        style={{
                          padding: '6px 12px 8px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <ChevronLeft size={14} />
                        <span>Subtitle / Teks</span>
                      </button>

                      {subtitleOptions.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={(e) => handleSubtitleSelect(sub.id, e)}
                          style={{
                            padding: '8px 14px',
                            background: subtitleTrack === sub.id ? 'rgba(255, 107, 0, 0.15)' : 'none',
                            border: 'none',
                            color: subtitleTrack === sub.id ? '#FF6B00' : 'white',
                            fontSize: 13,
                            fontWeight: subtitleTrack === sub.id ? 600 : 400,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={(e) => { if (subtitleTrack !== sub.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={(e) => { if (subtitleTrack !== sub.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span>{sub.label}</span>
                          {subtitleTrack === sub.id && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF6B00' }} />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
              title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pingFade {
          0% {
            transform: translate(-50%, -50%) scale(0.7);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
        }

        @media (max-width: 640px) {
          .speed-text-label {
            display: none !important;
          }
          .volume-slider-box {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
