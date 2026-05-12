import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { defaultMusicCover, musicTracks, type MusicTrack } from '@/config/music'

export type PlayMode = 'repeat-one' | 'repeat-list' | 'shuffle'

export interface MetingMusicTrack {
  id: string
  title: string
  artist: string
  auto: string
  cover?: string
  metingId?: string
  server?: 'netease' | 'tencent'
  type?: 'song'
}

export type MusicPlayerSource =
  | {
      kind: 'local'
      track: MusicTrack
    }
  | {
      kind: 'meting'
      track: MetingMusicTrack
    }

const playModes: PlayMode[] = ['repeat-list', 'repeat-one', 'shuffle']
const fallbackTrack: MusicTrack = musicTracks[0] ?? {
  id: 'empty',
  title: 'No music',
  artist: 'Tomodoro',
  src: '',
  cover: defaultMusicCover,
}

export const useMusicStore = defineStore('music', () => {
  const currentTrackIndex = ref(0)
  const metingTrack = ref<MetingMusicTrack | null>(null)
  const metingQueue = ref<MetingMusicTrack[]>([])
  const isPlaying = ref(false)
  const shouldAutoplay = ref(false)
  const playMode = ref<PlayMode>('repeat-list')

  const localTrack = computed<MusicTrack>(() => musicTracks[currentTrackIndex.value] ?? fallbackTrack)
  const currentTrack = computed(() => metingTrack.value ?? localTrack.value)
  const cover = computed(() => currentTrack.value?.cover ?? defaultMusicCover)
  const playerSource = computed<MusicPlayerSource>(() => {
    if (metingTrack.value) {
      return {
        kind: 'meting',
        track: metingTrack.value,
      }
    }

    return {
      kind: 'local',
      track: localTrack.value,
    }
  })
  const playerKey = computed(() => {
    const source = playerSource.value
    const trackKey = source.kind === 'meting'
      ? `${source.track.server ?? 'auto'}:${source.track.metingId ?? source.track.auto}`
      : source.track.src
    return `${source.kind}:${source.track.id}:${trackKey}`
  })
  const metingLoop = computed(() => 'none')
  const metingOrder = computed(() => 'list')

  const play = () => {
    shouldAutoplay.value = true
  }

  const pause = () => {
    isPlaying.value = false
    shouldAutoplay.value = false
  }

  const toggle = () => {
    shouldAutoplay.value = !isPlaying.value
  }

  const getRandomIndex = (length: number, currentIndex: number) => {
    if (length <= 1) {
      return currentIndex
    }

    let nextIndex = currentIndex
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * length)
    }
    return nextIndex
  }

  const getNextLocalIndex = () => (
    playMode.value === 'shuffle'
      ? getRandomIndex(musicTracks.length, currentTrackIndex.value)
      : (currentTrackIndex.value + 1) % musicTracks.length
  )

  const getPreviousLocalIndex = () => (
    playMode.value === 'shuffle'
      ? getRandomIndex(musicTracks.length, currentTrackIndex.value)
      : (currentTrackIndex.value - 1 + musicTracks.length) % musicTracks.length
  )

  const getMetingQueueIndex = () => {
    if (!metingTrack.value) {
      return -1
    }

    return metingQueue.value.findIndex((track) => track.id === metingTrack.value?.id)
  }

  const moveMetingQueue = (direction: 1 | -1) => {
    if (!metingTrack.value || metingQueue.value.length === 0) {
      return false
    }

    const currentIndex = Math.max(0, getMetingQueueIndex())
    const nextIndex = playMode.value === 'shuffle'
      ? getRandomIndex(metingQueue.value.length, currentIndex)
      : (currentIndex + direction + metingQueue.value.length) % metingQueue.value.length
    metingTrack.value = metingQueue.value[nextIndex] ?? metingTrack.value
    return true
  }

  const next = () => {
    if (moveMetingQueue(1)) {
      play()
      return
    }

    metingTrack.value = null
    currentTrackIndex.value = getNextLocalIndex()
    play()
  }

  const previous = () => {
    if (moveMetingQueue(-1)) {
      play()
      return
    }

    metingTrack.value = null
    currentTrackIndex.value = getPreviousLocalIndex()
    play()
  }

  const selectTrack = (trackId: string) => {
    const nextIndex = musicTracks.findIndex((track) => track.id === trackId)
    if (nextIndex === -1) {
      return
    }

    metingTrack.value = null
    metingQueue.value = []
    currentTrackIndex.value = nextIndex
  }

  const selectMetingTrack = (track: MetingMusicTrack, queue: MetingMusicTrack[] = [track]) => {
    metingTrack.value = track
    metingQueue.value = queue.length > 0 ? queue : [track]
  }

  const setPlaybackState = (playing: boolean) => {
    isPlaying.value = playing
    shouldAutoplay.value = playing
  }

  const handleEnded = () => {
    if (playMode.value === 'repeat-one') {
      return
    }

    next()
  }

  const setPlayMode = (mode: PlayMode) => {
    playMode.value = mode
  }

  const togglePlayMode = () => {
    const currentIndex = playModes.indexOf(playMode.value)
    playMode.value = playModes[(currentIndex + 1) % playModes.length] ?? 'repeat-list'
  }

  return {
    tracks: musicTracks,
    currentTrack,
    cover,
    isPlaying,
    shouldAutoplay,
    playMode,
    playerSource,
    playerKey,
    metingLoop,
    metingOrder,
    play,
    pause,
    toggle,
    next,
    previous,
    selectTrack,
    selectMetingTrack,
    setPlaybackState,
    handleEnded,
    setPlayMode,
    togglePlayMode,
  }
})
