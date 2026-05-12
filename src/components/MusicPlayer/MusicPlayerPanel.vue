<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/musicStore'

defineProps<{
  expanded?: boolean
}>()

type APlayerInstance = {
  on: (event: 'play' | 'pause' | 'ended', handler: () => void) => void
  pause: () => void
  play: () => void
  seek: (time: number) => void
}

type MetingElement = HTMLElement & {
  aplayer?: APlayerInstance
}

const musicStore = useMusicStore()
const { currentTrack, metingLoop, metingOrder, playerKey, playerSource, playMode, shouldAutoplay } =
  storeToRefs(musicStore)
const metingElement = ref<MetingElement | null>(null)
let hookedPlayer: APlayerInstance | null = null
let hookTimer: ReturnType<typeof setTimeout> | null = null

const playModeLabel = computed(() => {
  if (playMode.value === 'repeat-one') {
    return '单曲循环'
  }

  if (playMode.value === 'shuffle') {
    return '随机播放'
  }

  return '列表循环'
})

const playerAttributes = computed(() => {
  const base = {
    autoplay: String(shouldAutoplay.value),
    'list-folded': 'true',
    'list-max-height': '180px',
    loop: metingLoop.value,
    mutex: 'true',
    order: metingOrder.value,
    preload: 'metadata',
    'storage-name': 'tomodoro-meting-player',
    theme: '#64748b',
    volume: '0.45',
  }

  if (playerSource.value.kind === 'meting') {
    if (playerSource.value.track.server && playerSource.value.track.metingId) {
      return {
        ...base,
        id: playerSource.value.track.metingId,
        server: playerSource.value.track.server,
        type: playerSource.value.track.type ?? 'song',
      }
    }

    return {
      ...base,
      auto: playerSource.value.track.auto,
    }
  }

  return {
    ...base,
    artist: playerSource.value.track.artist,
    cover: playerSource.value.track.cover,
    name: playerSource.value.track.title,
    url: playerSource.value.track.src,
  }
})

const clearHookTimer = () => {
  if (!hookTimer) {
    return
  }

  clearTimeout(hookTimer)
  hookTimer = null
}

const hookAPlayer = async (attempt = 0) => {
  clearHookTimer()
  await nextTick()

  const player = metingElement.value?.aplayer
  if (!player) {
    if (attempt < 30) {
      hookTimer = setTimeout(() => {
        void hookAPlayer(attempt + 1)
      }, 100)
    }
    return
  }

  if (hookedPlayer === player) {
    return
  }

  hookedPlayer = player
  player.on('play', () => musicStore.setPlaybackState(true))
  player.on('pause', () => musicStore.setPlaybackState(false))
  player.on('ended', () => {
    if (playMode.value === 'repeat-one') {
      player.seek(0)
      player.play()
      musicStore.setPlaybackState(true)
      return
    }

    musicStore.handleEnded()
  })

  if (shouldAutoplay.value) {
    player.play()
  }
}

watch(playerKey, () => {
  hookedPlayer = null
  void hookAPlayer()
}, { flush: 'post', immediate: true })

watch(shouldAutoplay, (autoplay) => {
  if (!hookedPlayer) {
    return
  }

  if (autoplay) {
    hookedPlayer.play()
    return
  }

  hookedPlayer.pause()
})

onBeforeUnmount(() => {
  clearHookTimer()
})
</script>

<template>
  <div class="meting-player-shell" :class="{ 'is-expanded': expanded }">
    <div class="meting-player-head">
      <div class="min-w-0">
        <p class="m-0 truncate font-mono text-sm font-semibold text-text-main">
          {{ currentTrack?.title }}
        </p>
        <p class="m-0 mt-0.5 truncate text-xs text-text-muted">
          {{ currentTrack?.artist }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex shrink-0 items-center rounded-full border border-white/45 bg-bg-main/35 px-3 py-1.5 text-xs font-medium text-text-main backdrop-blur-xl hover:bg-surface/55"
        :aria-label="`播放模式：${playModeLabel}`"
        @click="musicStore.togglePlayMode"
      >
        {{ playModeLabel }}
      </button>
    </div>

    <meting-js
      :key="playerKey"
      ref="metingElement"
      v-bind="playerAttributes"
    />
  </div>
</template>

<style scoped>
.meting-player-shell {
  width: min(26rem, calc(100vw - 1.5rem));
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.45);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--color-surface) 42%, transparent);
  box-shadow: var(--shadow-main);
  backdrop-filter: blur(24px);
  transition:
    border-radius 0.28s ease,
    background-color 0.28s ease,
    box-shadow 0.28s ease;
}

.meting-player-shell.is-expanded {
  border-radius: 1.25rem;
}

.meting-player-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem 0;
}

.meting-player-shell :deep(.aplayer) {
  margin: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: var(--color-text-main);
  font-family: var(--font-sans);
}

.meting-player-shell :deep(.aplayer .aplayer-body) {
  background: transparent;
}

.meting-player-shell :deep(.aplayer .aplayer-pic) {
  border-radius: 1rem;
  background-color: rgb(148 163 184 / 0.18);
}

.meting-player-shell :deep(.aplayer .aplayer-info) {
  border-bottom: 0;
  padding-right: 0.875rem;
}

.meting-player-shell :deep(.aplayer .aplayer-info .aplayer-music) {
  display: none;
}

.meting-player-shell :deep(.aplayer.aplayer-withlrc .aplayer-info) {
  height: 5.625rem;
  padding-top: 0.625rem;
}

.meting-player-shell :deep(.aplayer .aplayer-controller) {
  margin-top: 0.25rem;
}

.meting-player-shell :deep(.aplayer .aplayer-time),
.meting-player-shell :deep(.aplayer .aplayer-list ol li),
.meting-player-shell :deep(.aplayer .aplayer-lrc p.aplayer-lrc-current) {
  color: var(--color-text-main);
}

.meting-player-shell :deep(.aplayer .aplayer-time),
.meting-player-shell :deep(.aplayer .aplayer-lrc p),
.meting-player-shell :deep(.aplayer .aplayer-list ol li .aplayer-list-index),
.meting-player-shell :deep(.aplayer .aplayer-list ol li .aplayer-list-author) {
  color: var(--color-text-muted);
}

.meting-player-shell :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time .aplayer-icon path),
.meting-player-shell :deep(.aplayer .aplayer-miniswitcher .aplayer-icon path) {
  fill: var(--color-text-muted);
}

.meting-player-shell :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time .aplayer-icon:hover path),
.meting-player-shell :deep(.aplayer .aplayer-miniswitcher .aplayer-icon:hover path) {
  fill: var(--color-text-main);
}

.meting-player-shell :deep(.aplayer .aplayer-bar-wrap .aplayer-bar),
.meting-player-shell :deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgb(148 163 184 / 0.32);
}

.meting-player-shell :deep(.aplayer .aplayer-list) {
  border-top-color: var(--color-border-soft);
}

.meting-player-shell :deep(.aplayer .aplayer-list ol li) {
  border-top-color: var(--color-border-soft);
}

.meting-player-shell :deep(.aplayer .aplayer-list ol li:hover),
.meting-player-shell :deep(.aplayer .aplayer-list ol li.aplayer-list-light) {
  background: var(--color-selected-bg);
}

.meting-player-shell :deep(.aplayer .aplayer-lrc::before),
.meting-player-shell :deep(.aplayer .aplayer-lrc::after) {
  display: none;
}

.meting-player-shell :deep(.aplayer .aplayer-lrc) {
  height: 3rem;
  margin: 0.125rem 0 0.5rem;
}

.meting-player-shell :deep(.aplayer .aplayer-lrc p) {
  font-size: 0.75rem;
  line-height: 1rem !important;
  height: 1rem !important;
}

.meting-player-shell :deep(.aplayer .aplayer-lrc .aplayer-lrc-contents) {
  width: 100%;
  padding-top: 1rem;
}

.meting-player-shell :deep(.aplayer .aplayer-icon-loop),
.meting-player-shell :deep(.aplayer .aplayer-icon-order) {
  display: none !important;
}
</style>
