// IndexedDB helper to persist uploaded MP3 audio locally for seamless playback

const DB_NAME = 'wedding_audio_db';
const STORE_NAME = 'audio_tracks';
const AUDIO_KEY = 'wedding_song_mp3';

export async function initAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioFile(file: File | Blob): Promise<void> {
  const db = await initAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(file, AUDIO_KEY);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function getSavedAudioUrl(): Promise<string | null> {
  try {
    const db = await initAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(AUDIO_KEY);
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && (result instanceof Blob || result instanceof File)) {
          const blobUrl = URL.createObjectURL(result);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeSavedAudio(): Promise<void> {
  try {
    const db = await initAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(AUDIO_KEY);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch {
    // Ignore error
  }
}
