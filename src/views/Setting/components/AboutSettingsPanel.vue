<script setup lang="ts">
defineProps<{
  version: string
  logs: string[]
}>()
</script>

<template>
  <div class="max-w-2xl space-y-8">
    <section class="space-y-3">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">Version</h2>
      <p class="m-0 font-mono text-2xl font-light text-text-main">{{ version }}</p>
    </section>

    <section class="space-y-3">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
        Changelog
      </h2>
      <ul class="m-0 space-y-2 p-0">
        <li v-for="log in logs" :key="log" class="flex items-start gap-3 text-sm text-text-subtle">
          <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{{ log }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
