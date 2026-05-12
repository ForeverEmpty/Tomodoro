import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/css/index.css'

import App from './App.vue'
import router from './router'
import { installMusicImageCache } from './plugins/musicImageCache'
import { installMetingPlayer } from './plugins/metingPlayer'

installMusicImageCache()
installMetingPlayer()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
