<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { defaultTimerSound } from '@/config/setting'
import type { SoundOption, TimerSoundId } from '@/config/setting'

const props = defineProps<{
  selectedSound: TimerSoundId
  volume: number
  options: SoundOption[]
}>()

const emit = defineEmits<{
  updateSound: [soundId: TimerSoundId]
  updateVolume: [volume: number]
}>()

const isOpen = ref(false)
const previewAudio = ref<HTMLAudioElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find((option) => option.id === props.selectedSound) ?? defaultTimerSound
})

const volumePercent = computed(() => Math.round(props.volume * 100))

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectSound = (soundId: TimerSoundId) => {
  emit('updateSound', soundId)
  isOpen.value = false
}

const stopPreview = () => {
  if (!previewAudio.value) {
    return
  }

  previewAudio.value.pause()
  previewAudio.value.currentTime = 0
}

const previewSelectedSound = () => {
  if (typeof Audio === 'undefined' || !selectedOption.value.value) {
    return
  }

  stopPreview()
  previewAudio.value = new Audio(selectedOption.value.value)
  previewAudio.value.volume = props.volume
  void previewAudio.value.play().catch(() => {})
}

const updateVolume = (event: Event) => {
  const nextVolume = Number((event.target as HTMLInputElement).value) / 100
  emit('updateVolume', Number.isFinite(nextVolume) ? nextVolume : 0)
}

watch(
  () => props.volume,
  (volume) => {
    if (previewAudio.value) {
      previewAudio.value.volume = volume
    }
  },
)

onBeforeUnmount(() => {
  stopPreview()
})
</script>

<template>
  <section class="max-w-2xl space-y-6">
    <div>
      <h2 class="m-0 text-sm font-medium text-text-main">Timer Complete</h2>
      <p class="m-0 mt-1 text-xs text-text-muted">Choose the sound played when a countdown ends.</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative w-64">
        <button
          type="button"
          class="flex h-10 w-full items-center justify-between rounded-lg border border-border-default bg-surface px-3 text-left text-sm text-text-main shadow-sm outline-none transition hover:bg-control-bg/60 focus:ring-2 focus:ring-control-bg"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          @click="toggleDropdown"
        >
          <span>{{ selectedOption.label }}</span>
          <svg
            class="h-4 w-4 text-text-muted transition"
            :class="{ 'rotate-180': isOpen }"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div
          v-if="isOpen"
          class="absolute left-0 top-12 z-20 w-full overflow-hidden rounded-xl border border-border-default bg-surface p-1 shadow-lg shadow-slate-200/70"
          role="listbox"
        >
          <button
            v-for="option in options"
            :key="option.id"
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-control-bg/70"
            :class="
              option.id === selectedSound
                ? 'bg-control-bg text-text-main'
                : 'text-text-muted hover:text-text-main'
            "
            role="option"
            :aria-selected="option.id === selectedSound"
            @click="selectSound(option.id)"
          >
            <span>{{ option.label }}</span>
            <span
              v-if="option.id === selectedSound"
              class="h-2 w-2 rounded-full bg-accent"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg border border-border-default bg-surface px-4 text-sm font-medium text-text-main shadow-sm transition hover:bg-control-bg/60 focus:outline-none focus:ring-2 focus:ring-control-bg"
        @click="previewSelectedSound"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 5v14l11-7-11-7Z" fill="currentColor" />
        </svg>
        Preview
      </button>
    </div>

    <div class="w-full max-w-sm space-y-2">
      <div class="flex items-center justify-between">
        <label for="sound-volume" class="text-sm font-medium text-text-main">Volume</label>
        <span class="text-xs font-medium text-text-muted">{{ volumePercent }}%</span>
      </div>
      <input
        id="sound-volume"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="volumePercent"
        class="h-2 w-full cursor-pointer accent-accent"
        aria-label="Timer complete sound volume"
        @input="updateVolume"
      />
    </div>
  </section>
</template>
