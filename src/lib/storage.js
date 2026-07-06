import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Upload file to Firebase Storage
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

// Upload image (photo, thumbnail, badge)
export async function uploadImage(file, folder = 'photos') {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  return uploadFile(file, fileName);
}

// Upload audio file
export async function uploadAudioFile(file) {
  const fileName = `audios/${Date.now()}-${file.name}`;
  return uploadFile(file, fileName);
}

// Upload PDF document
export async function uploadPDF(file) {
  const fileName = `documents/${Date.now()}-${file.name}`;
  return uploadFile(file, fileName);
}

// Upload badge image
export async function uploadBadge(file) {
  const fileName = `badges/${Date.now()}-${file.name}`;
  return uploadFile(file, fileName);
}

// Delete file from Storage
export async function deleteFile(url) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
