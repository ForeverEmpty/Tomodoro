import { useRouter } from 'vue-router'

export const header = () => {
  const router = useRouter()

  const items = [
    {
      path: '/',
      label: 'Timer',
      onClick: () => {
        router.push('/')
      },
    },
    {
      path: '/focus',
      label: 'Focus',
      onClick: () => {
        router.push('/focus')
      },
    },
    {
      path: '/sounds',
      label: 'Sounds',
      onClick: () => {
        router.push('/sounds')
      },
    },
    {
      path: '/setting',
      label: 'Settings',
      onClick: () => {
        router.push('/setting')
      },
    },
  ]

  return items
}
