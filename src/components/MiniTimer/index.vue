<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MiniTimerControls from './MiniTimerControls.vue'
import MiniTimerDisplay from './MiniTimerDisplay.vue'
import ModeSwitchButton from './ModeSwitchButton.vue'
import RoundsProgress from './RoundsProgress.vue'
import { useMiniTimerMode } from './useMiniTimerMode'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { activeMode, completedRounds, formattedTime, isRunning } = storeToRefs(timerStore)
const { switchMode } = useMiniTimerMode(activeMode, timerStore.setMode)
</script>

<template>
  <div
    class="flex items-center gap-5 rounded-full border border-white/45 bg-surface/35 px-3 py-2 shadow-main backdrop-blur-2xl"
  >
    <ModeSwitchButton :active-mode="activeMode" @switch="switchMode" />
    <MiniTimerDisplay :time="formattedTime" />
    <MiniTimerControls
      :is-running="isRunning"
      @toggle="timerStore.toggle"
      @reset="timerStore.reset"
    />
    <RoundsProgress :completed-rounds="completedRounds" :total-rounds="timerStore.totalRounds" />
  </div>
</template>
