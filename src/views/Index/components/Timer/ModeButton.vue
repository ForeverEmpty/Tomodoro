<script lang="ts">
interface ModeButtonProps {
  isActive?: boolean
  onClick?: () => void
}
</script>

<script setup lang="ts">
defineProps<ModeButtonProps>()
</script>

<template>
  <button
    class="rounded-full px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200 sm:px-6"
    :class="{
      'border border-border-default bg-surface text-text-main shadow-sm': isActive,
      'text-text-muted hover:text-hover-text': !isActive,
    }"
    @click="onClick"
  >
    <slot />
  </button>
</template>
