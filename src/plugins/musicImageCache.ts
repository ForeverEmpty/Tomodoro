export const installMusicImageCache = () => {
  if (
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    import.meta.env.SSR
  ) {
    return
  }

  const swUrl = `${import.meta.env.BASE_URL}music-image-cache-sw.js`
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(swUrl).catch(() => {
      // Image caching is an enhancement; playback should keep working without it.
    })
  })
}
