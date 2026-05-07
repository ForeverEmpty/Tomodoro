<script setup lang="ts">
defineProps<{
  time: string
}>()
</script>

<template>
  <p
    class="m-0 min-w-28 select-none text-4xl font-thin leading-none tracking-tighter text-text-main tabular-nums"
  >
    {{ time }}
  </p>
</template>
