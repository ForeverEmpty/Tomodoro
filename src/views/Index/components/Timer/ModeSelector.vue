<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ModeButton from './ModeButton.vue'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { activeMode } = storeToRefs(timerStore)
</script>

<template>
  <div class="flex shrink-0 gap-2 rounded-full border border-border-soft bg-control-bg p-1 font-sans">
    <ModeButton :isActive="activeMode === 'Focus'" @click="timerStore.setMode('Focus')">
      Focus
    </ModeButton>
    <ModeButton :isActive="activeMode === 'Break'" @click="timerStore.setMode('Break')">
      Break
    </ModeButton>
    <ModeButton :isActive="activeMode === 'Rest'" @click="timerStore.setMode('Rest')">
      Rest
    </ModeButton>
  </div>
</template>
