<script setup lang="ts">
import { useI18n } from '@/i18n'

defineProps<{
  isOpen: boolean
  pendingCount: number
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="relative inline-flex size-15 items-center justify-center rounded-full border border-white/45 bg-surface/35 text-text-main shadow-main backdrop-blur-2xl hover:bg-surface/55"
    :aria-expanded="isOpen"
    :aria-label="t('aria.toggleMiniTasks')"
    @click="emit('toggle')"
  >
    <svg
      class="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6l1 1 2-2" />
      <path d="M4 12l1 1 2-2" />
      <path d="M4 18l1 1 2-2" />
    </svg>

    <span
      v-if="pendingCount > 0"
      class="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-semibold text-white"
    >
      {{ pendingCount }}
    </span>
  </button>
</template>
