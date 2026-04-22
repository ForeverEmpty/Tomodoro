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
      path: '/setting',
      label: 'Settings',
      onClick: () => {
        router.push('/setting')
      },
    },
  ]

  return items
}
