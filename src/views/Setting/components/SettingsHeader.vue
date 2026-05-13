<script setup lang="ts">
import { useI18n } from '@/i18n'

defineProps<{
  title: string
}>()

const { t } = useI18n()
</script>

<template>
  <header class="mb-8">
    <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
      {{ t('settings.header') }}
    </p>
    <h1 class="m-0 mt-2 text-3xl font-semibold text-text-main">{{ title }}</h1>
  </header>
</template>
