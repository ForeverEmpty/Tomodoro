<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LanguageMode } from '@/config/setting'
import { languageOptions, useI18n } from '@/i18n'

const props = defineProps<{
  language: LanguageMode
}>()

const emit = defineEmits<{
  updateLanguage: [language: LanguageMode]
}>()

const { t } = useI18n()
const isOpen = ref(false)

const selectedOption = computed(() => {
  return languageOptions.find((option) => option.value === props.language) ?? languageOptions[0]
})

const selectLanguage = (language: LanguageMode) => {
  emit('updateLanguage', language)
  isOpen.value = false
}
</script>

<template>
  <section class="max-w-2xl space-y-3">
    <div>
      <h2 class="m-0 text-sm font-medium text-text-main">{{ t('language.title') }}</h2>
      <p class="m-0 mt-1 text-xs text-text-muted">{{ t('language.description') }}</p>
    </div>

    <div class="relative w-56">
      <button
        type="button"
        class="flex h-10 w-full items-center justify-between rounded-lg border border-border-default bg-surface px-3 text-left text-sm text-text-main shadow-sm outline-none transition hover:bg-control-bg/60 focus:ring-2 focus:ring-control-bg"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span>{{ selectedOption?.label }}</span>
        <svg
          class="h-4 w-4 text-text-muted transition"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div
        v-if="isOpen"
        class="absolute left-0 top-12 z-20 w-full overflow-hidden rounded-xl border border-border-default bg-surface p-1 shadow-lg shadow-slate-200/70"
        role="listbox"
      >
        <button
          v-for="option in languageOptions"
          :key="option.value"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-control-bg/70"
          :class="
            option.value === language
              ? 'bg-control-bg text-text-main'
              : 'text-text-muted hover:text-text-main'
          "
          role="option"
          :aria-selected="option.value === language"
          @click="selectLanguage(option.value)"
        >
          <span>{{ option.label }}</span>
          <span
            v-if="option.value === language"
            class="h-2 w-2 rounded-full bg-accent"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </section>
</template>
