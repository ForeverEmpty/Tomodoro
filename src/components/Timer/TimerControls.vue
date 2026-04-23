<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { isRunning } = storeToRefs(timerStore)
</script>

<template>
  <div class="flex items-center gap-3 font-sans">
    <button
      class="h-11 min-w-30 rounded-full border border-border-default bg-text-main px-6 text-xs font-bold uppercase tracking-[0.08em] text-bg-main shadow-main hover:bg-hover-dark"
      type="button"
      @click="timerStore.toggle()"
    >
      {{ isRunning ? 'Pause' : 'Start' }}
    </button>
    <button
      class="h-11 min-w-30 rounded-full border border-border-default bg-transparent px-6 text-xs font-bold uppercase tracking-[0.08em] text-text-main hover:bg-surface"
      type="button"
      @click="timerStore.reset()"
    >
      Reset
    </button>
  </div>
</template>
