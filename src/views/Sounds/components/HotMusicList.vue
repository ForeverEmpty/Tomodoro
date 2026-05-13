<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import type { HotMusicItem, MusicListView, Playlist } from '../types'

defineProps<{
  activeView?: MusicListView
  activeTrackId?: string
  error?: string
  isLoading: boolean
  isPlaying: boolean
  playlists: Playlist[]
  tracks: HotMusicItem[]
  updatedAt?: string
}>()

const openTrackId = ref<string | null>(null)
const { t } = useI18n()

const emit = defineEmits<{
  addToPlaylist: [track: HotMusicItem, playlistId: string]
  playTrack: [track: HotMusicItem]
}>()

const togglePlaylistMenu = (trackUrl: string) => {
  openTrackId.value = openTrackId.value === trackUrl ? null : trackUrl
}

const addToPlaylist = (track: HotMusicItem, playlistId: string) => {
  emit('addToPlaylist', track, playlistId)
  openTrackId.value = null
}

const hotTrackId = (track: HotMusicItem) => `${track.extra?.songmid ?? track.extra?.id ?? track.url}`

const isTrackInPlaylist = (track: HotMusicItem, playlist: Playlist) => (
  playlist.hotTracks?.some((item) => item.id.endsWith(hotTrackId(track)) || item.auto === track.url) ?? false
)
</script>

<template>
  <main class="flex min-h-0 flex-col">
    <div class="flex flex-col items-start justify-between gap-3 border-b border-border-soft pb-4 sm:flex-row sm:items-center sm:gap-4">
      <div class="min-w-0">
        <p class="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          {{ activeView?.source }}
        </p>
        <h2 class="m-0 mt-1 truncate text-xl font-semibold text-text-main">
          {{ activeView?.name }}
        </h2>
      </div>
      <p class="m-0 shrink-0 font-mono text-xs text-text-muted">
        {{ isLoading ? t('common.loading') : t('common.tracks', { count: tracks.length }) }}
      </p>
    </div>

    <div class="music-list-scroll min-h-0 flex-1 overflow-y-auto py-4 pr-0 sm:pr-2">
      <p v-if="isLoading" class="m-0 px-4 py-8 text-center text-sm text-text-muted">
        {{ t('sounds.loadingHot') }}
      </p>
      <p v-else-if="error" class="m-0 px-4 py-8 text-center text-sm text-text-muted">
        {{ error }}
      </p>
      <p
        v-else-if="tracks.length === 0"
        class="m-0 px-4 py-8 text-center text-sm text-text-muted"
      >
        {{ t('sounds.emptyHot') }}
      </p>

      <div v-else class="grid gap-2">
        <div
          v-for="track in tracks"
          :key="`${track.index}-${track.url}`"
          class="group grid grid-cols-[minmax(0,1fr)_2.25rem_2.25rem] items-center gap-1.5 rounded-xl px-2 py-2 text-left transition duration-200 hover:bg-bg-main/30 hover:shadow-sm sm:grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] sm:gap-2 sm:px-3"
          :class="
            activeTrackId === track.url
              ? 'border border-selected-border bg-selected-bg text-selected-text'
              : 'border border-transparent'
          "
        >
          <button
            type="button"
            class="grid min-w-0 grid-cols-[2rem_2.5rem_minmax(0,1fr)] items-center gap-2 text-left sm:grid-cols-[2.5rem_3rem_minmax(0,1fr)_6rem] sm:gap-3"
            @click="emit('playTrack', track)"
          >
            <span class="font-mono text-xs text-text-muted tabular-nums transition group-hover:text-text-main">
              {{ String(track.index).padStart(2, '0') }}
            </span>
            <img
              :src="track.cover"
              alt=""
              loading="lazy"
              decoding="async"
              class="size-9 rounded-xl border border-border-default bg-surface object-cover sm:size-10"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-text-main transition group-hover:translate-x-1">
                {{ track.title }}
              </span>
              <span class="block truncate text-xs text-text-muted transition group-hover:translate-x-1 group-hover:text-text-main/70">
                {{ track.extra?.artist_names || track.extra?.album || t('music.unknownArtist') }}
              </span>
            </span>
            <span class="hidden truncate text-right text-xs text-text-muted sm:block">
              {{ track.extra?.duration_text || track.hot_value }}
            </span>
          </button>

          <div class="relative flex justify-center">
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-main/35 hover:text-text-main sm:size-9"
              :aria-expanded="openTrackId === track.url"
              :aria-label="t('aria.addTrackToPlaylist')"
              @click="togglePlaylistMenu(track.url)"
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
                v-if="openTrackId === track.url"
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

          <span
            class="inline-flex size-8 items-center justify-center rounded-full border transition group-hover:bg-text-main group-hover:text-bg-main sm:size-9"
            :class="
              activeTrackId === track.url && isPlaying
                ? 'border-selected-border bg-surface text-text-main shadow-sm'
                : 'border-transparent bg-bg-main/35 text-text-main'
            "
            aria-hidden="true"
          >
            <svg
              v-if="activeTrackId === track.url && isPlaying"
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

    <p v-if="updatedAt" class="m-0 border-t border-border-soft pt-3 text-right text-[11px] text-text-muted">
      {{ t('sounds.updated', { time: updatedAt }) }}
    </p>
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
