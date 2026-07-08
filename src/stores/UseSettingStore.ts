import {defineStore} from "pinia";


export const useSettingStore = defineStore('global.settings', {
    state: () => ({
        isDebug: localStorage.getItem(SETTINGS_KEYS.IS_DEBUG) === 'true',
        language: localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || 'zh-cn',
        theme: localStorage.getItem(SETTINGS_KEYS.THEME) || 'light',
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
        },
        updateTheme(theme: 'light' | 'dark') {
            this.theme = theme;
            localStorage.setItem(SETTINGS_KEYS.THEME, theme);
        },
        toggleTheme() {
            this.updateTheme(this.theme === 'dark' ? 'light' : 'dark');
        }
    }
})
export const SETTINGS_KEYS = {
    IS_DEBUG: 'isDebug',
    LANGUAGE: 'language',
    THEME: 'theme',
}
