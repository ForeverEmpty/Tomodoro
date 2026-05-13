import { useRouter } from 'vue-router'

export const header = () => {
  const router = useRouter()

  const items = [
    {
      path: '/',
      labelKey: 'nav.timer',
      onClick: () => {
        router.push('/')
      },
    },
    {
      path: '/focus',
      labelKey: 'nav.focus',
      onClick: () => {
        router.push('/focus')
      },
    },
    {
      path: '/sounds',
      labelKey: 'nav.sounds',
      onClick: () => {
        router.push('/sounds')
      },
    },
    {
      path: '/setting',
      labelKey: 'nav.settings',
      onClick: () => {
        router.push('/setting')
      },
    },
  ]

  return items
}
