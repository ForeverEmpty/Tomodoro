import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TimerSettingKey } from '@/config/setting'
import { useSettingsStore } from '@/stores/settingsStore'

export type TimerMode = 'Focus' | 'Break' | 'Rest'

const MODE_TO_SETTING_KEY: Record<TimerMode, TimerSettingKey> = {
  Focus: 'focus',
  Break: 'break',
  Rest: 'rest',
}

const TICK_INTERVAL_MS = 250
const SECOND_PER_MINUTE = 60
const TOTAL_ROUNDS = 4

export const useTimerStore = defineStore('timer', () => {
  const settingsStore = useSettingsStore()

  const buildModeDurations = () => {
    return (Object.keys(MODE_TO_SETTING_KEY) as TimerMode[]).reduce(
      (acc, mode) => {
        acc[mode] = settingsStore.setting.timer[MODE_TO_SETTING_KEY[mode]] * SECOND_PER_MINUTE
        return acc
      },
      {} as Record<TimerMode, number>,
    )
  }

  const modeDurations = ref<Record<TimerMode, number>>({
    ...buildModeDurations(),
  })
  const modeRemaining = ref<Record<TimerMode, number>>({
    ...buildModeDurations(),
  })
  const activeMode = ref<TimerMode>('Focus')
  const remainingSeconds = computed({
    get: () => modeRemaining.value[activeMode.value],
    set: (value: number) => {
      modeRemaining.value[activeMode.value] = Math.max(0, Math.ceil(value))
    },
  })
  const isRunning = ref(false)
  const completedRounds = ref(0)
  const endsAtMs = ref<number | null>(null)

  let timerId: ReturnType<typeof setInterval> | null = null

  const currentModeDuration = computed(() => modeDurations.value[activeMode.value])
  const progress = computed(() => {
    if (currentModeDuration.value <= 0) {
      return 1
    }
    return 1 - remainingSeconds.value / currentModeDuration.value
  })
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / SECOND_PER_MINUTE)
    const seconds = remainingSeconds.value % SECOND_PER_MINUTE
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const clearTicker = () => {
    if (timerId === null) {
      return
    }
    clearInterval(timerId)
    timerId = null
  }

  const syncRemainingFromEndTime = () => {
    if (endsAtMs.value === null) {
      return
    }
    const secondsLeft = Math.max(0, Math.ceil((endsAtMs.value - Date.now()) / 1000))
    remainingSeconds.value = secondsLeft

    if (secondsLeft > 0) {
      return
    }

    if (activeMode.value === 'Focus') {
      completedRounds.value = Math.min(TOTAL_ROUNDS, completedRounds.value + 1)
    }

    isRunning.value = false
    endsAtMs.value = null
    clearTicker()
  }

  const ensureTicker = () => {
    if (timerId !== null) {
      return
    }
    timerId = setInterval(syncRemainingFromEndTime, TICK_INTERVAL_MS)
  }

  const reset = (mode: TimerMode = activeMode.value) => {
    clearTicker()
    isRunning.value = false
    endsAtMs.value = null
    activeMode.value = mode
    modeRemaining.value[mode] = modeDurations.value[mode]
  }

  const setMode = (mode: TimerMode) => {
    if (mode === activeMode.value) {
      return
    }

    if (isRunning.value) {
      syncRemainingFromEndTime()
    }

    isRunning.value = false
    endsAtMs.value = null
    clearTicker()
    activeMode.value = mode
  }

  const start = () => {
    if (isRunning.value) {
      return
    }
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = modeDurations.value[activeMode.value]
    }

    isRunning.value = true
    endsAtMs.value = Date.now() + remainingSeconds.value * 1000
    syncRemainingFromEndTime()
    ensureTicker()
  }

  const pause = () => {
    if (!isRunning.value) {
      return
    }
    syncRemainingFromEndTime()
    isRunning.value = false
    endsAtMs.value = null
    clearTicker()
  }

  const toggle = () => {
    if (isRunning.value) {
      pause()
      return
    }
    start()
  }

  const setModeDuration = (mode: TimerMode, minutes: number) => {
    const safeMinutes = Number.isFinite(minutes) ? Math.max(0, minutes) : 0
    const durationInSeconds = Math.round(safeMinutes * SECOND_PER_MINUTE)

    modeDurations.value[mode] = durationInSeconds

    modeRemaining.value[mode] = durationInSeconds

    if (mode !== activeMode.value) {
      return
    }

    if (isRunning.value) {
      endsAtMs.value = Date.now() + durationInSeconds * 1000
      syncRemainingFromEndTime()
      return
    }

    remainingSeconds.value = durationInSeconds
  }

  const resetRounds = () => {
    completedRounds.value = 0
  }

  return {
    activeMode,
    modeDurations,
    modeRemaining,
    remainingSeconds,
    isRunning,
    totalRounds: TOTAL_ROUNDS,
    completedRounds,
    currentModeDuration,
    progress,
    formattedTime,
    setMode,
    setModeDuration,
    start,
    pause,
    reset,
    resetRounds,
    toggle,
  }
})
