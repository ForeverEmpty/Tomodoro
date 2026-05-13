<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ModeButton from './ModeButton.vue'
import { useI18n } from '@/i18n'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { activeMode } = storeToRefs(timerStore)
const { t } = useI18n()
</script>

<template>
  <div class="flex shrink-0 gap-2 rounded-full border border-border-soft bg-control-bg p-1 font-sans">
    <ModeButton :isActive="activeMode === 'Focus'" @click="timerStore.setMode('Focus')">
      {{ t('mode.focus') }}
    </ModeButton>
    <ModeButton :isActive="activeMode === 'Break'" @click="timerStore.setMode('Break')">
      {{ t('mode.break') }}
    </ModeButton>
    <ModeButton :isActive="activeMode === 'Rest'" @click="timerStore.setMode('Rest')">
      {{ t('mode.rest') }}
    </ModeButton>
  </div>
</template>
