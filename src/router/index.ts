import { createRouter, createWebHistory } from 'vue-router'
import Index from './Index/index'
import Setting from './Setting'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...Index, ...Setting],
})

export default router
