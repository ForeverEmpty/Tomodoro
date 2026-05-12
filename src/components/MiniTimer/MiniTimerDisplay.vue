<script setup lang="ts">
withDefaults(defineProps<{
  time: string
  compact?: boolean
}>(), {
  compact: false,
})
</script>

<template>
  <p
    class="m-0 select-none font-thin leading-none text-text-main tabular-nums"
    :class="compact ? 'min-w-24 text-3xl' : 'min-w-28 text-4xl'"
  >
    {{ time }}
  </p>
</template>
