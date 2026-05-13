<script setup lang="ts">
import { ref } from 'vue'
import type { MusicTrack } from '@/config/music'
import { useI18n } from '@/i18n'
import type { MusicListView, Playlist, PlaylistHotTrack } from '../types'

type ListTrack = MusicTrack | PlaylistHotTrack

defineProps<{
  activeView?: MusicListView
  canManagePlaylist?: boolean
  currentTrack?: { id: string }
  isPlaying: boolean
  playlists: Playlist[]
  removable?: boolean
  tracks: ListTrack[]
}>()

const openTrackId = ref<string | null>(null)
const isRenaming = ref(false)
const renameValue = ref('')
const { t } = useI18n()

const emit = defineEmits<{
  addToPlaylist: [track: ListTrack, playlistId: string]
  deletePlaylist: [playlistId: string]
  playTrack: [track: ListTrack]
  removeTrack: [trackId: string]
  renamePlaylist: [playlistId: string, name: string]
}>()

const isHotTrack = (track: ListTrack): track is PlaylistHotTrack => 'auto' in track

const localTrackTitle = (track: MusicTrack) => {
  const titleKeys: Record<string, Parameters<typeof t>[0]> = {
    bell: 'music.bell',
    chime: 'music.chime',
    'soft-ding': 'music.softDing',
    'ambient-quiet-sound-of-rain': 'music.quietRain',
  }
  const titleKey = titleKeys[track.id]

  return titleKey ? t(titleKey) : track.title
}

const trackTitle = (track: ListTrack) => (isHotTrack(track) ? track.title : localTrackTitle(track))

const isTrackInPlaylist = (track: ListTrack, playlist: Playlist) => {
  if (isHotTrack(track)) {
    return playlist.hotTracks?.some((item) => item.id === track.id) ?? false
  }

  return playlist.trackIds.includes(track.id)
}

const togglePlaylistMenu = (trackId: string) => {
  openTrackId.value = openTrackId.value === trackId ? null : trackId
}

const addToPlaylist = (track: ListTrack, playlistId: string) => {
  emit('addToPlaylist', track, playlistId)
  openTrackId.value = null
}

const startRename = (activeView?: MusicListView) => {
  if (!activeView) {
    return
  }

  isRenaming.value = true
  renameValue.value = activeView.name ?? ''
}

const cancelRename = () => {
  isRenaming.value = false
  renameValue.value = ''
}

const submitRename = (activeView?: MusicListView) => {
  if (!activeView) {
    cancelRename()
    return
  }

  const nextName = renameValue.value.trim()
  if (!nextName) {
    cancelRename()
    return
  }

  emit('renamePlaylist', activeView.id, nextName)
  cancelRename()
}
</script>

<template>
  <main class="flex min-h-0 flex-col">
    <div class="flex flex-col items-start justify-between gap-3 border-b border-border-soft pb-4 sm:flex-row sm:items-center sm:gap-4">
      <div class="min-w-0">
        <p class="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          {{ activeView?.source }}
        </p>
        <form
          v-if="canManagePlaylist && isRenaming"
          class="mt-1"
          @submit.prevent="submitRename(activeView)"
        >
          <input
            v-model="renameValue"
            type="text"
            class="h-9 w-full max-w-sm rounded-xl border border-border-default bg-transparent px-3 text-xl font-semibold text-text-main outline-none focus:ring-2 focus:ring-control-bg"
            autofocus
            @keydown.esc="cancelRename"
            @blur="submitRename(activeView)"
          />
        </form>
        <h2 v-else class="m-0 mt-1 truncate text-xl font-semibold text-text-main">
          {{ activeView?.name }}
        </h2>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <p class="m-0 font-mono text-xs text-text-muted">
          {{ t('common.tracks', { count: tracks.length }) }}
        </p>
        <template v-if="canManagePlaylist">
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-main/35 hover:text-text-main"
            :aria-label="t('aria.renamePlaylist')"
            @click="startRename(activeView)"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-main/35 hover:text-text-main"
            :aria-label="t('aria.deletePlaylist')"
            @click="activeView && emit('deletePlaylist', activeView.id)"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <div class="music-list-scroll min-h-0 flex-1 overflow-y-auto py-4 pr-0 sm:pr-2">
      <p
        v-if="tracks.length === 0"
        class="m-0 px-4 py-8 text-center text-sm text-text-muted"
      >
        {{ t('sounds.emptyTracks') }}
      </p>
      <div v-else class="grid gap-2">
        <div
          v-for="(track, index) in tracks"
          :key="track.id"
          class="group grid items-center gap-1.5 rounded-xl px-2 py-2 text-left transition duration-200 hover:bg-bg-main/30 hover:shadow-sm sm:gap-2 sm:px-3"
          :class="[
            removable
              ? 'grid-cols-[minmax(0,1fr)_2.25rem_2.25rem_2.25rem] sm:grid-cols-[minmax(0,1fr)_2.5rem_2.5rem_2.5rem]'
              : 'grid-cols-[minmax(0,1fr)_2.25rem_2.25rem] sm:grid-cols-[minmax(0,1fr)_2.5rem_2.5rem]',
            {
              'border border-selected-border bg-selected-bg text-selected-text':
                currentTrack?.id === track.id,
              'border border-transparent': currentTrack?.id !== track.id,
            },
          ]"
        >
          <button
            type="button"
            class="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 text-left sm:grid-cols-[2.5rem_minmax(0,1fr)_8rem] sm:gap-3"
            @click="emit('playTrack', track)"
          >
            <span class="font-mono text-xs text-text-muted tabular-nums transition group-hover:text-text-main">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="min-w-0">
              <span
                class="block truncate text-sm font-semibold transition group-hover:translate-x-1"
                :class="currentTrack?.id === track.id ? 'text-selected-text' : 'text-text-main'"
              >
                {{ trackTitle(track) }}
              </span>
              <span
                class="block truncate text-xs transition group-hover:translate-x-1 group-hover:text-text-main/70"
                :class="currentTrack?.id === track.id ? 'text-selected-text/80' : 'text-text-muted'"
              >
                {{ track.artist }}
              </span>
            </span>
            <span class="hidden truncate text-xs text-text-muted transition group-hover:text-text-main/70 sm:block">
              {{ isHotTrack(track) ? (track.source === 'qq-music' ? t('music.qqMusic') : t('music.cloudMusic')) : t('music.localAudio') }}
            </span>
          </button>

          <div class="relative flex justify-center">
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-main/35 hover:text-text-main sm:size-9"
              :aria-expanded="openTrackId === track.id"
              :aria-label="t('aria.addTrackToPlaylist')"
              @click="togglePlaylistMenu(track.id)"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>

            <Transition name="playlist-menu">
              <div
                v-if="openTrackId === track.id"
                class="absolute right-0 top-11 z-20 w-48 rounded-xl border border-border-default bg-surface p-1 shadow-main"
              >
                <p
                  v-if="playlists.length === 0"
                  class="m-0 px-3 py-2 text-xs text-text-muted"
                >
                  {{ t('playlist.empty') }}
                </p>
                <button
                  v-for="playlist in playlists"
                  v-else
                  :key="playlist.id"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-text-muted transition hover:bg-bg-main/30 hover:text-text-main"
                  @click="addToPlaylist(track, playlist.id)"
                >
                  <span class="truncate">{{ playlist.name }}</span>
                  <span
                    v-if="isTrackInPlaylist(track, playlist)"
                    class="ml-2 shrink-0 text-[10px] text-text-muted"
                  >
                    {{ t('common.added') }}
                  </span>
                </button>
              </div>
            </Transition>
          </div>

          <button
            v-if="removable"
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-main/35 hover:text-text-main sm:size-9"
            :aria-label="t('aria.removeTrackFromPlaylist')"
            @click="emit('removeTrack', track.id)"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          </button>

          <span
            class="inline-flex size-8 items-center justify-center rounded-full border transition group-hover:bg-text-main group-hover:text-bg-main sm:size-9"
            :class="
              currentTrack?.id === track.id && isPlaying
                ? 'border-selected-border bg-surface text-text-main shadow-sm'
                : 'border-transparent bg-bg-main/35 text-text-main'
            "
            aria-hidden="true"
          >
            <svg
              v-if="currentTrack?.id === track.id && isPlaying"
              class="size-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 5h4v14H7z" />
              <path d="M13 5h4v14h-4z" />
            </svg>
            <svg v-else class="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.playlist-menu-enter-active,
.playlist-menu-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.playlist-menu-enter-from,
.playlist-menu-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem) scale(0.98);
}
</style>
