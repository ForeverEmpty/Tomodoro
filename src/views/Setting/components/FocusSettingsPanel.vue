<script setup lang="ts">
import { useI18n } from '@/i18n'

export interface BackgroundOption {
  id: string
  label: string
  value: string
  selectValue?: string
  isVideo?: boolean
}

defineProps<{
  selectedBackground: string
  backgroundOptions: BackgroundOption[]
}>()

const emit = defineEmits<{
  selectBackground: [background: string]
  uploadBackground: [event: Event]
}>()

const { t } = useI18n()

const isVideoBackground = (background: BackgroundOption): boolean => {
  if (background.isVideo) return true
  const value = background.value
  return (
    value.toLowerCase().endsWith('.mp4') ||
    value.toLowerCase().endsWith('.webm') ||
    value.toLowerCase().endsWith('.ogg')
  )
}

const backgroundSelectionKey = (background: BackgroundOption): string => {
  return background.selectValue ?? background.value
}
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <section class="space-y-4">
      <div>
        <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
          {{ t('focus.background') }}
        </h2>
        <p class="m-0 mt-1 text-sm text-text-subtle">
          {{ t('focus.backgroundHelp') }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="background in backgroundOptions"
          :key="background.id"
          type="button"
          class="overflow-hidden rounded-lg border text-left transition-colors"
          :class="
            selectedBackground === backgroundSelectionKey(background)
              ? 'border-accent'
              : 'border-border-default hover:border-text-muted'
          "
          @click="emit('selectBackground', backgroundSelectionKey(background))"
        >
          <img
            v-if="!isVideoBackground(background)"
            :src="background.value"
            alt=""
            loading="lazy"
            decoding="async"
            class="block h-24 w-full object-cover"
          />
          <video
            v-else
            class="block h-24 w-full object-cover"
            autoplay
            muted
            loop
            playsinline
            :src="background.value"
          />
          <span class="block bg-surface px-3 py-2 text-xs font-medium text-text-main">
            {{ background.label }}
          </span>
        </button>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
        {{ t('focus.upload') }}
      </h2>
      <label
        class="inline-flex cursor-pointer items-center rounded-lg border border-border-default bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-control-bg"
      >
        {{ t('focus.uploadImage') }}
        <input
          type="file"
          accept="image/*,video/*"
          class="sr-only"
          @change="emit('uploadBackground', $event)"
        />
      </label>
    </section>
  </div>
</template>
