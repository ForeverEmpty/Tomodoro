<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from '@/i18n'
import { useTimerStore } from '@/stores/timerStore'

const timerStore = useTimerStore()
const { isRunning } = storeToRefs(timerStore)
const { t } = useI18n()
</script>

<template>
  <div class="flex w-full items-center gap-3 font-sans sm:w-auto">
    <button
      class="h-11 min-w-0 flex-1 rounded-full border border-border-default bg-text-main px-5 text-xs font-bold uppercase tracking-[0.08em] text-bg-main shadow-main hover:bg-hover-dark sm:min-w-30 sm:flex-none sm:px-6"
      type="button"
      @click="timerStore.toggle()"
    >
      {{ isRunning ? t('timer.pause') : t('timer.start') }}
    </button>
    <button
      class="h-11 min-w-0 flex-1 rounded-full border border-border-default bg-transparent px-5 text-xs font-bold uppercase tracking-[0.08em] text-text-main hover:bg-surface sm:min-w-30 sm:flex-none sm:px-6"
      type="button"
      @click="timerStore.reset()"
    >
      {{ t('timer.reset') }}
    </button>
  </div>
</template>
