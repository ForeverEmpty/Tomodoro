import { createRouter, createWebHistory } from 'vue-router'
import Index from './Index/index'
import Setting from './Setting'
import Focus from './Focus'
import Sounds from './Sounds'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...Index, ...Setting, ...Focus, ...Sounds],
})

export default router
