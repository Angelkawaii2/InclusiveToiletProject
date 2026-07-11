import './assets/main.css'
import './style.css'
import 'ol/ol.css'

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
import {ElMessageBox} from "element-plus";


const app = createApp(App)
app.use(ElementPlus)


const pinia = createPinia()
app.use(pinia)

const settings = useSettingStore()
const PWA_UPDATED_KEY = "itp.pwa.updated";
let updateServiceWorker: (reloadPage?: boolean) => Promise<void> = async () => undefined;

async function applyPwaUpdate() {
    try {
        sessionStorage.setItem(PWA_UPDATED_KEY, "true");
        await updateServiceWorker(true);
    } catch {
        sessionStorage.removeItem(PWA_UPDATED_KEY);
        notifyError("应用更新失败，请稍后重试");
    }
}

updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
        notifySuccess("应用已可离线打开，静态数据会优先使用缓存");
    },
    onNeedRefresh() {
        if (settings.autoUpdatePwa) {
            void applyPwaUpdate();
            return;
        }
        void ElMessageBox.confirm("检测到新的离线应用版本，是否立即更新？", "发现应用更新", {
            confirmButtonText: "立即更新",
            cancelButtonText: "暂不更新",
            type: "info",
        }).then(() => applyPwaUpdate()).catch(() => undefined);
    },
    onRegisterError() {
        notifyError("PWA 离线缓存注册失败");
    },
})

const i18n = createI18n({
    legacy: false,
    locale: settings.language,
    fallbackLocale: 'zh-cn',
    messages: {"zh-cn": zh, "en-us": en}
})

app.use(i18n)

app.component("switch-lang", SwitchLang)
    .mount('#app')

if (sessionStorage.getItem(PWA_UPDATED_KEY) === "true") {
    sessionStorage.removeItem(PWA_UPDATED_KEY);
    notifySuccess("应用已更新到最新版本");
}
