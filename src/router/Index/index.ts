import layout from '@/layouts/index.vue'
import index from '@/views/Index/index.vue'

export default [
  {
    path: '/',
    component: layout,
    children: [
      {
        path: '',
        component: index,
      },
    ],
  },
]
