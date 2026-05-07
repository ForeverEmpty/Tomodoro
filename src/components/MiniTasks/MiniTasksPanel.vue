<script setup lang="ts">
import MiniTaskItem from './MiniTaskItem.vue'
import type { Task } from '@/stores/tasksStore'

defineProps<{
  tasks: Task[]
  pendingCount: number
}>()

const emit = defineEmits<{
  toggleTask: [id: number]
}>()
</script>

<template>
  <div
    class="absolute bottom-18 right-0 w-72 rounded-2xl border border-white/45 bg-surface/45 p-4 shadow-main backdrop-blur-2xl"
  >
    <div class="mb-3 flex items-center justify-between border-b border-border-soft pb-2">
      <h2 class="m-0 text-xs font-bold uppercase tracking-[0.08em] text-text-main">Tasks</h2>
      <span class="font-mono text-[10px] text-text-muted">{{ pendingCount }} left</span>
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
      class="m-0 rounded-xl border border-dashed border-border-default px-3 py-4 text-sm text-text-muted"
    >
      No tasks yet.
    </p>
  </div>
</template>
