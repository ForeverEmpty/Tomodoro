import { useStorage } from '@/hooks/useStorage'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: number
}

export const useTasksStore = defineStore('tasks', () => {
  const { setItem, getItem } = useStorage()
  const storageKey = 'tomodoro-tasks'
  const tasks = ref<Task[]>([])

  const hydrateTasks = () => {
    const raw = getItem(storageKey)
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as Task[]
      if (!Array.isArray(parsed)) {
        return
      }

      tasks.value = parsed.filter(
        (task) =>
          typeof task.id === 'number' &&
          typeof task.title === 'string' &&
          typeof task.completed === 'boolean' &&
          typeof task.createdAt === 'number',
      )
    } catch {
      tasks.value = []
    }
  }

  hydrateTasks()

  watch(
    tasks,
    () => {
      setItem(storageKey, JSON.stringify(tasks.value))
    },
    { deep: true },
  )

  const addTask = (title: string) => {
    const nextTitle = title.trim()
    if (!nextTitle) {
      return false
    }

    tasks.value.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: nextTitle,
      completed: false,
      createdAt: Date.now(),
    })

    return true
  }

  const deleteTask = (id: number) => {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  const toggleTask = (id: number) => {
    const task = tasks.value.find((task) => task.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  const clearCompleted = () => {
    tasks.value = tasks.value.filter((task) => !task.completed)
  }

  const totalCount = computed(() => tasks.value.length)
  const completedCount = computed(() => tasks.value.filter((task) => task.completed).length)
  const pendingCount = computed(() => totalCount.value - completedCount.value)

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    totalCount,
    completedCount,
    pendingCount,
  }
})
