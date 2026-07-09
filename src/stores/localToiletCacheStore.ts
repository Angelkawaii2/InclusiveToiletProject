import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

const STORAGE_KEY = "itp.local.toilet-cache.v6";

function readCachedToilets(): ToiletPlace[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCachedToilets(toilets: ToiletPlace[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toilets));
}

export const useLocalToiletCacheStore = defineStore("local.toilet.cache", {
    state: () => ({
        toilets: readCachedToilets(),
    }),
    getters: {
        count: (state) => state.toilets.length,
    },
    actions: {
        addToilet(toilet: ToiletPlace) {
            this.toilets = [toilet, ...this.toilets];
            writeCachedToilets(this.toilets);
        },
        clear() {
            this.toilets = [];
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});
