import {defineStore} from "pinia";

export const SETTINGS_KEYS = {
    IS_DEBUG: "isDebug",
    LANGUAGE: "language",
    THEME: "theme",
    AUTO_REVIEW_ON_EDIT: "autoReviewOnEdit",
    AUTO_UPDATE_PWA: "autoUpdatePwa",
    AUTO_REFRESH_GPS: "autoRefreshGps",
    MAP_STYLE: "mapStyle",
    SHOW_MOCK_DATA: "showMockData",
} as const;

export type ThemeMode = "light" | "dark";
export type MapStyle = "mono" | "light" | "dark";

function getMapStyle() {
    const stored = localStorage.getItem(SETTINGS_KEYS.MAP_STYLE);
    return stored === "light" || stored === "dark" || stored === "mono" ? stored : "mono";
}

export const useSettingStore = defineStore("global.settings", {
    state: () => ({
        isDebug: localStorage.getItem(SETTINGS_KEYS.IS_DEBUG) === "true",
        language: localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || "zh-cn",
        theme: (localStorage.getItem(SETTINGS_KEYS.THEME) || "light") as ThemeMode,
        autoReviewOnEdit: localStorage.getItem(SETTINGS_KEYS.AUTO_REVIEW_ON_EDIT) === "true",
        autoUpdatePwa: localStorage.getItem(SETTINGS_KEYS.AUTO_UPDATE_PWA) === "true",
        autoRefreshGps: localStorage.getItem(SETTINGS_KEYS.AUTO_REFRESH_GPS) === "true",
        mapStyle: getMapStyle() as MapStyle,
        showMockData: localStorage.getItem(SETTINGS_KEYS.SHOW_MOCK_DATA) === "true",
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
        updateAutoUpdatePwa(autoUpdatePwa: boolean) {
            this.autoUpdatePwa = autoUpdatePwa;
            localStorage.setItem(SETTINGS_KEYS.AUTO_UPDATE_PWA, String(autoUpdatePwa));
        },
        updateAutoRefreshGps(autoRefreshGps: boolean) {
            this.autoRefreshGps = autoRefreshGps;
            localStorage.setItem(SETTINGS_KEYS.AUTO_REFRESH_GPS, String(autoRefreshGps));
        },
        updateMapStyle(mapStyle: MapStyle) {
            this.mapStyle = mapStyle;
            localStorage.setItem(SETTINGS_KEYS.MAP_STYLE, mapStyle);
        },
        updateShowMockData(showMockData: boolean) {
            this.showMockData = showMockData;
            localStorage.setItem(SETTINGS_KEYS.SHOW_MOCK_DATA, String(showMockData));
        },
    },
});
