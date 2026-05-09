const DB_NAME = 'TomodoroDB'
const DB_VERSION = 1
const STORE_NAME = 'backgrounds'

let db: IDBDatabase | null = null

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export interface StoredBackground {
  id: string
  data: Blob
  type: string
  name: string
}

export const storeBackground = async (id: string, file: File): Promise<void> => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const background: StoredBackground = {
      id,
      data: file,
      type: file.type,
      name: file.name,
    }

    const request = store.put(background)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getBackground = async (id: string): Promise<StoredBackground | null> => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteBackground = async (id: string): Promise<void> => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const blobToObjectURL = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url)
}
