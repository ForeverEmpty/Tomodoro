<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { Task } from '@/stores/tasksStore'

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()

const { t } = useI18n()
</script>

<template>
  <li
    class="flex items-center gap-2 rounded-xl border border-white/35 bg-bg-main/35 px-3 py-2 backdrop-blur-xl"
  >
    <button
      type="button"
      class="inline-flex size-5 items-center justify-center rounded-full border border-border-default text-[10px] font-bold"
      :class="
        task.completed ? 'border-accent bg-accent text-white' : 'text-text-muted hover:text-text-main'
      "
      :aria-label="task.completed ? t('aria.markTaskPending') : t('aria.markTaskCompleted')"
      @click="emit('toggle', task.id)"
    >
      <span v-if="task.completed">✓</span>
    </button>
    <p
      class="m-0 flex-1 truncate text-sm"
      :class="task.completed ? 'text-text-subtle line-through' : 'text-text-main'"
    >
      {{ task.title }}
    </p>
  </li>
</template>
