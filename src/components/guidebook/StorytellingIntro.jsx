'use client';

import { useEffect, useState } from 'react';

export default function StorytellingIntro({ onComplete }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleMessage = (e) => {
      if (e.data === 'FINISH_INTRO') {
        onComplete();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#0A0810'
    }}>
      <iframe
        src="/intro.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Storytelling Intro"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
