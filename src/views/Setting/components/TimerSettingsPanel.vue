<script setup lang="ts">
import type { TimerSettingKey } from '@/config/setting'

defineProps<{
  entries: [TimerSettingKey, number][]
}>()

const emit = defineEmits<{
  updateTimer: [key: TimerSettingKey, value: string]
}>()

const toTitleCase = (value: string) => {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase())
}
</script>

<template>
  <div class="max-w-2xl divide-y divide-border-soft">
    <section
      v-for="[key, value] in entries"
      :key="key"
      class="flex items-center justify-between gap-6 py-4"
    >
      <div>
        <h2 class="m-0 text-sm font-medium text-text-main">{{ toTitleCase(key) }}</h2>
        <p class="m-0 mt-1 text-xs text-text-muted">Duration in minutes</p>
      </div>

      <input
        type="number"
        min="0"
        :value="value"
        class="h-10 w-48 rounded-lg border border-border-default bg-surface px-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-control-bg"
        @input="emit('updateTimer', key, ($event.target as HTMLInputElement).value)"
      />
    </section>
  </div>
</template>
