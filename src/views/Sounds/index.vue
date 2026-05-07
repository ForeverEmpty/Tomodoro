<script setup lang="ts">
import MiniTasks from '@/components/MiniTasks/index.vue'
import MiniTimer from '@/components/MiniTimer/index.vue'
</script>

<template>
  <section class="flex min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-end pb-10">
    <div class="flex items-end gap-3">
      <MiniTimer />
      <MiniTasks />
    </div>
  </section>
</template>
