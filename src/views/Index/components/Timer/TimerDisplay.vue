<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { formattedTime } = storeToRefs(timerStore)
</script>

<template>
  <p
    class="select-none text-[88px] font-thin leading-none tracking-tighter text-text-main tabular-nums sm:text-[120px] md:text-[180px]"
  >
    {{ formattedTime }}
  </p>
</template>
