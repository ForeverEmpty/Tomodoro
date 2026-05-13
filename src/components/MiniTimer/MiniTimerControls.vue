<script setup lang="ts">
import { useI18n } from '@/i18n'

defineProps<{
  isRunning: boolean
}>()

const emit = defineEmits<{
  toggle: []
  reset: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="inline-flex size-9 items-center justify-center rounded-full bg-text-main text-bg-main hover:bg-hover-dark"
      :aria-label="isRunning ? t('aria.pauseTimer') : t('aria.startTimer')"
      @click="emit('toggle')"
    >
      <svg
        v-if="isRunning"
        class="size-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M7 5h4v14H7z" />
        <path d="M13 5h4v14h-4z" />
      </svg>
      <svg v-else class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>

    <button
      type="button"
      class="inline-flex size-9 items-center justify-center rounded-full border border-white/45 bg-bg-main/35 text-text-main backdrop-blur-xl hover:bg-surface/55"
      :aria-label="t('aria.resetTimer')"
      @click="emit('reset')"
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7v5h5" />
        <path d="M20 12a8 8 0 0 0-14.9-4" />
        <path d="M4.8 16A8 8 0 0 0 20 12" />
      </svg>
    </button>
  </div>
</template>
