import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Index from './Index/index'
import Setting from './Setting'
import Focus from './Focus'
import Sounds from './Sounds'

const createHistory = () => {
  if (import.meta.env.VITE_ROUTER_HISTORY === 'hash') {
    return createWebHashHistory(import.meta.env.BASE_URL)
  }

  return createWebHistory(import.meta.env.BASE_URL)
}

const router = createRouter({
  history: createHistory(),
  routes: [...Index, ...Setting, ...Focus, ...Sounds],
})

export default router
