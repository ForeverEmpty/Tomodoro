<script setup lang="ts">
import type { Task } from '@/stores/tasksStore'

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()
</script>

<template>
  <li class="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-3 py-2">
    <button
      type="button"
      class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-default text-[10px] font-bold"
      :class="task.completed ? 'bg-accent text-white border-accent' : 'text-text-muted hover:text-text-main'"
      @click="emit('toggle', task.id)"
    >
      <span v-if="task.completed">✓</span>
    </button>

    <p
      class="m-0 flex-1 text-sm"
      :class="task.completed ? 'text-text-subtle line-through' : 'text-text-main'"
    >
      {{ task.title }}
    </p>

    <button
      type="button"
      class="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-control-bg hover:text-text-main"
      aria-label="Delete task"
      @click="emit('delete', task.id)"
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M7 6l1 14h8l1-14" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  </li>
</template>
