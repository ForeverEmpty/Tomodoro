<script setup lang="ts">
import ModeSelector from './ModeSelector.vue'
import ProgressSection from './ProgressSection.vue'
import TimerControls from './TimerControls.vue'
import TimerDisplay from './TimerDisplay.vue'
</script>

<template>
  <div
    class="flex w-full max-w-xl flex-col items-center gap-8 rounded-2xl px-6 py-8 font-sans md:px-12 md:py-10"
  >
    <ModeSelector />
    <TimerDisplay />
    <TimerControls />
    <ProgressSection />
  </div>
</template>
