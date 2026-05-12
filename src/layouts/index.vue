<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header/index.vue'
import FloatingMusicPlayer from '@/components/MusicPlayer/FloatingMusicPlayer.vue'

const route = useRoute()
const showFloatingMusicPlayer = computed(() => {
  return route.path !== '/setting'
})
const dockMusicPlayer = computed(() => route.path === '/sounds')
</script>

<template>
  <div
    class="min-h-screen w-full bg-bg-main text-text-main font-sans transition-colors duration-700 selection:bg-selection"
  >
    <Header />
    <main class="mx-auto flex h-screen w-full justify-center overflow-hidden pt-24">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-route" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <FloatingMusicPlayer
      :visible="showFloatingMusicPlayer"
      :dock-in-sounds="dockMusicPlayer"
    />
  </div>
</template>

<style scoped></style>
