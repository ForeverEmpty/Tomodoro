<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'

const emit = defineEmits<{
  add: [title: string]
}>()

const title = ref('')
const { t } = useI18n()

const onSubmit = () => {
  const nextTitle = title.value.trim()
  if (!nextTitle) {
    return
  }
  emit('add', nextTitle)
  title.value = ''
}
</script>

<template>
  <form class="mb-4 flex items-center gap-2" @submit.prevent="onSubmit">
    <input
      v-model="title"
      type="text"
      :placeholder="t('tasks.placeholder')"
      class="h-10 flex-1 rounded-xl border border-border-default bg-surface px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-control-bg"
    />
    <button
      type="submit"
      class="h-10 rounded-xl border border-border-default bg-text-main px-4 text-xs font-semibold uppercase tracking-[0.08em] text-bg-main hover:bg-hover-dark"
    >
      {{ t('common.add') }}
    </button>
  </form>
</template>
