export type ThemeMode = 'system' | 'light' | 'dark'
export type TimerSettingKey = 'focus' | 'break' | 'rest'

export interface AppSetting {
  timer: Record<TimerSettingKey, number>
  focus: {
    background: string
    uploadedBackground: string
  }
  theme: ThemeMode
}

export const defaultBackgrounds = [
  {
    id: 'mist',
    label: 'Mist',
    value: '/backgrounds/mist.svg',
  },
  {
    id: 'dawn',
    label: 'Dawn',
    value: '/backgrounds/dawn.svg',
  },
  {
    id: 'forest',
    label: 'Forest',
    value: '/backgrounds/forest.svg',
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
  theme: 'system',
} satisfies AppSetting
