'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Play, Camera, BookOpen, Music, Gift, Award } from 'lucide-react';

import DefaultTheme from '@/components/themes/DefaultTheme';
import ClaudeTheme from '@/components/themes/ClaudeTheme';
import SpotifyTheme from '@/components/themes/SpotifyTheme';
import PinterestTheme from '@/components/themes/PinterestTheme';
import LuxuryTheme from '@/components/themes/LuxuryTheme';
import GuidebookTheme from '@/components/themes/GuidebookTheme';

export default function LandingPage() {
  const router = useRouter();
  const { user, isActivated } = useAuth();
  const { settings, loading } = useSettings();
  const logoSrc = settings?.logoUrl || null;

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0A0810' }} />;
  }

  const features = [
    {
      icon: Play,
      title: 'Video Penampilan',
      description: 'Seluruh dokumentasi video acara dalam kualitas terbaik. Dari Opening hingga Closing Ceremony.',
      color: 'var(--primary)',
    },
    {
      icon: Camera,
      title: 'Galeri Foto',
      description: 'Album foto resmi acara. Backstage, persiapan, gladi bersih, hingga momen penampilan.',
      color: 'var(--accent-teal)',
    },
    {
      icon: BookOpen,
      title: 'Komik Digital',
      description: 'Versi digital dari komik yang Anda beli. Baca kapan saja, di mana saja.',
      color: 'var(--accent-amber)',
    },
    {
      icon: Music,
      title: 'Soundtrack',
      description: 'Koleksi audio resmi acara. Opening theme, lagu penutup, dan musik pengiring.',
      color: 'var(--success)',
    },
    {
      icon: Gift,
      title: 'Bonus Content',
      description: 'Konten eksklusif behind the scenes, wawancara, dan dokumentasi yang tidak ditampilkan saat acara.',
      color: 'var(--primary)',
    },
    {
      icon: Award,
      title: 'Digital Reward',
      description: 'Badge kolektor, sertifikat digital, dan konten rahasia hanya untuk Anda.',
      color: 'var(--accent-amber)',
    },
  ];

  const visibleFeatures = features.filter(item => {
    if (item.title === 'Video Penampilan' && settings?.showVideo === false) return false;
    if (item.title === 'Galeri Foto' && settings?.showGallery === false) return false;
    if (item.title === 'Komik Digital' && settings?.showComic === false) return false;
    if (item.title === 'Soundtrack' && settings?.showSoundtrack === false) return false;
    if (item.title === 'Bonus Content' && settings?.showBonus === false) return false;
    if (item.title === 'Digital Reward' && settings?.showRewards === false) return false;
    return true;
  });

  const handleCTA = () => {
    if (user && isActivated) {
      router.push('/dashboard');
    } else if (user) {
      router.push('/activate');
    } else {
      router.push('/login');
    }
  };

  const themeProps = {
    user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
  };

  const currentTheme = settings?.theme || 'guidebook';

  if (currentTheme === 'claude') return <ClaudeTheme {...themeProps} />;
  if (currentTheme === 'spotify') return <SpotifyTheme {...themeProps} />;
  if (currentTheme === 'pinterest') return <PinterestTheme {...themeProps} />;
  if (currentTheme === 'luxury') return <LuxuryTheme {...themeProps} />;
  if (currentTheme === 'guidebook') return <GuidebookTheme {...themeProps} />;
  
  return <DefaultTheme {...themeProps} />;
}
