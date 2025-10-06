import AppIcon from '@/components/AppIcon.vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import App from './App.vue'
import './style.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)
const pinia = createPinia()

app.component('AppIcon', AppIcon)
app.component('RecycleScroller', RecycleScroller)
app.use(pinia)
app.mount('#app')
