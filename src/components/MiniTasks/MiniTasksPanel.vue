<script setup lang="ts">
import { ref } from 'vue'
import MiniTaskItem from './MiniTaskItem.vue'
import { useI18n } from '@/i18n'
import type { Task } from '@/stores/tasksStore'

defineProps<{
  tasks: Task[]
  pendingCount: number
  panelStyle?: Record<string, string>
}>()

const emit = defineEmits<{
  toggleTask: [id: number]
}>()

const { t } = useI18n()
const panelElement = ref<HTMLElement | null>(null)

defineExpose({
  panelElement,
})
</script>

<template>
  <div
    ref="panelElement"
    class="fixed z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/45 bg-surface/45 p-4 shadow-main backdrop-blur-2xl"
    :style="panelStyle"
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
