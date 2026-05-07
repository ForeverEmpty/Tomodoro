<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import MiniTasksButton from './MiniTasksButton.vue'
import MiniTasksPanel from './MiniTasksPanel.vue'
import { useTasksStore } from '@/stores/tasksStore'

const tasksStore = useTasksStore()
const { tasks, pendingCount } = storeToRefs(tasksStore)
const isOpen = ref(false)
</script>

<template>
  <div class="relative">
    <MiniTasksButton
      :is-open="isOpen"
      :pending-count="pendingCount"
      @toggle="isOpen = !isOpen"
    />
    <MiniTasksPanel
      v-if="isOpen"
      :tasks="tasks"
      :pending-count="pendingCount"
      @toggle-task="tasksStore.toggleTask"
    />
  </div>
</template>
