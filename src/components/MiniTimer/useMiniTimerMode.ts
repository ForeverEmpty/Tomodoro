import type { Ref } from 'vue'
import type { TimerMode } from '@/stores/timerStore'

const modes: TimerMode[] = ['Focus', 'Break', 'Rest']

export const useMiniTimerMode = (
  activeMode: Ref<TimerMode>,
  setMode: (mode: TimerMode) => void,
) => {
  const switchMode = () => {
    const currentIndex = modes.indexOf(activeMode.value)
    const nextMode = modes[(currentIndex + 1) % modes.length] ?? 'Focus'
    setMode(nextMode)
  }

  return {
    switchMode,
  }
}
