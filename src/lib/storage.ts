import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFile(
  issueId: string,
  file: File
): Promise<{ url: string; fileName: string; contentType: string }> {
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `attachments/${issueId}/${safeName}`);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  const url = await getDownloadURL(snapshot.ref);
  return {
    url,
    fileName: file.name,
    contentType: file.type,
  };
}
