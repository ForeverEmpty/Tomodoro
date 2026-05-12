const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export interface MusicTrack {
  id: string
  title: string
  artist: string
  src: string
  cover?: string
  duration?: number
}

export const defaultMusicCover = publicAsset('favicon.svg')

export const musicTracks: MusicTrack[] = [
  {
    id: 'bell',
    title: 'Bell',
    artist: 'Tomodoro',
    src: publicAsset('sounds/bell.wav'),
  },
  {
    id: 'chime',
    title: 'Chime',
    artist: 'Tomodoro',
    src: publicAsset('sounds/chime.wav'),
  },
  {
    id: 'soft-ding',
    title: 'Soft Ding',
    artist: 'Tomodoro',
    src: publicAsset('sounds/soft-ding.wav'),
  },
  {
    id: 'ambient-quiet-sound-of-rain',
    title: 'Quiet Sound Of Rain',
    artist: 'Nightingale',
    duration: 32 * 60 + 11,
    src: publicAsset('sounds/ambient-quiet-sound-of-rain.mp3'),
  },
]
