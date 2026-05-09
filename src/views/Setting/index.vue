<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AboutSettingsPanel from './components/AboutSettingsPanel.vue'
import FocusSettingsPanel from './components/FocusSettingsPanel.vue'
import SettingsHeader from './components/SettingsHeader.vue'
import SettingsSidebar from './components/SettingsSidebar.vue'
import SoundSettingsPanel from './components/SoundSettingsPanel.vue'
import ThemeSettingsPanel from './components/ThemeSettingsPanel.vue'
import TimerSettingsPanel from './components/TimerSettingsPanel.vue'
import { releaseInfo } from '@/config/release'
import { defaultSetting } from '@/config/setting'
import type { ThemeMode, TimerSettingKey } from '@/config/setting'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTimerStore, type TimerMode } from '@/stores/timerStore'

const settingsStore = useSettingsStore()
const timerStore = useTimerStore()
const { setting, backgroundOptions, soundOptions } = storeToRefs(settingsStore)

onMounted(() => {
  settingsStore.loadUploadedBackground()
})

const aboutKey = 'about'
const activeCategory = ref(Object.keys(defaultSetting)[0] ?? aboutKey)

const categoryLabels: Record<string, string> = {
  timer: 'Timer',
  focus: 'Focus',
  sound: 'Sound',
  theme: 'Theme',
  about: 'About',
}

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const timerModeMap: Record<TimerSettingKey, TimerMode> = {
  focus: 'Focus',
  break: 'Break',
  rest: 'Rest',
}

const categories = computed(() => [
  ...Object.keys(defaultSetting).map((key) => ({
    key,
    label: categoryLabels[key] ?? toTitleCase(key),
  })),
  {
    key: aboutKey,
    label: categoryLabels[aboutKey] ?? 'About',
  },
])

const activeLabel = computed(
  () => categories.value.find((category) => category.key === activeCategory.value)?.label ?? '',
)

const timerEntries = computed(
  () => Object.entries(setting.value.timer) as [TimerSettingKey, number][],
)

const toTitleCase = (value: string) => {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (firstLetter) => firstLetter.toUpperCase())
}

const updateTimerSetting = (key: TimerSettingKey, rawValue: string) => {
  const minutes = Number(rawValue)
  if (!Number.isFinite(minutes)) {
    return
  }

  settingsStore.setTimerMinutes(key, minutes)
  timerStore.setModeDuration(timerModeMap[key], minutes)
}

const onBackgroundUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }
  await settingsStore.setUploadedBackground(file)
}
</script>

<template>
  <section class="flex w-full max-w-5xl gap-8 px-6 pb-12 pt-8">
    <SettingsSidebar
      :categories="categories"
      :active-category="activeCategory"
      @select="activeCategory = $event"
    />

    <main class="min-w-0 flex-1">
      <SettingsHeader :title="activeLabel" />

      <TimerSettingsPanel
        v-if="activeCategory === 'timer'"
        :entries="timerEntries"
        @update-timer="updateTimerSetting"
      />

      <ThemeSettingsPanel
        v-else-if="activeCategory === 'theme'"
        :theme="setting.theme"
        :options="themeOptions"
        @update-theme="settingsStore.setTheme"
      />

      <FocusSettingsPanel
        v-else-if="activeCategory === 'focus'"
        :selected-background="setting.focus.background"
        :background-options="backgroundOptions"
        @select-background="settingsStore.setFocusBackground"
        @upload-background="onBackgroundUpload"
      />

      <SoundSettingsPanel
        v-else-if="activeCategory === 'sound'"
        :selected-sound="setting.sound.timerComplete"
        :volume="setting.sound.volume"
        :options="soundOptions"
        @update-sound="settingsStore.setTimerCompleteSound"
        @update-volume="settingsStore.setSoundVolume"
      />

      <AboutSettingsPanel
        v-else-if="activeCategory === aboutKey"
        :version="releaseInfo.version"
        :timeline="releaseInfo.timeline"
      />
    </main>
  </section>
</template>
