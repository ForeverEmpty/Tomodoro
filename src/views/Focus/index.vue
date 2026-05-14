<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MiniTasks from '@/components/MiniTasks/index.vue'
import MiniTimer from '@/components/MiniTimer/index.vue'
import { defaultBackgrounds } from '@/config/setting'
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

const onVideoBackgroundError = () => {
  settingsStore.setFocusBackground(defaultBackgrounds[0]?.value ?? '')
}
</script>

<template>
  <section
    class="relative -mt-28 flex min-h-screen w-full flex-col items-center justify-end bg-cover bg-center px-4 pb-28 pt-28 sm:-mt-24 sm:pb-10 sm:pt-24"
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
      @error="onVideoBackgroundError"
    />
    <div class="relative z-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-end">
      <MiniTimer />
      <MiniTasks />
    </div>
  </section>
</template>
