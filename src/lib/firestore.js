import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  getCountFromServer,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

// =====================
// DATA VERSIONING
// =====================

export async function bumpDataVersion() {
  const docRef = doc(db, 'settings', 'general');
  return updateDoc(docRef, { dataVersion: increment(1) }).catch(e => console.error("Error bumping data version", e));
}

// =====================
// ACTIVATION CODES
// =====================

// Activate a code for a user
export async function activateCode(uid, code) {
  const codeRef = doc(db, 'activation_codes', code.toUpperCase().trim());
  const codeSnap = await getDoc(codeRef);

  if (!codeSnap.exists()) {
    return { success: false, error: 'Kode aktivasi tidak ditemukan.' };
  }

  const codeData = codeSnap.data();

  if (codeData.status === 'used') {
    return { success: false, error: 'Kode aktivasi sudah digunakan.' };
  }

  // Update activation code
  await updateDoc(codeRef, {
    status: 'used',
    usedBy: uid,
    usedDate: serverTimestamp(),
  });

  // Update user
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    activated: true,
    activationCode: code.toUpperCase().trim(),
    activationDate: serverTimestamp(),
  });

  return { success: true };
}

// Generate batch activation codes
export async function generateCodes(count, batch_name) {
  const codes = [];
  const batchWrite = writeBatch(db);

  for (let i = 0; i < count; i++) {
    const code = generateUniqueCode();
    const codeRef = doc(db, 'activation_codes', code);
    batchWrite.set(codeRef, {
      code,
      status: 'unused',
      usedBy: null,
      usedDate: null,
      batch: batch_name || `batch-${Date.now()}`,
      createdAt: serverTimestamp(),
    });
    codes.push(code);
  }

  await batchWrite.commit();
  return codes;
}

// Generate unique activation code (DA-XXXX-XXXX format)
function generateUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `DA-${part1}-${part2}`;
}

// Get all activation codes
export async function getActivationCodes(statusFilter) {
  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(collection(db, 'activation_codes'), where('status', '==', statusFilter));
  } else {
    q = query(collection(db, 'activation_codes'));
  }
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
}

export async function deleteActivationCode(codeId) {
  return deleteDoc(doc(db, 'activation_codes', codeId));
}

export async function checkIfUserExists(uid) {
  if (!uid) return false;
  const userSnap = await getDoc(doc(db, 'users', uid));
  return userSnap.exists();
}

// =====================
// CONTENT: VIDEOS
// =====================

export async function getVideos(category) {
  const CACHE_KEY = `da_videos_cache_${category || 'all'}`;
  const VERSION_CACHE_KEY = `da_videos_version_${category || 'all'}`;
  const now = Date.now();
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    const cachedVersion = localStorage.getItem(VERSION_CACHE_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    // Cek apakah versi masih sama persis
    if (cachedData && cachedVersion === globalVersion) {
      console.log("Using permanent versioned cache for videos.");
      return JSON.parse(cachedData);
    }
  }

  // Jika versi beda atau cache belum ada, ambil semua data terbaru
  let q;
  if (category && category !== 'all') {
    q = query(collection(db, 'videos'), where('category', '==', category));
  } else {
    q = query(collection(db, 'videos'));
  }
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
    localStorage.setItem(VERSION_CACHE_KEY, globalVersion);
  }
  
  return sortedData;
}

export async function addVideo(data) {
  const res = await addDoc(collection(db, 'videos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await bumpDataVersion();
  return res;
}

export async function updateVideo(id, data) {
  const res = await updateDoc(doc(db, 'videos', id), data);
  await bumpDataVersion();
  return res;
}

export async function deleteVideo(id) {
  const res = await deleteDoc(doc(db, 'videos', id));
  await bumpDataVersion();
  return res;
}

// =====================
// CONTENT: PHOTOS
// =====================

export async function getPhotos(category) {
  // Raw fetch for Admin panel
  let q;
  if (category && category !== 'all') {
    q = query(collection(db, 'photos'), where('category', '==', category));
  } else {
    q = query(collection(db, 'photos'));
  }
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
}

// Frontend function to resolve folders into images
export async function getResolvedPhotos(category) {
  console.log("getResolvedPhotos called for category:", category);
  const CACHE_KEY = `da_resolved_photos_v4_${category || 'all'}`;
  const DEFS_CACHE_KEY = `da_resolved_defs_v4_${category || 'all'}`;
  const LAST_FETCH_KEY = `da_resolved_photos_last_fetch_v4_${category || 'all'}`;
  const now = Date.now();
  
  // 1. Fetch raw definitions (folders & images) from Firestore
  let q;
  if (category && category !== 'all') {
    q = query(collection(db, 'photos'), where('category', '==', category));
  } else {
    q = query(collection(db, 'photos'));
  }
  
  console.log("Checking local cache first...");
  const cachedDefs = localStorage.getItem(DEFS_CACHE_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);
  const VERSION_CACHE_KEY = `da_resolved_photos_version_v4_${category || 'all'}`;
  let needsRefetch = true;
  let globalVersion = '1';
  
  if (typeof window !== 'undefined') {
    globalVersion = localStorage.getItem('da_global_data_version') || '1';
    const cachedVersion = localStorage.getItem(VERSION_CACHE_KEY);
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    
    if (cachedData && cachedDefs && cachedVersion === globalVersion && lastFetch) {
      // Untuk foto Google Drive, URL thumbnail akan kedaluwarsa dalam beberapa jam.
      // Jadi kita TETAP harus membatasi cache maksimal 1 jam, meskipun versinya tidak berubah.
      const isTimeValid = now - parseInt(lastFetch) < 3600000;
      
      if (isTimeValid) {
        needsRefetch = false;
        console.log("Using versioned & time-valid cache for photos. Skipping Firestore & Drive API.");
        return JSON.parse(cachedData);
      }
    }
  }

  // Jika versi beda atau waktu sudah lebih dari 1 jam
  console.log("Cache expired or version changed. Executing getDocs for photos collection...");
  try {
    const snap = await getDocs(q);
    const definitions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("Firestore definitions fetched:", definitions);
    
    const currentDefsString = JSON.stringify(definitions.map(d => d.id).sort());
    const isDefsSame = cachedDefs === currentDefsString;
    
    // Jika versi berbeda (misal menu lain diedit) TAPI isi folder foto sebenarnya tidak berubah,
    // kita bisa menghemat pemanggilan Google Drive API asalkan waktunya masih di bawah 1 jam.
    // Tapi karena kode di atas sudah mengecek waktu, jika sampai ke titik ini, berarti antara:
    // 1. Versi berubah (ada data Firebase yg berubah)
    // 2. Waktu sudah > 1 jam (Link Google Drive mungkin sudah mati)
    // Jadi kita HARUS tetap memanggil Google Drive API untuk memperbarui URL gambarnya.

    console.log("Need to refetch from Drive API.");
    // 3. Resolve definitions to actual photos via Drive API
    let allPhotos = [];
    
    const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
    const apiKey = settingsSnap.exists() ? settingsSnap.data().googleDriveApiKey : null;
    console.log("Drive API Key from settings:", apiKey ? "FOUND" : "NOT FOUND");

    for (const def of definitions) {
      if (def.type === 'folder' && def.folderId) {
        if (!apiKey) {
          allPhotos.push({
            id: 'error-' + def.folderId,
            title: 'API Key Google Drive Belum Diatur di Pengaturan',
            imageUrl: 'https://placehold.co/600x400/1e293b/ef4444?text=Drive+API+Key+Missing',
            category: def.category,
            createdAt: def.createdAt
          });
          continue;
        }

        try {
          let url = `https://www.googleapis.com/drive/v3/files?q='${def.folderId}'+in+parents+and+mimeType+contains+'image/'&key=${apiKey}&fields=files(id,name,thumbnailLink,webContentLink,createdTime)&orderBy=createdTime desc&pageSize=100`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.files) {
            const drivePhotos = data.files.map(file => ({
              id: file.id,
              title: file.name,
              imageUrl: file.thumbnailLink?.replace('=s220', '=s1200'),
              category: def.category,
              createdAt: { toMillis: () => new Date(file.createdTime).getTime() }
            }));
            allPhotos = [...allPhotos, ...drivePhotos];
          } else if (data.error) {
            console.error("Drive API Error:", data.error);
            allPhotos.push({
              id: 'error-' + def.folderId,
              title: `Error: ${data.error.message}`,
              imageUrl: 'https://placehold.co/600x400/1e293b/ef4444?text=Drive+API+Error',
              category: def.category,
              createdAt: def.createdAt
            });
          }
        } catch (e) {
          console.error("Drive fetch error for folder", def.folderId, e);
        }
      } else {
        // Regular image
        allPhotos.push(def);
      }
    }

    const sortedData = allPhotos.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
    localStorage.setItem(DEFS_CACHE_KEY, currentDefsString);
    localStorage.setItem(VERSION_CACHE_KEY, globalVersion);
    localStorage.setItem(LAST_FETCH_KEY, now.toString());

    return sortedData;
  } catch (error) {
    console.error("Fatal error in getResolvedPhotos:", error);
    return [];
  }
}

export async function addPhoto(data) {
  const res = await addDoc(collection(db, 'photos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await bumpDataVersion();
  return res;
}

export async function deletePhoto(id) {
  const res = await deleteDoc(doc(db, 'photos', id));
  await bumpDataVersion();
  return res;
}

// =====================
// CONTENT: AUDIOS
// =====================

export async function getAudios() {
  const CACHE_KEY = 'da_audios_cache_v2';
  const VERSION_CACHE_KEY = 'da_audios_version_v2';
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    const cachedVersion = localStorage.getItem(VERSION_CACHE_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedData && cachedVersion === globalVersion) {
      return JSON.parse(cachedData);
    }
  }

  const q = query(collection(db, 'audios'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_CACHE_KEY, globalVersion);
  }
  
  return data;
}

export async function addAudio(data) {
  const res = await addDoc(collection(db, 'audios'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await bumpDataVersion();
  return res;
}

export async function updateAudio(id, data) {
  const res = await updateDoc(doc(db, 'audios', id), data);
  await bumpDataVersion();
  return res;
}

export async function deleteAudio(id) {
  const res = await deleteDoc(doc(db, 'audios', id));
  await bumpDataVersion();
  return res;
}

// =====================
// CONTENT: DOCUMENTS
// =====================

export async function getDocuments() {
  const CACHE_KEY = 'da_documents_cache_v2';
  const VERSION_CACHE_KEY = 'da_documents_version_v2';
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    const cachedVersion = localStorage.getItem(VERSION_CACHE_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedData && cachedVersion === globalVersion) {
      return JSON.parse(cachedData);
    }
  }

  const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  if (typeof window !== 'undefined') {
    const globalVersion = localStorage.getItem('da_global_data_version') || '1';
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_CACHE_KEY, globalVersion);
  }
  
  return data;
}

export async function addDocument(data) {
  const res = await addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await bumpDataVersion();
  return res;
}

export async function deleteDocument(id) {
  const res = await deleteDoc(doc(db, 'documents', id));
  await bumpDataVersion();
  return res;
}

// =====================
// CONTENT: REWARDS
// =====================

export async function getRewards() {
  const q = query(collection(db, 'rewards'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addReward(data) {
  return addDoc(collection(db, 'rewards'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateReward(id, data) {
  return updateDoc(doc(db, 'rewards', id), data);
}

export async function deleteReward(id) {
  return deleteDoc(doc(db, 'rewards', id));
}

// =====================
// STATS (Admin)
// =====================

export async function getStats() {
  const usersColl = collection(db, 'users');
  const codesColl = collection(db, 'activation_codes');
  const videosColl = collection(db, 'videos');
  const photosColl = collection(db, 'photos');
  const audiosColl = collection(db, 'audios');

  // getCountFromServer uses only 1 read per query!
  const [
    totalUsersSnap, 
    activatedUsersSnap, 
    totalCodesSnap, 
    usedCodesSnap, 
    unusedCodesSnap,
    totalVideosSnap, 
    totalPhotosSnap, 
    totalAudiosSnap
  ] = await Promise.all([
    getCountFromServer(usersColl),
    getCountFromServer(query(usersColl, where('activated', '==', true))),
    getCountFromServer(codesColl),
    getCountFromServer(query(codesColl, where('status', '==', 'used'))),
    getCountFromServer(query(codesColl, where('status', '==', 'unused'))),
    getCountFromServer(videosColl),
    getCountFromServer(photosColl),
    getCountFromServer(audiosColl)
  ]);

  return {
    totalUsers: totalUsersSnap.data().count,
    activatedUsers: activatedUsersSnap.data().count,
    totalCodes: totalCodesSnap.data().count,
    usedCodes: usedCodesSnap.data().count,
    unusedCodes: unusedCodesSnap.data().count,
    totalVideos: totalVideosSnap.data().count,
    totalPhotos: totalPhotosSnap.data().count,
    totalAudios: totalAudiosSnap.data().count,
  };
}

// =====================
// USERS (Admin)
// =====================

export async function getUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteUser(id) {
  return deleteDoc(doc(db, 'users', id));
}

// =====================
// COMMENTS
// =====================

export async function getComments(videoId) {
  const q = query(collection(db, 'comments'), where('videoId', '==', videoId));
  const snap = await getDocs(q);
  const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort locally to avoid requiring composite index on videoId + createdAt
  return comments.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function addComment(videoId, user, text, parentId = null) {
  return addDoc(collection(db, 'comments'), {
    videoId,
    userId: user.uid,
    userName: user.displayName || 'User',
    userPhoto: user.photoURL || null,
    text,
    parentId, // if null, it's a top-level comment
    likes: [],
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(id) {
  return deleteDoc(doc(db, 'comments', id));
}

export async function toggleLikeComment(commentId, userId) {
  const docRef = doc(db, 'comments', commentId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const likes = data.likes || [];
  if (likes.includes(userId)) {
    return updateDoc(docRef, { likes: likes.filter(id => id !== userId) });
  } else {
    return updateDoc(docRef, { likes: [...likes, userId] });
  }
}
