<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import MusicPlayerPanel from './MusicPlayerPanel.vue'
import { useI18n } from '@/i18n'
import { useMusicStore } from '@/stores/musicStore'

const musicStore = useMusicStore()
const { isPlaying } = storeToRefs(musicStore)
const { t } = useI18n()
const props = defineProps<{
  dockInSounds?: boolean
  visible?: boolean
}>()

const LONG_PRESS_MS = 100
const BUBBLE_SIZE = 56
const EDGE_GAP = 12
const PANEL_GAP = 12
const PANEL_WIDTH = 416
const PANEL_HEIGHT = 116

const isOpen = ref(false)
const viewport = ref({
  width: typeof window === 'undefined' ? 1280 : window.innerWidth,
  height: typeof window === 'undefined' ? 720 : window.innerHeight,
})
const position = ref({
  x: typeof window === 'undefined' ? 24 : window.innerWidth - 88,
  y: typeof window === 'undefined' ? 120 : window.innerHeight - 96,
})
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const panelHost = ref<HTMLElement | null>(null)
const panelSize = ref({
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
})
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let activePointerId: number | null = null
let pointerStart = { x: 0, y: 0 }
let panelResizeObserver: ResizeObserver | null = null

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const panelPlacement = computed(() => {
  if (typeof window === 'undefined') {
    return {
      originClass: 'origin-bottom-right',
      style: {
        right: `calc(100% + ${PANEL_GAP}px)`,
        bottom: '0',
        '--music-panel-offset-x': '10px',
        '--music-panel-offset-y': '0px',
      },
    }
  }

  const { width, height } = viewport.value
  const { width: actualPanelWidth, height: actualPanelHeight } = panelSize.value
  const bubbleLeft = position.value.x
  const bubbleTop = position.value.y
  const bubbleRight = bubbleLeft + BUBBLE_SIZE
  const bubbleBottom = bubbleTop + BUBBLE_SIZE
  const availableLeft = bubbleLeft - EDGE_GAP - PANEL_GAP
  const availableRight = width - bubbleRight - EDGE_GAP - PANEL_GAP
  const availableTop = bubbleTop - EDGE_GAP - PANEL_GAP
  const availableBottom = height - bubbleBottom - EDGE_GAP - PANEL_GAP
  const verticalTop = clamp(
    bubbleTop,
    EDGE_GAP,
    Math.max(EDGE_GAP, height - EDGE_GAP - actualPanelHeight),
  )
  const horizontalLeft = clamp(
    bubbleLeft + (BUBBLE_SIZE - actualPanelWidth) / 2,
    EDGE_GAP,
    Math.max(EDGE_GAP, width - EDGE_GAP - actualPanelWidth),
  )

  if (availableRight >= actualPanelWidth || availableRight >= availableLeft) {
    return {
      originClass: verticalTop > bubbleTop ? 'origin-top-left' : 'origin-bottom-left',
      style: {
        left: `${bubbleRight + PANEL_GAP}px`,
        top: `${verticalTop}px`,
        '--music-panel-anchor-x': '0px',
        '--music-panel-anchor-y': '0px',
        '--music-panel-offset-x': '-10px',
        '--music-panel-offset-y': '0px',
      },
    }
  }

  if (availableLeft >= actualPanelWidth) {
    return {
      originClass: verticalTop > bubbleTop ? 'origin-top-right' : 'origin-bottom-right',
      style: {
        left: `${bubbleLeft - PANEL_GAP}px`,
        top: `${verticalTop}px`,
        '--music-panel-anchor-x': '-100%',
        '--music-panel-anchor-y': '0px',
        '--music-panel-offset-x': '10px',
        '--music-panel-offset-y': '0px',
      },
    }
  }

  if (availableBottom >= actualPanelHeight || availableBottom >= availableTop) {
    return {
      originClass: 'origin-top',
      style: {
        left: `${horizontalLeft}px`,
        top: `${bubbleBottom + PANEL_GAP}px`,
        '--music-panel-anchor-x': '0px',
        '--music-panel-anchor-y': '0px',
        '--music-panel-offset-x': '0px',
        '--music-panel-offset-y': '-10px',
      },
    }
  }

  return {
    originClass: 'origin-bottom',
    style: {
      left: `${horizontalLeft}px`,
      top: `${Math.max(EDGE_GAP, bubbleTop - PANEL_GAP - actualPanelHeight)}px`,
      '--music-panel-anchor-x': '0px',
      '--music-panel-anchor-y': '0px',
      '--music-panel-offset-x': '0px',
      '--music-panel-offset-y': '10px',
    },
  }
})

const dockedPanelStyle = computed(() => {
  const { width, height } = viewport.value
  const { width: actualPanelWidth, height: actualPanelHeight } = panelSize.value
  const centerX = width / 2 + 136
  const left = clamp(
    centerX - actualPanelWidth / 2,
    EDGE_GAP,
    Math.max(EDGE_GAP, width - EDGE_GAP - actualPanelWidth),
  )
  const top = clamp(
    height - 32 - actualPanelHeight,
    EDGE_GAP,
    Math.max(EDGE_GAP, height - EDGE_GAP - actualPanelHeight),
  )

  return {
    left: `${left}px`,
    top: `${top}px`,
    '--music-panel-anchor-x': '0px',
    '--music-panel-anchor-y': '0px',
    '--music-panel-offset-x': '0px',
    '--music-panel-offset-y': '10px',
  }
})

const activePanelPlacement = computed(() => (
  props.dockInSounds
    ? {
        originClass: 'origin-bottom',
        style: dockedPanelStyle.value,
      }
    : panelPlacement.value
))

const updatePanelSize = async () => {
  await nextTick()
  const rect = panelHost.value?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) {
    return
  }

  panelSize.value = {
    width: rect.width,
    height: rect.height,
  }
}

const clearLongPressTimer = () => {
  if (longPressTimer === null) {
    return
  }

  clearTimeout(longPressTimer)
  longPressTimer = null
}

const movePlayer = (event: PointerEvent) => {
  const nextX = Math.min(
    viewport.value.width - BUBBLE_SIZE - EDGE_GAP,
    Math.max(EDGE_GAP, event.clientX - dragOffset.value.x),
  )
  const nextY = Math.min(
    viewport.value.height - BUBBLE_SIZE - EDGE_GAP,
    Math.max(84, event.clientY - dragOffset.value.y),
  )
  position.value = { x: nextX, y: nextY }
}

const updateViewport = () => {
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  position.value = {
    x: clamp(position.value.x, EDGE_GAP, window.innerWidth - BUBBLE_SIZE - EDGE_GAP),
    y: clamp(position.value.y, 84, window.innerHeight - BUBBLE_SIZE - EDGE_GAP),
  }
  void updatePanelSize()
}

const stopDragging = () => {
  clearLongPressTimer()
  isDragging.value = false
  activePointerId = null
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerCancel)
}

const startDragging = (event: PointerEvent) => {
  isDragging.value = true
  activePointerId = event.pointerId
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerCancel)
  movePlayer(event)
}

const onPointerDown = (event: PointerEvent) => {
  pointerStart = { x: event.clientX, y: event.clientY }
  dragOffset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  }
  longPressTimer = setTimeout(() => {
    startDragging(event)
  }, LONG_PRESS_MS)
}

const onPointerMove = (event: PointerEvent) => {
  const movedDistance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
  if (!isDragging.value && movedDistance > 8) {
    clearLongPressTimer()
    return
  }

  if (!isDragging.value) {
    return
  }

  movePlayer(event)
}

const onPointerUp = () => {
  const wasDragging = isDragging.value
  stopDragging()
  if (!wasDragging) {
    isOpen.value = !isOpen.value
  }
}

function onWindowPointerMove(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== activePointerId) {
    return
  }

  movePlayer(event)
}

function onWindowPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  stopDragging()
}

function onWindowPointerCancel(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  stopDragging()
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  panelResizeObserver = new ResizeObserver(() => {
    void updatePanelSize()
  })
  if (panelHost.value) {
    panelResizeObserver.observe(panelHost.value)
  }
})

onBeforeUnmount(() => {
  stopDragging()
  panelResizeObserver?.disconnect()
  window.removeEventListener('resize', updateViewport)
})

watch(isOpen, (open) => {
  if (open) {
    void updatePanelSize()
  }
})
</script>

<template>
  <div
    v-show="visible && !dockInSounds"
    class="fixed z-40"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <button
      type="button"
      class="grid size-14 cursor-grab place-items-center overflow-hidden rounded-full border border-white/45 bg-surface/35 p-2 shadow-main backdrop-blur-2xl active:cursor-grabbing"
      :aria-label="isOpen ? t('aria.hideMusicPlayer') : t('aria.showMusicPlayer')"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="stopDragging"
    >
      <svg class="size-9" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M31.6 23.1c12.3 0 20.2 7.3 20.2 17.2 0 8.8-7.4 15.3-19.8 15.3S12.2 49.1 12.2 40.3c0-9.9 7.1-17.2 19.4-17.2Z"
          fill="#ef4444"
        />
        <path
          d="M32 24.1c-1.8-6.1 1.5-11.2 7.8-12.8 1.1 5.5-1.8 10.9-7.8 12.8Z"
          fill="#22c55e"
        />
        <path
          d="M32.4 24.2c-4.6-2-7.4-5.6-7.6-10.5 5.6.1 9.3 3.7 7.6 10.5Z"
          fill="#16a34a"
        />
        <path
          d="M22.5 36.5c1.8-3.1 5.2-4.9 9.5-4.9"
          stroke="#fecaca"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
      <span
        v-if="isPlaying"
        class="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface"
        aria-hidden="true"
      />
    </button>
  </div>

  <Transition name="music-pop">
    <div
      ref="panelHost"
      v-show="visible && (dockInSounds || isOpen)"
      class="music-player-host w-max max-w-[calc(100vw-1.5rem)]"
      :class="[activePanelPlacement.originClass, { 'is-dragging': isDragging }]"
      :style="activePanelPlacement.style"
    >
      <MusicPlayerPanel :expanded="dockInSounds || isOpen" />
    </div>
  </Transition>
</template>

<style scoped>
.music-player-host {
  position: fixed;
  z-index: 40;
  transform: translate(var(--music-panel-anchor-x, 0px), var(--music-panel-anchor-y, 0px));
  transition:
    left 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.music-player-host.is-dragging {
  transition: none;
}

.music-pop-enter-active,
.music-pop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.24s ease;
}

.music-pop-enter-from,
.music-pop-leave-to {
  opacity: 0;
  transform:
    translate(var(--music-panel-anchor-x, 0px), var(--music-panel-anchor-y, 0px))
    translate(var(--music-panel-offset-x), var(--music-panel-offset-y))
    scale(0.96);
  filter: blur(8px);
}

.music-pop-enter-to,
.music-pop-leave-from {
  opacity: 1;
  transform: translate(var(--music-panel-anchor-x, 0px), var(--music-panel-anchor-y, 0px)) scale(1);
  filter: blur(0);
}
</style>
