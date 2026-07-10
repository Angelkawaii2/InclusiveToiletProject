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
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toilets));
        return true;
    } catch {
        return false;
    }
}

export const useLocalToiletCacheStore = defineStore("local.toilet.cache", {
    state: () => ({
        toilets: readCachedToilets(),
        storageError: "",
    }),
    getters: {
        count: (state) => state.toilets.length,
        pendingReviewCount: (state) => state.toilets.filter((item) => !item.audit.reviewed).length,
    },
    actions: {
        addToilet(toilet: ToiletPlace) {
            const previousToilets = this.toilets;
            this.toilets = [toilet, ...this.toilets.filter((item) => item.id !== toilet.id)];
            if (!writeCachedToilets(this.toilets)) {
                this.toilets = previousToilets;
                this.storageError = "浏览器缓存空间不足或不可用";
                return false;
            }
            this.storageError = "";
            return true;
        },
        updateToilet(toilet: ToiletPlace) {
            const index = this.toilets.findIndex((item) => item.id === toilet.id);
            if (index < 0) return false;
            const previousToilet = this.toilets[index];
            this.toilets.splice(index, 1, toilet);
            if (!writeCachedToilets(this.toilets)) {
                this.toilets.splice(index, 1, previousToilet);
                this.storageError = "浏览器缓存空间不足或不可用";
                return false;
            }
            this.storageError = "";
            return true;
        },
        removeToilet(id: string) {
            const nextToilets = this.toilets.filter((item) => item.id !== id);
            if (nextToilets.length === this.toilets.length) return false;
            const previousToilets = this.toilets;
            this.toilets = nextToilets;
            if (!writeCachedToilets(this.toilets)) {
                this.toilets = previousToilets;
                this.storageError = "浏览器缓存空间不足或不可用";
                return false;
            }
            this.storageError = "";
            return true;
        },
        hasToilet(id: string) {
            return this.toilets.some((item) => item.id === id);
        },
        clear() {
            this.toilets = [];
            localStorage.removeItem(STORAGE_KEY);
            this.storageError = "";
        },
    },
});
