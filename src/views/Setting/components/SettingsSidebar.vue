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
  <aside class="w-full shrink-0 border-b border-border-soft pb-3 md:w-48 md:border-b-0 md:border-r md:pb-0 md:pr-4">
    <nav class="mobile-x-scroll flex gap-2 overflow-x-auto md:block md:space-y-1 md:overflow-visible">
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full"
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
