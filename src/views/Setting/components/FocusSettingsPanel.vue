<script setup lang="ts">
export interface BackgroundOption {
  id: string
  label: string
  value: string
}

defineProps<{
  activeBackground: string
  backgroundOptions: BackgroundOption[]
}>()

const emit = defineEmits<{
  selectBackground: [background: string]
  uploadBackground: [event: Event]
}>()
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <section class="space-y-4">
      <div>
        <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
          Background
        </h2>
        <p class="m-0 mt-1 text-sm text-text-subtle">
          Choose a default image or upload your own focus background.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="background in backgroundOptions"
          :key="background.id"
          type="button"
          class="overflow-hidden rounded-lg border text-left transition-colors"
          :class="
            activeBackground === background.value
              ? 'border-accent'
              : 'border-border-default hover:border-text-muted'
          "
          @click="emit('selectBackground', background.value)"
        >
          <span
            class="block h-24 bg-cover bg-center"
            :style="{ backgroundImage: `url(${background.value})` }"
          />
          <span class="block bg-surface px-3 py-2 text-xs font-medium text-text-main">
            {{ background.label }}
          </span>
        </button>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">Upload</h2>
      <label
        class="inline-flex cursor-pointer items-center rounded-lg border border-border-default bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-control-bg"
      >
        Upload image
        <input type="file" accept="image/*" class="sr-only" @change="emit('uploadBackground', $event)" />
      </label>
    </section>
  </div>
</template>
