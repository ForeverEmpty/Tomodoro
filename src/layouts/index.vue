<script setup lang="ts">
import Header from './Header/index.vue'
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-slate-200 transition-colors duration-700"
  >
    <Header />
    <RouterView />
  </div>
</template>

<style scoped></style>
