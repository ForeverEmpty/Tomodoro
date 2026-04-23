<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { header } from '@/config/header'
import { useTheme } from '@/hooks/useTheme'

const route = useRoute()
const navItems = header()
const { effectiveTheme, mode, toggleTheme } = useTheme()

const themeAriaLabel = computed(() => {
  if (mode.value === 'system') {
    return 'Theme follows system. Click to switch to light mode'
  }
  if (mode.value === 'light') {
    return 'Light mode enabled. Click to switch to dark mode'
  }
  return 'Dark mode enabled. Click to switch to system mode'
})
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 h-16 bg-transparent px-6 backdrop-blur md:px-12">
    <div class="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-2.5 w-2.5 rounded-full bg-accent"></div>
        <div class="text-sm font-semibold tracking-wider uppercase text-text-main">Tomodoro</div>
      </div>

      <div class="flex items-center gap-6">
        <div class="hidden md:flex gap-8 items-center">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="item.onClick"
            class="text-xs font-medium uppercase tracking-wider pb-1 text-text-muted hover:text-hover-text transition-colors duration-300"
            :class="{ 'text-text-main border-b-2 border-text-main': item.path === route.path }"
          >
            {{ item.label }}
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border-default bg-surface text-text-main hover:bg-control-bg"
          :aria-label="themeAriaLabel"
          @click="toggleTheme"
        >
          <svg
            v-if="mode === 'system'"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3.5" y="4.5" width="17" height="12" rx="1.6" />
            <path d="M8 19.5h8" />
            <path d="M10 16.5v3" />
            <path d="M14 16.5v3" />
          </svg>
          <svg
            v-else-if="effectiveTheme === 'light'"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2" />
            <path d="M12 19.3v2.2" />
            <path d="M21.5 12h-2.2" />
            <path d="M4.7 12H2.5" />
            <path d="M18.7 5.3l-1.6 1.6" />
            <path d="M6.9 17.1l-1.6 1.6" />
            <path d="M18.7 18.7l-1.6-1.6" />
            <path d="M6.9 6.9L5.3 5.3" />
          </svg>
          <svg
            v-else
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20.2 14.2A8.5 8.5 0 1 1 9.8 3.8a7 7 0 0 0 10.4 10.4z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
