import {defineStore} from "pinia";

export const SETTINGS_KEYS = {
    IS_DEBUG: "isDebug",
    LANGUAGE: "language",
    THEME: "theme",
    AUTO_REVIEW_ON_EDIT: "autoReviewOnEdit",
} as const;

export type ThemeMode = "light" | "dark";

export const useSettingStore = defineStore("global.settings", {
    state: () => ({
        isDebug: localStorage.getItem(SETTINGS_KEYS.IS_DEBUG) === "true",
        language: localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || "zh-cn",
        theme: (localStorage.getItem(SETTINGS_KEYS.THEME) || "light") as ThemeMode,
        autoReviewOnEdit: localStorage.getItem(SETTINGS_KEYS.AUTO_REVIEW_ON_EDIT) === "true",
    }),
    actions: {
        updateDebugMode(isDebug: boolean) {
            this.isDebug = isDebug;
            localStorage.setItem(SETTINGS_KEYS.IS_DEBUG, String(isDebug));
        },
        updateLanguage(language: string) {
            this.language = language;
            localStorage.setItem(SETTINGS_KEYS.LANGUAGE, language);
        },
        updateTheme(theme: ThemeMode) {
            this.theme = theme;
            localStorage.setItem(SETTINGS_KEYS.THEME, theme);
        },
        toggleTheme() {
            this.updateTheme(this.theme === "dark" ? "light" : "dark");
        },
        updateAutoReviewOnEdit(autoReviewOnEdit: boolean) {
            this.autoReviewOnEdit = autoReviewOnEdit;
            localStorage.setItem(SETTINGS_KEYS.AUTO_REVIEW_ON_EDIT, String(autoReviewOnEdit));
        },
    },
});
