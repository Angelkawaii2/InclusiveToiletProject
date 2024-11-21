import './assets/main.css'
import './style.css'

import {createApp} from 'vue'
import App from './App.vue'
import {createI18n} from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {createRouter, createWebHashHistory} from 'vue-router'

import zh from '@/i18n/zh-cn.js'
import en from '@/i18n/en-us.js'
import SwitchLang from "@/components/SwitchLang.vue";
import {registerSW} from "virtual:pwa-register";
import {createPinia} from "pinia";
import AddPage from "@/Views/AddPage.vue";
import TestPage from "@/components/TabComponent.vue";
import {useSettingStore} from "@/stores/UseSettingStore.ts";


const app = createApp(App)
app.use(ElementPlus)


const pinia = createPinia()
app.use(pinia)


registerSW({immediate: true})

const settings = useSettingStore()

const i18n = createI18n({
    legacy: false,
    locale: settings.language,
    fallbackLocale: 'zh-cn',
    messages: {"zh-cn": zh, "en-us": en}
})

app.use(i18n)

const routes = [
    {path: '/', component: AddPage},
    {path: '/test', component: TestPage},
]

const router = createRouter(
    {
        history: createWebHashHistory(),
        routes
    }
)


app.component("switch-lang", SwitchLang)
    .use(router)
    .mount('#app')

