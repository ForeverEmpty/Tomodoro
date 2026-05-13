<script setup lang="ts">
import type { TimerSettingKey } from '@/config/setting'
import { useI18n } from '@/i18n'

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

const { t } = useI18n()

const timerLabel = (key: TimerSettingKey) => {
  const labels: Record<TimerSettingKey, Parameters<typeof t>[0]> = {
    focus: 'mode.focus',
    break: 'mode.break',
    rest: 'mode.rest',
  }

  return labels[key] ? t(labels[key]) : toTitleCase(key)
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
        <h2 class="m-0 text-sm font-medium text-text-main">{{ timerLabel(key) }}</h2>
        <p class="m-0 mt-1 text-xs text-text-muted">{{ t('timer.durationInMinutes') }}</p>
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
