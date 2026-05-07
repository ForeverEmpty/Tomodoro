import layout from '@/layouts/index.vue'
import sounds from '@/views/Sounds/index.vue'

export default [
  {
    path: '/sounds',
    component: layout,
    children: [
      {
        path: '',
        component: sounds,
      },
    ],
  },
]
