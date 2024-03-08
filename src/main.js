import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import {createI18n} from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import zh from '@/i18n/zh-cn.js'
import en from '@/i18n/en-us.js'
import jp from '@/i18n/ja-jp.js'

import SwitchLang from "@/components/SwitchLang.vue";
import {registerSW} from "virtual:pwa-register";
import {createPinia} from "pinia";

registerSW({immediate: true})

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem("ui.lang") || 'zh-cn',
    fallbackLocale: 'zh-cn',
    messages: {"zh-cn": zh, "en-us": en, "ja-jp": jp}
})

const pinia = createPinia()

createApp(App)
    .component("switch-lang", SwitchLang)
    .use(i18n)
    .use(ElementPlus)
    .use(pinia)
    .mount('#app')
