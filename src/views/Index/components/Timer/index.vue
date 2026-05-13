<script setup lang="ts">
import ModeSelector from './ModeSelector.vue'
import ProgressSection from './ProgressSection.vue'
import TimerControls from './TimerControls.vue'
import TimerDisplay from './TimerDisplay.vue'
</script>

<template>
  <div
    class="flex w-full max-w-xl flex-col items-center gap-7 rounded-2xl px-4 py-6 font-sans sm:px-6 sm:py-8 md:gap-8 md:px-12 md:py-10"
  >
    <ModeSelector />
    <TimerDisplay />
    <TimerControls />
    <ProgressSection />
  </div>
</template>
