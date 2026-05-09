<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MiniTasks from '@/components/MiniTasks/index.vue'
import MiniTimer from '@/components/MiniTimer/index.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.loadUploadedBackground()
})

const isVideoBackground = computed(() => {
  const background = settingsStore.activeBackground
  if (!background) return false
  if (settingsStore.isUploadedBackground && settingsStore.uploadedBackgroundIsVideo) return true
  return (
    background.toLowerCase().endsWith('.mp4') ||
    background.toLowerCase().endsWith('.webm') ||
    background.toLowerCase().endsWith('.ogg')
  )
})

const focusBackgroundStyle = computed(() => {
  if (!settingsStore.activeBackground || isVideoBackground.value) {
    return {}
  }

  return {
    backgroundImage: `url(${settingsStore.activeBackground})`,
  }
})
</script>

<template>
  <section
    class="-mt-24 flex min-h-screen w-full flex-col items-center justify-end bg-cover bg-center pb-10 pt-24 relative"
    :style="focusBackgroundStyle"
  >
    <video
      v-if="isVideoBackground"
      class="absolute inset-0 w-full h-full object-cover"
      autoplay
      muted
      loop
      playsinline
      :src="settingsStore.activeBackground"
    />
    <div class="flex items-end gap-3 relative z-10">
      <MiniTimer />
      <MiniTasks />
    </div>
  </section>
</template>
