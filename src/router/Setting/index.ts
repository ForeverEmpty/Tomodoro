import layout from '@/layouts/index.vue'
import setting from '@/views/Setting/index.vue'

export default [
  {
    path: '/setting',
    component: layout,
    children: [
      {
        path: '',
        component: setting,
      },
    ],
  },
]
