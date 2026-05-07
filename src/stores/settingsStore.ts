import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import { defaultBackgrounds, defaultSetting } from '@/config/setting'
import type { AppSetting, ThemeMode, TimerSettingKey } from '@/config/setting'
import { useStorage } from '@/hooks/useStorage'

const STORAGE_KEY = 'tomodoro-settings'

const cloneDefaultSetting = (): AppSetting => structuredClone(defaultSetting)

const normalizeBackground = (background: string) => {
  const legacyBackground = defaultBackgrounds.find((option) =>
    background.endsWith(`/backgrounds/${option.id}.svg`),
  )

  return legacyBackground?.value ?? background
}

const isThemeMode = (value: unknown): value is ThemeMode => {
  return value === 'system' || value === 'light' || value === 'dark'
}

const hydrateSetting = (raw: string | null): AppSetting => {
  const setting = cloneDefaultSetting()
  if (!raw) {
    return setting
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSetting>
    if (parsed.timer) {
      const focusMinutes = Number(parsed.timer.focus)
      const breakMinutes = Number(parsed.timer.break)
      const restMinutes = Number(parsed.timer.rest)

      setting.timer.focus = Number.isFinite(focusMinutes) ? focusMinutes : setting.timer.focus
      setting.timer.break = Number.isFinite(breakMinutes) ? breakMinutes : setting.timer.break
      setting.timer.rest = Number.isFinite(restMinutes) ? restMinutes : setting.timer.rest
    }

    if (parsed.focus) {
      setting.focus.background =
        typeof parsed.focus.background === 'string'
          ? normalizeBackground(parsed.focus.background)
          : setting.focus.background
      setting.focus.uploadedBackground =
        typeof parsed.focus.uploadedBackground === 'string'
          ? parsed.focus.uploadedBackground
          : setting.focus.uploadedBackground
    }

    if (isThemeMode(parsed.theme)) {
      setting.theme = parsed.theme
    }
  } catch {
    return setting
  }

  return setting
}

export const useSettingsStore = defineStore('settings', () => {
  const { getItem, setItem } = useStorage()
  const setting = reactive<AppSetting>(hydrateSetting(getItem(STORAGE_KEY)))

  const backgroundOptions = computed(() => {
    const uploadedOption = setting.focus.uploadedBackground
      ? [
          {
            id: 'uploaded',
            label: 'Uploaded',
            value: setting.focus.uploadedBackground,
          },
        ]
      : []

    return [...defaultBackgrounds, ...uploadedOption]
  })

  const activeBackground = computed(() => setting.focus.background)

  const setTheme = (theme: ThemeMode) => {
    setting.theme = theme
  }

  const setTimerMinutes = (key: TimerSettingKey, minutes: number) => {
    setting.timer[key] = Math.max(0, minutes)
  }

  const setFocusBackground = (background: string) => {
    setting.focus.background = background
  }

  const setUploadedBackground = (background: string) => {
    setting.focus.uploadedBackground = background
    setting.focus.background = background
  }

  watch(
    setting,
    () => {
      setItem(STORAGE_KEY, JSON.stringify(setting))
    },
    { deep: true },
  )

  return {
    setting,
    backgroundOptions,
    activeBackground,
    setTheme,
    setTimerMinutes,
    setFocusBackground,
    setUploadedBackground,
  }
})
