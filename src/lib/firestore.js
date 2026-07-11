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
} from 'firebase/firestore';
import { db } from './firebase';

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
  // Caching logic for videos
  const CACHE_KEY = `da_videos_cache_${category || 'all'}`;
  const LAST_FETCH_KEY = `da_videos_last_fetch_${category || 'all'}`;
  const now = Date.now();
  
  // Try to load from cache
  const cachedData = localStorage.getItem(CACHE_KEY);
  const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
  
  let q;
  if (cachedData && lastFetch) {
    // If cache exists, only fetch NEW videos added since last fetch
    const lastDate = new Date(parseInt(lastFetch));
    if (category && category !== 'all') {
      q = query(collection(db, 'videos'), where('category', '==', category), where('createdAt', '>', lastDate));
    } else {
      q = query(collection(db, 'videos'), where('createdAt', '>', lastDate));
    }
    
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        // We have new videos! Add them to the cache
        let oldData = JSON.parse(cachedData);
        const newData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const combined = [...oldData, ...newData];
        
        // Remove duplicates just in case
        const uniqueData = Array.from(new Map(combined.map(item => [item.id, item])).values());
        const sortedData = uniqueData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
        localStorage.setItem(LAST_FETCH_KEY, now.toString());
        return sortedData;
      } else {
        // No new videos, return cache
        return JSON.parse(cachedData);
      }
    } catch (e) {
      // If query fails (e.g. index missing), fallback to cache
      return JSON.parse(cachedData);
    }
  }

  // Initial full fetch if no cache
  if (category && category !== 'all') {
    q = query(collection(db, 'videos'), where('category', '==', category));
  } else {
    q = query(collection(db, 'videos'));
  }
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
  localStorage.setItem(LAST_FETCH_KEY, now.toString());
  
  return sortedData;
}

export async function addVideo(data) {
  return addDoc(collection(db, 'videos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateVideo(id, data) {
  return updateDoc(doc(db, 'videos', id), data);
}

export async function deleteVideo(id) {
  return deleteDoc(doc(db, 'videos', id));
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
  const CACHE_KEY = `da_resolved_photos_v3_${category || 'all'}`;
  const DEFS_CACHE_KEY = `da_resolved_defs_v3_${category || 'all'}`;
  const LAST_FETCH_KEY = `da_resolved_photos_last_fetch_v3_${category || 'all'}`;
  const now = Date.now();
  
  // 1. Fetch raw definitions (folders & images) from Firestore
  let q;
  if (category && category !== 'all') {
    q = query(collection(db, 'photos'), where('category', '==', category));
  } else {
    q = query(collection(db, 'photos'));
  }
  
  console.log("Executing getDocs for photos collection...");
  try {
    const snap = await getDocs(q);
    const definitions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("Firestore definitions fetched:", definitions);
    
    // 2. Check if definitions have changed
    const cachedDefs = localStorage.getItem(DEFS_CACHE_KEY);
    const currentDefsString = JSON.stringify(definitions.map(d => d.id).sort());
    
    const cachedData = localStorage.getItem(CACHE_KEY);
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    
    let needsRefetch = true;
    
    if (cachedData && lastFetch && cachedDefs) {
      const isDefsSame = cachedDefs === currentDefsString;
      const isTimeValid = Date.now() - parseInt(lastFetch) < 3600000; 
      
      if (isDefsSame && isTimeValid) {
        needsRefetch = false;
        console.log("Using cached data.");
      }
    }

    if (!needsRefetch) {
      return JSON.parse(cachedData);
    }

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
    localStorage.setItem(LAST_FETCH_KEY, now.toString());

    return sortedData;
  } catch (error) {
    console.error("Fatal error in getResolvedPhotos:", error);
    return [];
  }
}

export async function addPhoto(data) {
  return addDoc(collection(db, 'photos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deletePhoto(id) {
  return deleteDoc(doc(db, 'photos', id));
}

// =====================
// CONTENT: AUDIOS
// =====================

export async function getAudios() {
  const q = query(collection(db, 'audios'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addAudio(data) {
  return addDoc(collection(db, 'audios'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateAudio(id, data) {
  return updateDoc(doc(db, 'audios', id), data);
}

export async function deleteAudio(id) {
  return deleteDoc(doc(db, 'audios', id));
}

// =====================
// CONTENT: DOCUMENTS
// =====================

export async function getDocuments() {
  const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addDocument(data) {
  return addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteDocument(id) {
  return deleteDoc(doc(db, 'documents', id));
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
