<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AboutSettingsPanel from './components/AboutSettingsPanel.vue'
import FocusSettingsPanel from './components/FocusSettingsPanel.vue'
import LanguageSettingsPanel from './components/LanguageSettingsPanel.vue'
import SettingsHeader from './components/SettingsHeader.vue'
import SettingsSidebar from './components/SettingsSidebar.vue'
import SoundSettingsPanel from './components/SoundSettingsPanel.vue'
import ThemeSettingsPanel from './components/ThemeSettingsPanel.vue'
import TimerSettingsPanel from './components/TimerSettingsPanel.vue'
import { releaseInfo } from '@/config/release'
import { defaultSetting } from '@/config/setting'
import type { ThemeMode, TimerSettingKey } from '@/config/setting'
import { useI18n } from '@/i18n'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTimerStore, type TimerMode } from '@/stores/timerStore'

const settingsStore = useSettingsStore()
const timerStore = useTimerStore()
const { setting, backgroundOptions, soundOptions } = storeToRefs(settingsStore)
const { t } = useI18n()
const backgroundUploadError = ref('')
const MAX_MOBILE_BACKGROUND_VIDEO_WIDTH = 1920
const MAX_MOBILE_BACKGROUND_VIDEO_HEIGHT = 1080

onMounted(() => {
  settingsStore.loadUploadedBackground()
})

const aboutKey = 'about'
const activeCategory = ref(Object.keys(defaultSetting)[0] ?? aboutKey)

const categoryLabelKeys: Record<string, Parameters<typeof t>[0]> = {
  timer: 'settings.timer',
  focus: 'settings.focus',
  sound: 'settings.sound',
  language: 'settings.language',
  theme: 'settings.theme',
  about: 'settings.about',
}

const themeOptions = computed<{ label: string; value: ThemeMode }[]>(() => [
  { label: t('theme.system'), value: 'system' },
  { label: t('theme.light'), value: 'light' },
  { label: t('theme.dark'), value: 'dark' },
])

const timerModeMap: Record<TimerSettingKey, TimerMode> = {
  focus: 'Focus',
  break: 'Break',
  rest: 'Rest',
}

const categories = computed(() => [
  ...Object.keys(defaultSetting).map((key) => {
    const labelKey = categoryLabelKeys[key]

    return {
      key,
      label: labelKey ? t(labelKey) : toTitleCase(key),
    }
  }),
  {
    key: aboutKey,
    label: t(categoryLabelKeys[aboutKey] ?? 'settings.about'),
  },
])

const activeLabel = computed(
  () => categories.value.find((category) => category.key === activeCategory.value)?.label ?? '',
)

const timerEntries = computed(
  () => Object.entries(setting.value.timer) as [TimerSettingKey, number][],
)

const translatedBackgroundOptions = computed(() =>
  backgroundOptions.value.map((option) => ({
    ...option,
    label: t(`background.${option.id}` as Parameters<typeof t>[0]),
  })),
)

const soundLabelKeys: Record<string, Parameters<typeof t>[0]> = {
  bell: 'sound.bell',
  chime: 'sound.chime',
  'soft-ding': 'sound.softDing',
}

const translatedSoundOptions = computed(() =>
  soundOptions.value.map((option) => ({
    ...option,
    label: t(soundLabelKeys[option.id] ?? 'sound.bell'),
  })),
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

const isMobileViewport = () => {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}

const isVideoFile = (file: File) => {
  return file.type.startsWith('video/') || /\.(mov|mp4|ogg|webm)$/i.test(file.name)
}

const loadVideoMetadata = (file: File) => {
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    }
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Video metadata timeout'))
    }, 7000)

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.onloadedmetadata = () => {
      window.clearTimeout(timeout)
      const width = video.videoWidth
      const height = video.videoHeight
      cleanup()
      resolve({ height, width })
    }
    video.onerror = () => {
      window.clearTimeout(timeout)
      cleanup()
      reject(new Error('Unsupported video source'))
    }
    video.src = url
  })
}

const validateBackgroundUpload = async (file: File) => {
  if (!isVideoFile(file)) {
    return true
  }

  try {
    const { height, width } = await loadVideoMetadata(file)
    if (
      isMobileViewport() &&
      (width > MAX_MOBILE_BACKGROUND_VIDEO_WIDTH || height > MAX_MOBILE_BACKGROUND_VIDEO_HEIGHT)
    ) {
      backgroundUploadError.value = t('focus.uploadVideoTooLarge', {
        height,
        width,
      })
      return false
    }
  } catch {
    backgroundUploadError.value = t('focus.uploadVideoUnsupported')
    return false
  }

  return true
}

const onBackgroundUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  try {
    backgroundUploadError.value = ''
    const canUpload = await validateBackgroundUpload(file)
    if (!canUpload) {
      return
    }

    await settingsStore.setUploadedBackground(file)
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <section class="flex w-full max-w-5xl flex-col gap-6 px-4 pb-32 pt-4 md:flex-row md:gap-8 md:px-6 md:pb-12 md:pt-8">
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

      <LanguageSettingsPanel
        v-else-if="activeCategory === 'language'"
        :language="setting.language"
        @update-language="settingsStore.setLanguage"
      />

      <FocusSettingsPanel
        v-else-if="activeCategory === 'focus'"
        :selected-background="setting.focus.background"
        :background-options="translatedBackgroundOptions"
        :upload-error="backgroundUploadError"
        @select-background="settingsStore.setFocusBackground"
        @upload-background="onBackgroundUpload"
      />

      <SoundSettingsPanel
        v-else-if="activeCategory === 'sound'"
        :selected-sound="setting.sound.timerComplete"
        :volume="setting.sound.volume"
        :options="translatedSoundOptions"
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
