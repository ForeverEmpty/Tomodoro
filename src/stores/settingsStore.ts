import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  defaultBackgrounds,
  defaultSetting,
  defaultTimerSound,
  defaultTimerSounds,
} from '@/config/setting'
import type {
  AppSetting,
  LanguageMode,
  ThemeMode,
  TimerSettingKey,
  TimerSoundId,
} from '@/config/setting'
import { useStorage } from '@/hooks/useStorage'
import {
  storeBackground,
  getBackground,
  blobToObjectURL,
  revokeObjectURL,
  deleteBackground,
} from '@/utils/indexedDB'

const STORAGE_KEY = 'tomodoro-settings'
const UPLOADED_BACKGROUND_ID = 'uploaded-background'

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

const isLanguageMode = (value: unknown): value is LanguageMode => {
  return value === 'zh-CN' || value === 'en-US'
}

const isTimerSoundId = (value: unknown): value is TimerSoundId => {
  return defaultTimerSounds.some((sound) => sound.id === value)
}

const clampSoundVolume = (value: unknown) => {
  const volume = Number(value)
  if (!Number.isFinite(volume)) {
    return defaultSetting.sound.volume
  }

  return Math.min(1, Math.max(0, volume))
}

const isUploadedBackgroundMarker = (value: unknown) => value === 'uploaded'

const isVideoBackgroundFile = (file: File) => {
  if (file.type.startsWith('video/')) {
    return true
  }

  return /\.(mov|mp4|ogg|webm)$/i.test(file.name)
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
        isUploadedBackgroundMarker(parsed.focus.uploadedBackground)
          ? parsed.focus.uploadedBackground
          : setting.focus.uploadedBackground
    }

    if (isThemeMode(parsed.theme)) {
      setting.theme = parsed.theme
    }

    if (isLanguageMode(parsed.language)) {
      setting.language = parsed.language
    }

    if (parsed.sound && isTimerSoundId(parsed.sound.timerComplete)) {
      setting.sound.timerComplete = parsed.sound.timerComplete
    }

    if (parsed.sound) {
      setting.sound.volume = clampSoundVolume(parsed.sound.volume)
    }
  } catch {
    return setting
  }

  return setting
}

export const useSettingsStore = defineStore('settings', () => {
  const { getItem, setItem } = useStorage()
  const setting = reactive<AppSetting>(hydrateSetting(getItem(STORAGE_KEY)))
  const loadedBackgroundUrl = ref<string | null>(null)
  const uploadedBackgroundIsVideo = ref(false)
  let loadUploadedBackgroundPromise: Promise<void> | null = null

  const isUploadedBackground = computed(() => {
    return setting.focus.background === 'uploaded'
  })

  const backgroundOptions = computed(() => {
    const uploadedUrl = loadedBackgroundUrl.value
    const uploadedOption = setting.focus.uploadedBackground === 'uploaded' && uploadedUrl
      ? [
          {
            id: 'uploaded',
            label: 'Uploaded',
            value: uploadedUrl,
            selectValue: 'uploaded',
            isVideo: uploadedBackgroundIsVideo.value,
          },
        ]
      : []

    return [...defaultBackgrounds, ...uploadedOption]
  })

  const soundOptions = computed(() => defaultTimerSounds)

  const activeBackground = computed(() => {
    if (isUploadedBackground.value && loadedBackgroundUrl.value) {
      return loadedBackgroundUrl.value
    }
    if (isUploadedBackground.value && !loadedBackgroundUrl.value) {
      return ''
    }
    return setting.focus.background
  })

  const activeTimerSound = computed(
    () =>
      defaultTimerSounds.find((sound) => sound.id === setting.sound.timerComplete) ??
      defaultTimerSound,
  )

  const setTheme = (theme: ThemeMode) => {
    setting.theme = theme
  }

  const setTimerMinutes = (key: TimerSettingKey, minutes: number) => {
    setting.timer[key] = Math.max(0, minutes)
  }

  const setFocusBackground = (background: string) => {
    setting.focus.background = background
  }

  const setUploadedBackground = async (file: File): Promise<void> => {
    await storeBackground(UPLOADED_BACKGROUND_ID, file)

    if (loadedBackgroundUrl.value) {
      revokeObjectURL(loadedBackgroundUrl.value)
    }
    loadedBackgroundUrl.value = blobToObjectURL(file)
    uploadedBackgroundIsVideo.value = isVideoBackgroundFile(file)
    setting.focus.uploadedBackground = 'uploaded'
    setting.focus.background = 'uploaded'
  }

  const loadUploadedBackground = async (): Promise<void> => {
    if (loadUploadedBackgroundPromise) {
      return loadUploadedBackgroundPromise
    }

    loadUploadedBackgroundPromise = (async () => {
      if (setting.focus.uploadedBackground !== 'uploaded') {
        return
      }
      try {
        const background = await getBackground(UPLOADED_BACKGROUND_ID)
        if (background) {
          if (loadedBackgroundUrl.value) {
            revokeObjectURL(loadedBackgroundUrl.value)
          }
          loadedBackgroundUrl.value = blobToObjectURL(background.data)
          uploadedBackgroundIsVideo.value = background.type.startsWith('video/')
        }
      } catch {
        loadedBackgroundUrl.value = null
        uploadedBackgroundIsVideo.value = false
      }
    })().finally(() => {
      loadUploadedBackgroundPromise = null
    })

    return loadUploadedBackgroundPromise
  }

  const clearUploadedBackground = async (): Promise<void> => {
    if (loadedBackgroundUrl.value) {
      revokeObjectURL(loadedBackgroundUrl.value)
    }
    await deleteBackground(UPLOADED_BACKGROUND_ID)
    setting.focus.uploadedBackground = ''
    setting.focus.background = defaultBackgrounds[0]?.value ?? ''
    loadedBackgroundUrl.value = null
    uploadedBackgroundIsVideo.value = false
  }

  const setTimerCompleteSound = (soundId: TimerSoundId) => {
    setting.sound.timerComplete = soundId
  }

  const setSoundVolume = (volume: number) => {
    setting.sound.volume = Math.min(1, Math.max(0, volume))
  }

  const setLanguage = (language: LanguageMode) => {
    setting.language = language
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
    soundOptions,
    activeBackground,
    activeTimerSound,
    isUploadedBackground,
    uploadedBackgroundIsVideo,
    setTheme,
    setTimerMinutes,
    setFocusBackground,
    setUploadedBackground,
    loadUploadedBackground,
    clearUploadedBackground,
    setTimerCompleteSound,
    setSoundVolume,
    setLanguage,
  }
})
