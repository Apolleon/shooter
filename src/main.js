import { createApp } from 'vue'
import { router } from '../router'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/main.css'

const store = createPinia()

createApp(App).use(router).use(store).mount('#app')
