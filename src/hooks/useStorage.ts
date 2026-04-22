export const useStorage = (storage: Storage = window.localStorage) => {
  const _storage = storage

  const setItem = (key: string, value: string) => {
    _storage.setItem(key, value)
  }

  const getItem = (key: string) => {
    return _storage.getItem(key)
  }

  return {
    setItem,
    getItem,
  }
}
