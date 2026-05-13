<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import MiniTasksButton from './MiniTasksButton.vue'
import MiniTasksPanel from './MiniTasksPanel.vue'
import { useTasksStore } from '@/stores/tasksStore'

const tasksStore = useTasksStore()
const { tasks, pendingCount } = storeToRefs(tasksStore)
const isOpen = ref(false)
const rootElement = ref<HTMLElement | null>(null)
const panelComponent = ref<InstanceType<typeof MiniTasksPanel> | null>(null)
const viewport = ref({
  width: typeof window === 'undefined' ? 1280 : window.innerWidth,
  height: typeof window === 'undefined' ? 720 : window.innerHeight,
})
const panelSize = ref({
  width: 288,
  height: 260,
})

const props = withDefaults(
  defineProps<{
    placement?: 'top' | 'bottom'
  }>(),
  {
    placement: 'top',
  },
)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const updateViewport = () => {
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

const updatePanelSize = async () => {
  await nextTick()
  const rect = panelComponent.value?.panelElement?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) {
    return
  }

  panelSize.value = {
    width: rect.width,
    height: rect.height,
  }
}

const panelStyle = computed(() => {
  const hostRect = rootElement.value?.getBoundingClientRect()
  if (!hostRect) {
    return {
      left: '0px',
      top: '0px',
    }
  }

  const edgeGap = 12
  const panelGap = 12
  const width = panelSize.value.width
  const height = panelSize.value.height
  const left = clamp(
    hostRect.left + hostRect.width / 2 - width / 2,
    edgeGap,
    Math.max(edgeGap, viewport.value.width - edgeGap - width),
  )
  const preferredTop = props.placement === 'bottom'
    ? hostRect.bottom + panelGap
    : hostRect.top - panelGap - height
  const fallbackTop = props.placement === 'bottom'
    ? hostRect.top - panelGap - height
    : hostRect.bottom + panelGap
  const canUsePreferred = preferredTop >= edgeGap
    && preferredTop + height <= viewport.value.height - edgeGap
  const top = canUsePreferred
    ? preferredTop
    : clamp(
        fallbackTop,
        edgeGap,
        Math.max(edgeGap, viewport.value.height - edgeGap - height),
      )

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
})

watch(isOpen, (open) => {
  if (open) {
    void updatePanelSize()
  }
})

watch(viewport, () => {
  if (isOpen.value) {
    void updatePanelSize()
  }
})
</script>

<template>
  <div ref="rootElement" class="relative">
    <MiniTasksButton
      :is-open="isOpen"
      :pending-count="pendingCount"
      @toggle="isOpen = !isOpen"
    />
    <MiniTasksPanel
      v-if="isOpen"
      ref="panelComponent"
      :tasks="tasks"
      :pending-count="pendingCount"
      :panel-style="panelStyle"
      @toggle-task="tasksStore.toggleTask"
    />
  </div>
</template>
