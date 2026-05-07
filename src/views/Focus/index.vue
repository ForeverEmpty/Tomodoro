<script setup lang="ts">
import { computed } from 'vue'
import MiniTasks from '@/components/MiniTasks/index.vue'
import MiniTimer from '@/components/MiniTimer/index.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const focusBackgroundStyle = computed(() => {
  if (!settingsStore.activeBackground) {
    return {}
  }

  return {
    backgroundImage: `linear-gradient(rgb(248 250 252 / 0.22), rgb(248 250 252 / 0.22)), url(${settingsStore.activeBackground})`,
  }
})
</script>

<template>
  <section
    class="-mt-24 flex min-h-screen w-full flex-col items-center justify-end bg-cover bg-center pb-10 pt-24"
    :style="focusBackgroundStyle"
  >
    <div class="flex items-end gap-3">
      <MiniTimer />
      <MiniTasks />
    </div>
  </section>
</template>
