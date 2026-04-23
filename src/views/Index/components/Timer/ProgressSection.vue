<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { completedRounds } = storeToRefs(timerStore)

const roundIndexes = computed(() =>
  Array.from({ length: timerStore.totalRounds }, (_, index) => index),
)
</script>

<template>
  <section class="flex flex-col items-center gap-2 font-sans">
    <p class="m-0 text-xs uppercase tracking-[0.08em] text-text-muted">Round Progress</p>
    <div class="flex items-center gap-2">
      <span
        v-for="index in roundIndexes"
        :key="index"
        class="h-2.5 w-2.5 rounded-full bg-border-default transition-colors duration-200"
        :class="{ 'bg-accent': index < completedRounds }"
      />
    </div>
    <p class="m-0 font-mono text-xs tabular-nums text-text-subtle">
      {{ completedRounds }} / {{ timerStore.totalRounds }}
    </p>
  </section>
</template>
