const DB_NAME = 'TomodoroDB'
const DB_VERSION = 1
const STORE_NAME = 'backgrounds'

let db: IDBDatabase | null = null
let openPromise: Promise<IDBDatabase> | null = null

const resetCachedDB = (database?: IDBDatabase) => {
  if (!database || database === db) {
    db = null
  }
}

const isInvalidStateError = (error: unknown) => {
  return error instanceof DOMException && error.name === 'InvalidStateError'
}

const bindConnectionEvents = (database: IDBDatabase) => {
  database.addEventListener('close', () => {
    resetCachedDB(database)
  })

  database.addEventListener('versionchange', () => {
    resetCachedDB(database)
    database.close()
  })
}

const openDB = (): Promise<IDBDatabase> => {
  if (db) {
    return Promise.resolve(db)
  }

  if (openPromise) {
    return openPromise
  }

  const promise: Promise<IDBDatabase> = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      bindConnectionEvents(db)
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  }).finally(() => {
    openPromise = null
  })

  openPromise = promise

  return promise
}

const runWithDB = async <T>(
  operation: (database: IDBDatabase) => Promise<T>,
  shouldRetry = true,
): Promise<T> => {
  const database = await openDB()

  try {
    return await operation(database)
  } catch (error) {
    if (shouldRetry && isInvalidStateError(error)) {
      resetCachedDB(database)
      return runWithDB(operation, false)
    }

    throw error
  }
}

export interface StoredBackground {
  id: string
  data: Blob
  type: string
  name: string
}

export const storeBackground = async (id: string, file: File): Promise<void> => {
  return runWithDB((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const background: StoredBackground = {
      id,
      data: file,
      type: file.type,
      name: file.name,
    }

    const request = store.put(background)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
    request.onerror = () => reject(request.error)
  }))
}

export const getBackground = async (id: string): Promise<StoredBackground | null> => {
  return runWithDB((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)
    let result: StoredBackground | null = null

    request.onsuccess = () => {
      result = request.result ?? null
    }
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
    request.onerror = () => reject(request.error)
  }))
}

export const deleteBackground = async (id: string): Promise<void> => {
  return runWithDB((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
    request.onerror = () => reject(request.error)
  }))
}

export const blobToObjectURL = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url)
}
