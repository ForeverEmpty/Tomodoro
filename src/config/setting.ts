export type ThemeMode = 'system' | 'light' | 'dark'
export type TimerSettingKey = 'focus' | 'break' | 'rest'

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`

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
