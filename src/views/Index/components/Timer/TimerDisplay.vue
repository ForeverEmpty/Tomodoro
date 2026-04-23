<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { formattedTime } = storeToRefs(timerStore)
</script>

<template>
  <p
    class="text-[120px] md:text-[180px] font-thin text-text-main leading-none tracking-tighter tabular-nums select-none"
  >
    {{ formattedTime }}
  </p>
</template>
