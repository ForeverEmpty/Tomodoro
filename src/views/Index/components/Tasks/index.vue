<script setup lang="ts">
import { storeToRefs } from 'pinia'
import TasksAdder from './TasksAdder.vue'
import TasksItem from './TasksItem.vue'
import { useTasksStore } from '@/stores/tasksStore'

const tasksStore = useTasksStore()
const { tasks, completedCount, totalCount } = storeToRefs(tasksStore)
</script>

<template>
  <section class="w-full max-w-xl font-sans pb-6">
    <div class="flex items-center justify-between mb-6 pb-2 border-b border-border-soft">
      <h2 class="text-xs font-bold uppercase tracking-widest text-text-main">Tasks</h2>
      <span class="text-[10px] font-mono text-text-muted"
        >{{ completedCount }}/{{ totalCount }}</span
      >
    </div>

    <TasksAdder @add="tasksStore.addTask" />

    <ul v-if="tasks.length > 0" class="space-y-2">
      <TasksItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="tasksStore.toggleTask"
        @delete="tasksStore.deleteTask"
      />
    </ul>

    <p
      v-else
      class="m-0 rounded-xl border border-dashed border-border-default px-3 py-4 text-sm text-text-muted"
    >
      No tasks yet. Add one to get started.
    </p>

    <div v-if="completedCount > 0" class="mt-4 flex justify-end">
      <button
        type="button"
        class="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted hover:text-text-main"
        @click="tasksStore.clearCompleted"
      >
        Clear Completed
      </button>
    </div>
  </section>
</template>

<style scoped></style>
