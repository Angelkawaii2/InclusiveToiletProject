import {defineStore} from "pinia";


export const useSettingStore = defineStore('global.settings', {
    state: () => ({
        isDebug: localStorage.getItem(SETTINGS_KEYS.IS_DEBUG) === 'true',
        language: localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || 'zh-cn',
        test: false,
    }),
    actions: {
        updateSettings(k, v) {
            this[k] = v
            localStorage.setItem(k, v);
        },
        updateLanguage(newLocate: string) {
            this.language = newLocate;
            localStorage.setItem(SETTINGS_KEYS.LANGUAGE, newLocate);
        }
    }
})
export const SETTINGS_KEYS = {
    IS_DEBUG: 'isDebug',
    LANGUAGE: 'language',
}