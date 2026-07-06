'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDirectImageUrl } from '@/lib/utils';

import { VIDEO_CATEGORIES, PHOTO_CATEGORIES } from '@/lib/utils';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    theme: 'default',
    logoUrl: '',
    faviconUrl: '',
    heroImageUrl: '',
    welcomeImageUrl: '',
    videoCategories: VIDEO_CATEGORIES.filter(c => c.value !== 'all'),
    photoCategories: PHOTO_CATEGORIES.filter(c => c.value !== 'all'),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time changes in settings/general
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          theme: data.theme || 'default',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          heroImageUrl: data.heroImageUrl || '',
          welcomeImageUrl: data.welcomeImageUrl || '',
          googleDriveApiKey: data.googleDriveApiKey || '',
          videoCategories: data.videoCategories || VIDEO_CATEGORIES.filter(c => c.value !== 'all'),
          photoCategories: data.photoCategories || PHOTO_CATEGORIES.filter(c => c.value !== 'all'),
          showVideo: data.showVideo !== false,
          showGallery: data.showGallery !== false,
          showComic: data.showComic !== false,
          showSoundtrack: data.showSoundtrack !== false,
          showBonus: data.showBonus !== false,
          showRewards: data.showRewards !== false,
        });
        
        // Apply theme data attribute to the <html> tag for CSS variables to kick in
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', data.theme || 'default');
          
          if (data.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = getDirectImageUrl(data.faviconUrl);
          }
        }
      } else {
        // Create default settings document if it doesn't exist
        setDoc(docRef, { theme: 'default' }, { merge: true });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
