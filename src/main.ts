import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/css/index.css'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { installMusicImageCache } from './plugins/musicImageCache'
import { installMetingPlayer } from './plugins/metingPlayer'

installMusicImageCache()
installMetingPlayer()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
