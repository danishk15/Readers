'use client';

const DB_NAME = 'ReadSphereOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline-books';

export interface OfflineBookRecord {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  fileUrl: string;
  fileData: Blob;
  savedAt: number;
}

/**
 * Initializes the IndexedDB instance.
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Downloads a book EPUB/PDF file via proxy and stores it in IndexedDB.
 */
export async function saveBookOffline(
  id: string,
  title: string,
  author: string,
  coverUrl: string,
  fileUrl: string
): Promise<void> {
  const db = await initDB();
  
  // Use proxy to avoid CORS blocks on external Gutenberg/archive.org files
  const isExternal = fileUrl && 
    (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) && 
    (typeof window !== 'undefined' && !fileUrl.startsWith(window.location.origin));
    
  const downloadUrl = isExternal 
    ? `/api/books/proxy?url=${encodeURIComponent(fileUrl)}` 
    : fileUrl;

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download book: ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: OfflineBookRecord = {
      id,
      title,
      author,
      coverUrl,
      fileUrl,
      fileData: blob,
      savedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Retrieves a cached book record from IndexedDB.
 */
export async function getCachedBook(id: string): Promise<OfflineBookRecord | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Checks if a book is already cached in IndexedDB.
 */
export async function isBookCached(id: string): Promise<boolean> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getKey(id); // Faster than reading whole object

      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

/**
 * Removes a cached book from IndexedDB.
 */
export async function deleteCachedBook(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Returns all cached book metadata stored in IndexedDB.
 */
export async function getAllCachedBooks(): Promise<Omit<OfflineBookRecord, 'fileData'>[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records: OfflineBookRecord[] = request.result || [];
      // Strip out large fileData for fast listing
      const metadata = records.map(({ id, title, author, coverUrl, fileUrl, savedAt }) => ({
        id,
        title,
        author,
        coverUrl,
        fileUrl,
        savedAt,
      }));
      resolve(metadata);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
