import layout from '@/layouts/index.vue'
import focus from '@/views/Focus/index.vue'

export default [
  {
    path: '/focus',
    component: layout,
    children: [
      {
        path: '',
        component: focus,
      },
    ],
  },
]
