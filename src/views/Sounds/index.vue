<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import MiniTasks from '@/components/MiniTasks/index.vue'
import type { MusicTrack } from '@/config/music'
import { useI18n } from '@/i18n'
import { useMusicStore } from '@/stores/musicStore'
import HotMusicList from './components/HotMusicList.vue'
import MusicTrackList from './components/MusicTrackList.vue'
import SoundsSidebar from './components/SoundsSidebar.vue'
import type {
  HotMusicItem,
  HotboardResponse,
  HotboardType,
  MusicListView,
  PlatformCategory,
  Playlist,
  PlaylistHotTrack,
} from './types'

const musicStore = useMusicStore()
const { currentTrack, isPlaying, playerSource } = storeToRefs(musicStore)
const { t } = useI18n()
const RECENT_PLAYLIST_ID = 'recent'
const RECENT_TRACK_LIMIT = 20
const PLAYLISTS_STORAGE_KEY = 'tomodoro-sounds-playlists'

const normalizePlaylist = (playlist: Partial<Playlist>): Playlist | null => {
  if (!playlist.id || !playlist.name) {
    return null
  }

  const trackIds = Array.isArray(playlist.trackIds) ? playlist.trackIds : []
  const hotTracks = Array.isArray(playlist.hotTracks) ? playlist.hotTracks : []

  return {
    id: playlist.id,
    name: playlist.name,
    count: trackIds.length + hotTracks.length,
    trackIds,
    hotTracks,
  }
}

const loadSavedPlaylists = (): Playlist[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawPlaylists = window.localStorage.getItem(PLAYLISTS_STORAGE_KEY)
    const parsedPlaylists = rawPlaylists ? JSON.parse(rawPlaylists) : []
    if (!Array.isArray(parsedPlaylists)) {
      return []
    }

    return parsedPlaylists
      .map((playlist) => normalizePlaylist(playlist as Partial<Playlist>))
      .filter((playlist) => playlist !== null)
  } catch {
    return []
  }
}

const savePlaylists = (nextPlaylists: Playlist[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(nextPlaylists))
}

const categories = ref<PlatformCategory[]>([
  {
    id: 'local',
    name: 'Local Sounds',
    source: 'Tomodoro',
    count: musicStore.tracks.length,
  },
  {
    id: 'ambient',
    name: 'Ambient Sounds',
    source: 'Built-in',
    count: musicStore.tracks.filter((track) => track.id.startsWith('ambient-')).length,
    trackIds: musicStore.tracks
      .filter((track) => track.id.startsWith('ambient-'))
      .map((track) => track.id),
  },
  {
    id: 'hot-netease',
    name: 'CloudMusic Hot Music',
    source: 'uapis.cn',
    count: 0,
    hotboardType: 'netease-music',
  },
  {
    id: 'hot-qq',
    name: 'QQMusic Hot Music',
    source: 'uapis.cn',
    count: 0,
    hotboardType: 'qq-music',
  },
])
const playlists = ref<Playlist[]>(loadSavedPlaylists())
const activeView = ref<{ type: 'category' | 'playlist'; id: string }>({
  type: 'category',
  id: 'local',
})
const newPlaylistName = ref('')
const hotMusicItems = ref<Record<HotboardType, HotMusicItem[]>>({
  'netease-music': [],
  'qq-music': [],
})
const hotMusicErrors = ref<Record<HotboardType, string>>({
  'netease-music': '',
  'qq-music': '',
})
const hotMusicLoading = ref<Record<HotboardType, boolean>>({
  'netease-music': false,
  'qq-music': false,
})
const hotMusicFetched = ref<Record<HotboardType, boolean>>({
  'netease-music': false,
  'qq-music': false,
})
const hotMusicUpdatedAt = ref<Record<HotboardType, string>>({
  'netease-music': '',
  'qq-music': '',
})
const recentTracks = ref<(MusicTrack | PlaylistHotTrack)[]>([])

const playlistItems = computed<Playlist[]>(() => [
  {
    id: RECENT_PLAYLIST_ID,
    name: t('playlist.recentlyPlayed'),
    count: recentTracks.value.length,
    trackIds: recentTracks.value
      .filter((track): track is MusicTrack => !isHotPlaylistTrack(track))
      .map((track) => track.id),
    hotTracks: recentTracks.value.filter(isHotPlaylistTrack),
  },
  ...playlists.value,
])

const activeListView = computed<MusicListView | undefined>(() => {
  if (activeView.value.type === 'playlist') {
    const playlist = playlistItems.value.find((item) => item.id === activeView.value.id)
    return playlist
      ? {
          id: playlist.id,
          name: playlist.name,
          source: t('sounds.sourcePlaylist'),
        }
      : undefined
  }

  const category = categories.value.find((item) => item.id === activeView.value.id)
  return category ? translateCategory(category) : undefined
})

const visibleTracks = computed(() => {
  if (activeView.value.type === 'playlist') {
    if (activeView.value.id === RECENT_PLAYLIST_ID) {
      return recentTracks.value
    }

    const playlist = playlistItems.value.find((item) => item.id === activeView.value.id)
    if (!playlist) {
      return []
    }

    const localTracks = playlist.trackIds
      .map((trackId) => musicStore.tracks.find((track) => track.id === trackId))
      .filter((track) => track !== undefined)
    return [...localTracks, ...(playlist.hotTracks ?? [])]
  }

  const category = categories.value.find((item) => item.id === activeView.value.id)
  if (category?.trackIds) {
    return category.trackIds
      .map((trackId) => musicStore.tracks.find((track) => track.id === trackId))
      .filter((track) => track !== undefined)
  }

  return musicStore.tracks
})

const activeCategory = computed(() => {
  if (activeView.value.type !== 'category') {
    return undefined
  }

  return categories.value.find((item) => item.id === activeView.value.id)
})

const activeHotboardType = computed(() => activeCategory.value?.hotboardType)
const visibleHotMusic = computed(() => {
  const type = activeHotboardType.value
  return type ? hotMusicItems.value[type] : []
})
const activeHotTrackId = computed(() => (
  playerSource.value.kind === 'meting' ? playerSource.value.track.auto : ''
))

const isHotPlaylistTrack = (track: MusicTrack | PlaylistHotTrack): track is PlaylistHotTrack => (
  'auto' in track
)

const translateCategory = (category: PlatformCategory): PlatformCategory => {
  const labels: Record<string, Parameters<typeof t>[0]> = {
    ambient: 'sounds.ambient',
    'hot-netease': 'sounds.cloudHot',
    'hot-qq': 'sounds.qqHot',
    local: 'sounds.local',
  }
  const sources: Record<string, Parameters<typeof t>[0]> = {
    ambient: 'sounds.builtIn',
  }
  const labelKey = labels[category.id]
  const sourceKey = sources[category.id]

  return {
    ...category,
    name: labelKey ? t(labelKey) : category.name,
    source: sourceKey ? t(sourceKey) : category.source,
  }
}

const translatedCategories = computed(() => categories.value.map(translateCategory))

const addRecentTrack = (track: MusicTrack | PlaylistHotTrack) => {
  recentTracks.value = [
    track,
    ...recentTracks.value.filter((item) => item.id !== track.id),
  ].slice(0, RECENT_TRACK_LIMIT)
}

const playTrack = (track: MusicTrack | PlaylistHotTrack) => {
  if (isHotPlaylistTrack(track)) {
    const playlist = activeView.value.type === 'playlist'
      ? playlistItems.value.find((item) => item.id === activeView.value.id)
      : undefined
    musicStore.selectMetingTrack(
      track,
      playlist?.hotTracks && playlist.hotTracks.length > 0 ? playlist.hotTracks : [track],
    )
    musicStore.play()
    addRecentTrack(track)
    return
  }

  musicStore.selectTrack(track.id)
  musicStore.play()
  addRecentTrack(track)
}

const getHotTrackMetingInfo = (track: HotMusicItem) => {
  if (activeHotboardType.value === 'qq-music') {
    const songmid = track.extra?.songmid ?? track.url.match(/songDetail\/([^/?#]+)/)?.[1]
    return songmid
      ? {
          metingId: songmid,
          server: 'tencent' as const,
          type: 'song' as const,
        }
      : {}
  }

  const neteaseId = track.extra?.id ?? track.url.match(/[?&]id=(\d+)/)?.[1]
  return neteaseId
    ? {
        metingId: String(neteaseId),
        server: 'netease' as const,
        type: 'song' as const,
      }
    : {}
}

const hotTrackId = (track: HotMusicItem) => (
  `${activeHotboardType.value ?? 'hot'}-${track.extra?.songmid ?? track.extra?.id ?? track.url}`
)

const toPlaylistHotTrack = (track: HotMusicItem): PlaylistHotTrack => ({
  id: hotTrackId(track),
  title: track.title,
  artist: track.extra?.artist_names || track.extra?.album || t('music.unknownArtist'),
  cover: track.cover,
  auto: track.url,
  durationText: track.extra?.duration_text || track.hot_value,
  source: activeHotboardType.value,
  ...getHotTrackMetingInfo(track),
})

const playHotTrack = (track: HotMusicItem) => {
  const hotQueue = visibleHotMusic.value.map(toPlaylistHotTrack)
  const selectedTrack = hotQueue.find((item) => item.auto === track.url) ?? toPlaylistHotTrack(track)

  musicStore.selectMetingTrack(selectedTrack, hotQueue)
  musicStore.play()
  addRecentTrack(selectedTrack)
}

const addHotTrackToPlaylist = (track: HotMusicItem, playlistId: string) => {
  addTrackToPlaylist(toPlaylistHotTrack(track), playlistId)
}

const fetchHotMusic = async (type: HotboardType) => {
  if (hotMusicLoading.value[type] || hotMusicFetched.value[type]) {
    return
  }

  hotMusicLoading.value[type] = true
  hotMusicFetched.value[type] = true
  hotMusicErrors.value[type] = ''
  try {
    const response = await fetch(`https://uapis.cn/api/v1/misc/hotboard?type=${type}`)
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`)
    }

    const data = (await response.json()) as HotboardResponse
    hotMusicItems.value[type] = data.list ?? []
    hotMusicUpdatedAt.value[type] = data.update_time
    const category = categories.value.find((item) => item.hotboardType === type)
    if (category) {
      category.count = hotMusicItems.value[type].length
    }
  } catch {
    hotMusicErrors.value[type] = t('sounds.hotLoadError')
  } finally {
    hotMusicLoading.value[type] = false
  }
}

const createPlaylist = () => {
  const name = newPlaylistName.value.trim()
  if (!name) {
    return
  }

  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
  playlists.value.push({
    id,
    name,
    count: 0,
    trackIds: [],
    hotTracks: [],
  })
  activeView.value = {
    type: 'playlist',
    id,
  }
  newPlaylistName.value = ''
}

const renamePlaylist = (playlistId: string, name: string) => {
  const playlist = playlists.value.find((item) => item.id === playlistId)
  if (!playlist) {
    return
  }

  playlist.name = name
}

const deletePlaylist = (playlistId: string) => {
  const playlistIndex = playlists.value.findIndex((item) => item.id === playlistId)
  if (playlistIndex === -1) {
    return
  }

  playlists.value.splice(playlistIndex, 1)
  if (activeView.value.type === 'playlist' && activeView.value.id === playlistId) {
    activeView.value = {
      type: 'category',
      id: 'local',
    }
  }
}

const updatePlaylistCount = (playlist: Playlist) => {
  playlist.count = playlist.trackIds.length + (playlist.hotTracks?.length ?? 0)
}

const addTrackToPlaylist = (track: MusicTrack | PlaylistHotTrack, playlistId: string) => {
  const playlist = playlists.value.find((item) => item.id === playlistId)
  if (!playlist) {
    return
  }

  if (isHotPlaylistTrack(track)) {
    const hotTracks = playlist.hotTracks ?? []
    if (hotTracks.some((item) => item.id === track.id || item.auto === track.auto)) {
      return
    }

    hotTracks.push(track)
    playlist.hotTracks = hotTracks
    updatePlaylistCount(playlist)
    return
  }

  if (playlist.trackIds.includes(track.id)) {
    return
  }

  playlist.trackIds.push(track.id)
  updatePlaylistCount(playlist)
}

const removeTrackFromActivePlaylist = (trackId: string) => {
  if (activeView.value.type !== 'playlist') {
    return
  }

  if (activeView.value.id === RECENT_PLAYLIST_ID) {
    recentTracks.value = recentTracks.value.filter((track) => track.id !== trackId)
    return
  }

  const playlist = playlists.value.find((item) => item.id === activeView.value.id)
  if (!playlist) {
    return
  }

  playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId)
  playlist.hotTracks = playlist.hotTracks?.filter((track) => track.id !== trackId)
  updatePlaylistCount(playlist)
}

onMounted(() => {
  void Promise.all(categories.value.flatMap((category) => (
    category.hotboardType ? [fetchHotMusic(category.hotboardType)] : []
  )))
})

watch(playlists, (nextPlaylists) => {
  savePlaylists(nextPlaylists)
}, { deep: true })
</script>

<template>
  <section class="flex min-h-[calc(100vh-7rem)] w-full flex-col px-4 pb-36 pt-2 md:min-h-[calc(100vh-6rem)] md:px-6 md:pb-8">
    <div class="mb-5 flex items-center justify-between gap-4">
      <div>
        <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
          {{ t('sounds.title') }}
        </p>
        <h1 class="m-0 mt-1 text-2xl font-semibold text-text-main md:text-3xl">
          {{ t('sounds.musicLibrary') }}
        </h1>
      </div>

      <MiniTasks placement="bottom" />
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-0">
      <SoundsSidebar
        :active-category-id="activeView.type === 'category' ? activeView.id : ''"
        :active-playlist-id="activeView.type === 'playlist' ? activeView.id : ''"
        :categories="translatedCategories"
        v-model:new-playlist-name="newPlaylistName"
        :playlists="playlistItems"
        @create-playlist="createPlaylist"
        @select-category="activeView = { type: 'category', id: $event }"
        @select-playlist="activeView = { type: 'playlist', id: $event }"
      />

      <div class="flex min-h-0 flex-col border-t border-border-soft pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <HotMusicList
          v-if="activeHotboardType"
          class="min-h-0 flex-1"
          :active-view="activeListView"
          :active-track-id="activeHotTrackId"
          :error="hotMusicErrors[activeHotboardType]"
          :is-loading="hotMusicLoading[activeHotboardType]"
          :is-playing="isPlaying"
          :playlists="playlists"
          :tracks="visibleHotMusic"
          :updated-at="hotMusicUpdatedAt[activeHotboardType]"
          @add-to-playlist="addHotTrackToPlaylist"
          @play-track="playHotTrack"
        />
        <MusicTrackList
          v-else
          class="min-h-0 flex-1"
          :active-view="activeListView"
          :can-manage-playlist="activeView.type === 'playlist' && activeView.id !== RECENT_PLAYLIST_ID"
          :current-track="currentTrack"
          :is-playing="isPlaying"
          :playlists="playlists"
          :removable="activeView.type === 'playlist'"
          :tracks="visibleTracks"
          @add-to-playlist="addTrackToPlaylist"
          @delete-playlist="deletePlaylist"
          @play-track="playTrack"
          @remove-track="removeTrackFromActivePlaylist"
          @rename-playlist="renamePlaylist"
        />
      </div>
    </div>
  </section>
</template>
