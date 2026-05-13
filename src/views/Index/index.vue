<script setup lang="ts">
import Timer from './components/Timer/index.vue'
import Tasks from './components/Tasks/index.vue'
</script>

<template>
  <div class="mt-14 mb-32 flex w-full max-w-2xl flex-col items-center gap-10 px-4 md:mt-20 md:gap-12">
    <Timer />
    <Tasks />
  </div>
</template>

<style scoped></style>
