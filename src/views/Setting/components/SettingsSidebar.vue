<script setup lang="ts">
export interface SettingCategory {
  key: string
  label: string
}

defineProps<{
  categories: SettingCategory[]
  activeCategory: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
</script>

<template>
  <aside class="w-48 shrink-0 border-r border-border-soft pr-4">
    <nav class="space-y-1">
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors"
        :class="
          activeCategory === category.key
            ? 'bg-control-bg text-text-main'
            : 'text-text-muted hover:bg-surface hover:text-text-main'
        "
        @click="emit('select', category.key)"
      >
        <span>{{ category.label }}</span>
        <span v-if="activeCategory === category.key" class="h-1.5 w-1.5 rounded-full bg-accent" />
      </button>
    </nav>
  </aside>
</template>
