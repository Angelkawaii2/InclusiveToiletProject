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
        pendingReviewCount: (state) => state.toilets.filter((item) => !item.audit.reviewed).length,
    },
    actions: {
        addToilet(toilet: ToiletPlace) {
            this.toilets = [toilet, ...this.toilets];
            writeCachedToilets(this.toilets);
        },
        updateToilet(toilet: ToiletPlace) {
            const index = this.toilets.findIndex((item) => item.id === toilet.id);
            if (index < 0) return false;
            this.toilets.splice(index, 1, toilet);
            writeCachedToilets(this.toilets);
            return true;
        },
        removeToilet(id: string) {
            const nextToilets = this.toilets.filter((item) => item.id !== id);
            if (nextToilets.length === this.toilets.length) return false;
            this.toilets = nextToilets;
            writeCachedToilets(this.toilets);
            return true;
        },
        hasToilet(id: string) {
            return this.toilets.some((item) => item.id === id);
        },
        clear() {
            this.toilets = [];
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});
