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
    q = query(
      collection(db, 'activation_codes'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'activation_codes'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =====================
// CONTENT: VIDEOS
// =====================

export async function getVideos(category) {
  let q;
  if (category && category !== 'all') {
    q = query(
      collection(db, 'videos'),
      where('category', '==', category),
      orderBy('order', 'asc')
    );
  } else {
    q = query(collection(db, 'videos'), orderBy('order', 'asc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  let q;
  if (category && category !== 'all') {
    q = query(
      collection(db, 'photos'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  const [usersSnap, codesSnap, videosSnap, photosSnap, audiosSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'activation_codes')),
    getDocs(collection(db, 'videos')),
    getDocs(collection(db, 'photos')),
    getDocs(collection(db, 'audios')),
  ]);

  const users = usersSnap.docs.map((d) => d.data());
  const codes = codesSnap.docs.map((d) => d.data());

  return {
    totalUsers: users.length,
    activatedUsers: users.filter((u) => u.activated).length,
    totalCodes: codes.length,
    usedCodes: codes.filter((c) => c.status === 'used').length,
    unusedCodes: codes.filter((c) => c.status === 'unused').length,
    totalVideos: videosSnap.size,
    totalPhotos: photosSnap.size,
    totalAudios: audiosSnap.size,
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
