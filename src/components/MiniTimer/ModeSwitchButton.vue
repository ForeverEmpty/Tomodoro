<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { TimerMode } from '@/stores/timerStore'

const props = defineProps<{
  activeMode: TimerMode
}>()

const emit = defineEmits<{
  switch: []
}>()

const { t } = useI18n()

const activeModeLabel = computed(() => {
  if (props.activeMode === 'Break') {
    return t('mode.break')
  }
  if (props.activeMode === 'Rest') {
    return t('mode.rest')
  }
  return t('mode.focus')
})
</script>

<template>
  <button
    type="button"
    class="inline-flex size-11 items-center justify-center rounded-full border border-white/45 bg-bg-main/35 text-text-main backdrop-blur-xl hover:bg-surface/55"
    :aria-label="t('aria.switchTimerMode', { mode: activeModeLabel })"
    @click="emit('switch')"
  >
    <svg
      v-if="activeMode === 'Focus'"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2.5v2" />
      <path d="M12 19.5v2" />
      <path d="M2.5 12h2" />
      <path d="M19.5 12h2" />
    </svg>
    <svg
      v-else-if="activeMode === 'Break'"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M7 8h8v6a4 4 0 0 1-8 0z" />
      <path d="M15 10h2.5a2 2 0 0 1 0 4H15" />
      <path d="M6 20h12" />
      <path d="M9 4v1.5" />
      <path d="M13 4v1.5" />
    </svg>
    <svg
      v-else
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.2 14.2A8.5 8.5 0 1 1 9.8 3.8a7 7 0 0 0 10.4 10.4z" />
    </svg>
  </button>
</template>
