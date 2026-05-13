<script setup lang="ts">
import { useI18n } from '@/i18n'

export interface ChangelogEntry {
  hash: string
  date: string
  message: string
}

export interface ChangelogVersion {
  version: string
  date: string
  isCurrent?: boolean
  changes: readonly ChangelogEntry[]
}

defineProps<{
  version: string
  timeline: readonly ChangelogVersion[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <section class="space-y-3">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
        {{ t('about.version') }}
      </h2>
      <p class="m-0 font-mono text-2xl font-light text-text-main">{{ version }}</p>
    </section>

    <section class="space-y-4">
      <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
        {{ t('about.changelog') }}
      </h2>

      <ol class="m-0 space-y-0 p-0">
        <li
          v-for="release in timeline"
          :key="release.version"
          class="relative grid grid-cols-[7rem_1fr] gap-4 pb-8 last:pb-0"
        >
          <div class="pt-1 text-right">
            <p class="m-0 text-xs font-medium text-text-muted">
              {{ release.date || t('about.unreleased') }}
            </p>
          </div>

          <div class="relative border-l border-border-soft pl-5">
            <span
              class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg-main"
              aria-hidden="true"
            />

            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="m-0 font-mono text-base font-semibold text-text-main">
                  {{ release.version }}
                </h3>
                <span
                  v-if="release.isCurrent"
                  class="rounded-full bg-control-bg px-2 py-0.5 text-[11px] font-medium text-text-main"
                >
                  {{ t('about.current') }}
                </span>
              </div>

              <ul class="m-0 space-y-2 p-0">
                <li
                  v-for="change in release.changes"
                  :key="`${release.version}-${change.hash}-${change.message}`"
                  class="rounded-lg border border-border-soft bg-surface px-3 py-2"
                >
                  <p class="m-0 text-sm leading-6 text-text-subtle">{{ change.message }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                    <span v-if="change.hash" class="font-mono">{{ change.hash }}</span>
                    <span v-if="change.hash && change.date" aria-hidden="true">/</span>
                    <time v-if="change.date" :datetime="change.date">{{ change.date }}</time>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>
