export type ThemeMode = 'system' | 'light' | 'dark'
export type TimerSettingKey = 'focus' | 'break' | 'rest'
export type TimerSoundId = 'bell' | 'chime' | 'soft-ding'

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export interface SoundOption {
  id: TimerSoundId
  label: string
  value: string
}

export interface AppSetting {
  timer: Record<TimerSettingKey, number>
  focus: {
    background: string
    uploadedBackground: string
  }
  sound: {
    timerComplete: TimerSoundId
  }
  theme: ThemeMode
}

export const defaultBackgrounds = [
  {
    id: 'mist',
    label: 'Mist',
    value: publicAsset('backgrounds/mist.svg'),
  },
  {
    id: 'dawn',
    label: 'Dawn',
    value: publicAsset('backgrounds/dawn.svg'),
  },
  {
    id: 'forest',
    label: 'Forest',
    value: publicAsset('backgrounds/forest.svg'),
  },
]

export const defaultTimerSound: SoundOption = {
  id: 'bell',
  label: 'Bell',
  value: publicAsset('sounds/bell.wav'),
}

export const defaultTimerSounds: SoundOption[] = [
  defaultTimerSound,
  {
    id: 'chime',
    label: 'Chime',
    value: publicAsset('sounds/chime.wav'),
  },
  {
    id: 'soft-ding',
    label: 'Soft Ding',
    value: publicAsset('sounds/soft-ding.wav'),
  },
]

export const defaultSetting = {
  timer: {
    focus: 25,
    break: 5,
    rest: 15,
  },
  focus: {
    background: defaultBackgrounds[0]?.value ?? '',
    uploadedBackground: '',
  },
  sound: {
    timerComplete: defaultTimerSound.id,
  },
  theme: 'system',
} satisfies AppSetting
