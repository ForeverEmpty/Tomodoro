const MUSIC_IMAGE_CACHE = 'tomodoro-music-images-v1'
const MAX_CACHED_IMAGES = 160

const isImageRequest = (request) => (
  request.method === 'GET' && request.destination === 'image'
)

const trimCache = async (cache) => {
  const keys = await cache.keys()
  if (keys.length <= MAX_CACHED_IMAGES) {
    return
  }

  await Promise.all(keys.slice(0, keys.length - MAX_CACHED_IMAGES).map((request) => (
    cache.delete(request)
  )))
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (!isImageRequest(request)) {
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(MUSIC_IMAGE_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const response = await fetch(request)
    if (response.ok || response.type === 'opaque') {
      await cache.put(request, response.clone())
      await trimCache(cache)
    }

    return response
  })())
})
