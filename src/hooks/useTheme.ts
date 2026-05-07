import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'

type EffectiveTheme = 'light' | 'dark'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

const systemPrefersDark = ref(false)

let initialized = false
let mediaQueryList: MediaQueryList | null = null

const resolveEffectiveTheme = (currentMode: string, prefersDark: boolean): EffectiveTheme => {
  if (currentMode === 'dark') {
    return 'dark'
  }
  if (currentMode === 'light') {
    return 'light'
  }
  return prefersDark ? 'dark' : 'light'
}

const applyModeToDocument = (currentMode: string) => {
  const root = document.documentElement
  if (currentMode === 'system') {
    root.removeAttribute('data-theme')
    return
  }
  root.setAttribute('data-theme', currentMode)
}

const initializeTheme = () => {
  if (initialized || typeof window === 'undefined') {
    return
  }

  mediaQueryList = window.matchMedia(DARK_MEDIA_QUERY)
  systemPrefersDark.value = mediaQueryList.matches

  mediaQueryList.addEventListener('change', (event) => {
    systemPrefersDark.value = event.matches
  })

  initialized = true
}

export const useTheme = () => {
  const settingsStore = useSettingsStore()
  const { setting } = storeToRefs(settingsStore)
  initializeTheme()

  const effectiveTheme = computed<EffectiveTheme>(() =>
    resolveEffectiveTheme(setting.value.theme, systemPrefersDark.value),
  )

  const toggleTheme = () => {
    if (setting.value.theme === 'system') {
      settingsStore.setTheme('light')
      return
    }
    if (setting.value.theme === 'light') {
      settingsStore.setTheme('dark')
      return
    }
    settingsStore.setTheme('system')
  }

  watch(
    () => setting.value.theme,
    (theme) => {
      applyModeToDocument(theme)
    },
    { immediate: true },
  )

  return {
    mode: computed(() => setting.value.theme),
    effectiveTheme,
    toggleTheme,
  }
}
