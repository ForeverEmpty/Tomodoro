import { computed, ref } from 'vue'

type ThemeMode = 'system' | 'light' | 'dark'
type EffectiveTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'tomodoro-theme-mode'
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

const mode = ref<ThemeMode>('system')
const systemPrefersDark = ref(false)

let initialized = false
let mediaQueryList: MediaQueryList | null = null

const resolveEffectiveTheme = (
  currentMode: ThemeMode,
  prefersDark: boolean,
): EffectiveTheme => {
  if (currentMode === 'dark') {
    return 'dark'
  }
  if (currentMode === 'light') {
    return 'light'
  }
  return prefersDark ? 'dark' : 'light'
}

const getStoredMode = (): ThemeMode => {
  const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
    return savedMode
  }
  return 'system'
}

const applyModeToDocument = (currentMode: ThemeMode) => {
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
  mode.value = getStoredMode()
  applyModeToDocument(mode.value)

  mediaQueryList.addEventListener('change', (event) => {
    systemPrefersDark.value = event.matches
  })

  initialized = true
}

const setMode = (nextMode: ThemeMode) => {
  mode.value = nextMode
  window.localStorage.setItem(THEME_STORAGE_KEY, nextMode)
  applyModeToDocument(nextMode)
}

export const useTheme = () => {
  initializeTheme()

  const effectiveTheme = computed<EffectiveTheme>(() =>
    resolveEffectiveTheme(mode.value, systemPrefersDark.value),
  )

  const toggleTheme = () => {
    if (mode.value === 'system') {
      setMode('light')
      return
    }
    if (mode.value === 'light') {
      setMode('dark')
      return
    }
    setMode('system')
  }

  return {
    mode,
    effectiveTheme,
    toggleTheme,
  }
}
