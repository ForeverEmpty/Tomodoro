<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="mb-8">
    <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Settings</p>
    <h1 class="m-0 mt-2 text-3xl font-semibold text-text-main">{{ title }}</h1>
  </header>
</template>
