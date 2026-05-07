<script setup lang="ts">
import Header from './Header/index.vue'
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
  </div>
</template>

<style scoped></style>
