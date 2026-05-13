<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MiniTimerControls from './MiniTimerControls.vue'
import MiniTimerDisplay from './MiniTimerDisplay.vue'
import ModeSwitchButton from './ModeSwitchButton.vue'
import RoundsProgress from './RoundsProgress.vue'
import { useMiniTimerMode } from './useMiniTimerMode'
import { useI18n } from '@/i18n'
import { useTimerStore } from '@/stores/timerStore'

withDefaults(
  defineProps<{
    variant?: 'floating' | 'sidebar'
  }>(),
  {
    variant: 'floating',
  },
)

const timerStore = useTimerStore()
const { activeMode, completedRounds, formattedTime, isRunning } = storeToRefs(timerStore)
const { switchMode } = useMiniTimerMode(activeMode, timerStore.setMode)
const { t } = useI18n()
</script>

<template>
  <div
    v-if="variant === 'floating'"
    class="flex max-w-full flex-wrap items-center justify-center gap-3 rounded-3xl border border-white/45 bg-surface/35 px-3 py-2 shadow-main backdrop-blur-2xl sm:flex-nowrap sm:gap-5 sm:rounded-full"
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

  <div v-else class="w-full border-t border-border-soft pt-4">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
        {{ t('nav.timer') }}
      </p>
      <RoundsProgress :completed-rounds="completedRounds" :total-rounds="timerStore.totalRounds" />
    </div>

    <div class="mb-3 flex items-center justify-between gap-3">
      <MiniTimerDisplay :time="formattedTime" compact />
      <ModeSwitchButton :active-mode="activeMode" @switch="switchMode" />
    </div>

    <MiniTimerControls
      :is-running="isRunning"
      @toggle="timerStore.toggle"
      @reset="timerStore.reset"
    />
  </div>
</template>
