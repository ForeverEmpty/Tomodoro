<script setup lang="ts">
import MiniTimer from '@/components/MiniTimer/index.vue'
import { useI18n } from '@/i18n'
import type { PlatformCategory, Playlist } from '../types'

const newPlaylistName = defineModel<string>('newPlaylistName', { required: true })

defineProps<{
  activeCategoryId: string
  activePlaylistId: string
  categories: PlatformCategory[]
  playlists: Playlist[]
}>()

const emit = defineEmits<{
  createPlaylist: []
  selectCategory: [categoryId: string]
  selectPlaylist: [playlistId: string]
}>()

const { t } = useI18n()
</script>

<template>
  <aside class="flex min-h-0 flex-col md:pr-5">
    <div class="min-h-0 flex-1 overflow-y-visible pr-0 md:overflow-y-auto md:pr-1">
      <div class="mb-4">
        <p class="m-0 mb-2 px-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          {{ t('sounds.categories') }}
        </p>
        <div class="mobile-x-scroll flex gap-2 overflow-x-auto pb-1 md:block md:overflow-visible md:pb-0">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="mb-1 flex min-w-40 shrink-0 items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left transition hover:bg-bg-main/30 md:w-full md:min-w-0"
            :class="
              activeCategoryId === category.id
                ? 'border-selected-border bg-selected-bg text-selected-text'
                : 'text-text-muted'
            "
            @click="emit('selectCategory', category.id)"
          >
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold">{{ category.name }}</span>
              <span class="block truncate text-[11px]">{{ category.source }}</span>
            </span>
            <span class="font-mono text-[11px] tabular-nums">{{ category.count }}</span>
          </button>
        </div>
      </div>

    </div>

    <div class="mt-2 border-t border-border-soft pt-3 md:mt-4">
      <div>
        <p class="m-0 mb-2 px-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          {{ t('sounds.playlists') }}
        </p>
        <div class="mobile-x-scroll flex gap-2 overflow-x-auto pb-1 md:block md:overflow-visible md:pb-0">
          <button
            v-for="playlist in playlists"
            :key="playlist.id"
            type="button"
            class="mb-1 flex min-w-40 shrink-0 items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left transition hover:bg-bg-main/30 md:w-full md:min-w-0"
            :class="
              activePlaylistId === playlist.id
                ? 'border-selected-border bg-selected-bg text-selected-text'
                : 'text-text-muted'
            "
            @click="emit('selectPlaylist', playlist.id)"
          >
            <span class="truncate text-sm font-semibold">{{ playlist.name }}</span>
            <span class="font-mono text-[11px] tabular-nums">{{ playlist.count }}</span>
          </button>
        </div>

        <form class="mt-2 flex gap-2 px-2" @submit.prevent="emit('createPlaylist')">
          <input
            v-model="newPlaylistName"
            type="text"
            class="h-9 min-w-0 flex-1 rounded-xl border border-border-default bg-transparent px-3 text-sm text-text-main outline-none placeholder:text-text-muted focus:ring-2 focus:ring-control-bg"
            :placeholder="t('playlist.createPlaceholder')"
          />
          <button
            type="submit"
            class="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-default text-text-main transition hover:bg-bg-main/30"
            :aria-label="t('aria.createPlaylist')"
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
        </form>
      </div>

      <div class="mt-4 hidden md:block">
        <MiniTimer variant="sidebar" />
      </div>
    </div>
  </aside>
</template>
