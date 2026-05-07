<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  completedRounds: number
  totalRounds: number
}>()

const radius = 17
const circumference = 2 * Math.PI * radius

const roundProgress = computed(() => {
  if (props.totalRounds <= 0) {
    return 0
  }
  return Math.min(1, props.completedRounds / props.totalRounds)
})

const progressOffset = computed(() => circumference * (1 - roundProgress.value))
</script>

<template>
  <div class="relative size-11">
    <svg class="size-11 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
      <circle
        cx="22"
        cy="22"
        :r="radius"
        class="stroke-border-default"
        fill="none"
        stroke-width="4"
      />
      <circle
        cx="22"
        cy="22"
        :r="radius"
        class="stroke-accent transition-[stroke-dashoffset] duration-300"
        fill="none"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="progressOffset"
      />
    </svg>
    <span
      class="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-medium text-text-main tabular-nums"
    >
      {{ completedRounds }}/{{ totalRounds }}
    </span>
  </div>
</template>
