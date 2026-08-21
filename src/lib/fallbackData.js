// Backup static fallback data for when Firebase Firestore reaches free plan read limits (50,000 reads/day)
// This guarantees that EVEN NEW VISITORS with empty LocalStorage will see full content without blank screens!

export const FALLBACK_VIDEOS = [
  {
    id: 'fallback-v1',
    title: 'Grand Opening: "OST DA 5101"',
    category: 'babak1, music',
    order: 1,
    videoUrl: 'https://youtu.be/example1',
    thumbnailUrl: '',
    description: 'Penampilan pembukaan megah persembahan Drama Arena 5101.'
  },
  {
    id: 'fallback-v2',
    title: 'Visual "Semangat Al-Akhku"',
    category: 'babak1, visual',
    order: 2,
    videoUrl: 'https://youtu.be/example2',
    thumbnailUrl: '',
    description: 'Visual tayangan spesial persembahan santri 5101.'
  }
];

export const FALLBACK_AUDIOS = [];
export const FALLBACK_DOCUMENTS = [];
export const FALLBACK_PHOTOS = [];
