import './assets/main.css'
import './style.css'

import {createApp} from 'vue'
import App from './App.vue'
import {createI18n} from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import zh from '@/i18n/zh-cn.js'
import en from '@/i18n/en-us.js'
import SwitchLang from "@/components/SwitchLang.vue";
import {registerSW} from "virtual:pwa-register";
import {createPinia} from "pinia";
import {useSettingStore} from "@/stores/settingsStore";
import {notifyError, notifySuccess} from "@/Utils/Notify";


const app = createApp(App)
app.use(ElementPlus)


const pinia = createPinia()
app.use(pinia)


registerSW({
    immediate: true,
    onOfflineReady() {
        notifySuccess("应用已可离线打开，静态数据会优先使用缓存");
    },
    onNeedRefresh() {
        notifySuccess("发现新版本，刷新页面后生效");
    },
    onRegisterError() {
        notifyError("PWA 离线缓存注册失败");
    },
})

const settings = useSettingStore()

const i18n = createI18n({
    legacy: false,
    locale: settings.language,
    fallbackLocale: 'zh-cn',
    messages: {"zh-cn": zh, "en-us": en}
})

app.use(i18n)

app.component("switch-lang", SwitchLang)
    .mount('#app')
