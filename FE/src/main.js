import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import './assets/styles/styles.css'

import PrimeVue from 'primevue/config';

const pinia = createPinia()
createApp(App).use(router).use(PrimeVue).use(pinia).mount('#app')
