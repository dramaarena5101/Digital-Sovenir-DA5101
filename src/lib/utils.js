// Utility functions

// Format date to Indonesian locale
export function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Format date with time
export function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Truncate text
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Get direct image URL (useful for Google Drive image links)
export function getDirectImageUrl(url) {
  if (!url) return '';
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    // Using thumbnail endpoint is much more reliable for <img> tags without CORS/Cookie issues
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }
  return url;
}

// Generate Embed URL from various formats (YouTube & Google Drive)
export function getVideoEmbedUrl(url) {
  if (!url) return '';
  
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // Already an embed URL (YouTube)
  if (url.includes('youtube.com/embed/')) {
    const separator = url.includes('?') ? '&' : '?';
    if (!url.includes('modestbranding')) {
      return `${url}${separator}modestbranding=1&rel=0`;
    }
    return url;
  }
  
  let videoId = '';
  
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
  }
  
  return url;
}

// Get video thumbnail from URL
export function getVideoThumbnailUrl(url) {
  if (!url) return '';
  
  // Google Drive doesn't have a direct, public thumbnail URL without API key.
  // We return empty so the UI falls back to a placeholder or play button.
  if (url.includes('drive.google.com')) return '';

  let videoId = '';
  
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) videoId = embedMatch[1];
  
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  return '';
}

// Video categories
export const VIDEO_CATEGORIES = [
  { value: 'all', label: 'Semua' },
  { value: 'opening', label: 'Opening Ceremony' },
  { value: 'drama-arab', label: 'Drama Bahasa Arab' },
  { value: 'drama-english', label: 'Drama Bahasa Inggris' },
  { value: 'drama-indonesia', label: 'Drama Bahasa Indonesia' },
  { value: 'choir', label: 'Choir' },
  { value: 'orchestra', label: 'Orchestra' },
  { value: 'tari', label: 'Tari Nusantara' },
  { value: 'pidato', label: 'Pidato' },
  { value: 'closing', label: 'Closing Ceremony' },
  { value: 'special', label: 'Penampilan Khusus' },
  { value: 'dokumentasi', label: 'Dokumentasi Lengkap' },
];

// Photo categories
export const PHOTO_CATEGORIES = [
  { value: 'all', label: 'Semua' },
  { value: 'backstage', label: 'Backstage' },
  { value: 'persiapan', label: 'Persiapan' },
  { value: 'gladi', label: 'Gladi Bersih' },
  { value: 'acara-utama', label: 'Acara Utama' },
  { value: 'penampilan', label: 'Penampilan' },
  { value: 'penonton', label: 'Penonton' },
  { value: 'panitia', label: 'Dokumentasi Panitia' },
];

// Reward types
export const REWARD_TYPES = [
  { value: 'collector', label: '🏅 Digital Collector Badge', icon: '🏅' },
  { value: 'certificate', label: '📜 Digital Appreciation Certificate', icon: '📜' },
  { value: 'early_supporter', label: '🎖 Early Supporter Badge', icon: '🎖' },
  { value: 'premium', label: '⭐ Premium Supporter Badge', icon: '⭐' },
  { value: 'mystery', label: '🎁 Mystery Bonus Content', icon: '🎁' },
  { value: 'anniversary', label: '🎊 Anniversary Unlock', icon: '🎊' },
];

// Navigation items for user dashboard
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', icon: 'Home' },
  { href: '/videos', label: 'Video Penampilan', icon: 'Video' },
  { href: '/gallery', label: 'Galeri Foto', icon: 'Camera' },
  { href: '/comic', label: 'Komik Digital', icon: 'BookOpen' },
  { href: '/soundtrack', label: 'Soundtrack', icon: 'Music' },
  { href: '/bonus', label: 'Bonus Content', icon: 'Gift' },
  { href: '/rewards', label: 'Reward Saya', icon: 'Award' },
  { href: '/profile', label: 'Profil', icon: 'User' },
];

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/videos', label: 'Video', icon: 'Video' },
  { href: '/admin/photos', label: 'Foto', icon: 'Camera' },
  { href: '/admin/audio', label: 'Audio', icon: 'Music' },
  { href: '/admin/documents', label: 'Komik / Dokumen', icon: 'FileText' },
  { href: '/admin/rewards', label: 'Reward', icon: 'Award' },
  { href: '/admin/codes', label: 'Kode Aktivasi', icon: 'Key' },
  { href: '/admin/stats', label: 'Statistik', icon: 'BarChart3' },
  { href: '/admin/settings', label: 'Pengaturan Theme', icon: 'Settings' },
];

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
