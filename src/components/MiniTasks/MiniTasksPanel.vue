<script setup lang="ts">
import MiniTaskItem from './MiniTaskItem.vue'
import { useI18n } from '@/i18n'
import type { Task } from '@/stores/tasksStore'

defineProps<{
  tasks: Task[]
  pendingCount: number
  placement?: 'top' | 'bottom'
}>()

const emit = defineEmits<{
  toggleTask: [id: number]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="absolute right-0 z-50 w-72 rounded-2xl border border-white/45 bg-surface/45 p-4 shadow-main backdrop-blur-2xl"
    :class="placement === 'bottom' ? 'top-18' : 'bottom-18'"
  >
    <div class="mb-3 flex items-center justify-between border-b border-border-soft pb-2">
      <h2 class="m-0 text-xs font-bold uppercase tracking-[0.08em] text-text-main">
        {{ t('tasks.title') }}
      </h2>
      <span class="font-mono text-[10px] text-text-muted">
        {{ t('miniTasks.left', { count: pendingCount }) }}
      </span>
    </div>

    <ul v-if="tasks.length > 0" class="max-h-56 space-y-2 overflow-y-auto pr-1">
      <MiniTaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggleTask', $event)"
      />
    </ul>

    <p
      v-else
      class="m-0 px-3 py-4 text-center text-sm text-text-muted"
    >
      {{ t('tasks.emptyMini') }}
    </p>
  </div>
</template>
