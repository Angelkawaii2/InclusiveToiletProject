import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

const STORAGE_KEY = "itp.local.toilet-cache.v6";
const CACHE_FORMAT = "itp.local.toilet-cache.v2";

export interface LocalToiletSyncMetadata {
    baseUpdatedAt: number | null;
    locallyEdited: boolean;
    conflict?: {
        sourceUpdatedAt: number;
        detectedAt: number;
        sourceRecord: ToiletPlace;
    };
}

interface LocalToiletCacheEntry {
    toilet: ToiletPlace;
    sync: LocalToiletSyncMetadata;
}

interface LocalToiletCachePayload {
    format: typeof CACHE_FORMAT;
    entries: LocalToiletCacheEntry[];
}

function isToiletPlaceArray(value: unknown): value is ToiletPlace[] {
    return Array.isArray(value);
}

function readCachedEntries(): LocalToiletCacheEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (isToiletPlaceArray(parsed)) {
            // v1 缓存没有同步元数据；保守地将其视为人工改动，避免静默覆盖。
            return parsed.map((toilet) => ({
                toilet,
                sync: {baseUpdatedAt: null, locallyEdited: true},
            }));
        }
        if (typeof parsed === "object" && parsed !== null && "format" in parsed && "entries" in parsed) {
            const payload = parsed as LocalToiletCachePayload;
            return payload.format === CACHE_FORMAT && Array.isArray(payload.entries) ? payload.entries : [];
        }
        return [];
    } catch {
        return [];
    }
}

function writeCachedEntries(entries: LocalToiletCacheEntry[]) {
    try {
        const payload: LocalToiletCachePayload = {format: CACHE_FORMAT, entries};
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
    } catch {
        return false;
    }
}

function sourceUpdatedAt(toilet: ToiletPlace) {
    return Number.isFinite(toilet.audit.updatedAt) ? toilet.audit.updatedAt : 0;
}

export const useLocalToiletCacheStore = defineStore("local.toilet.cache", {
    state: () => ({
        entries: readCachedEntries(),
        storageError: "",
    }),
    getters: {
        toilets: (state) => state.entries.map((entry) => entry.toilet),
        count: (state) => state.entries.length,
        pendingReviewCount: (state) => state.entries.filter((entry) => !entry.toilet.audit.reviewed).length,
        conflictCount: (state) => state.entries.filter((entry) => Boolean(entry.sync.conflict)).length,
    },
    actions: {
        commitEntries(entries: LocalToiletCacheEntry[]) {
            const previousEntries = this.entries;
            this.entries = entries;
            if (!writeCachedEntries(this.entries)) {
                this.entries = previousEntries;
                this.storageError = "浏览器缓存空间不足或不可用";
                return false;
            }
            this.storageError = "";
            return true;
        },
        addToilet(toilet: ToiletPlace, metadata: Partial<LocalToiletSyncMetadata> = {}) {
            const existing = this.entries.find((entry) => entry.toilet.id === toilet.id);
            const nextEntry: LocalToiletCacheEntry = {
                toilet,
                sync: {
                    baseUpdatedAt: metadata.baseUpdatedAt ?? existing?.sync.baseUpdatedAt ?? null,
                    locallyEdited: metadata.locallyEdited ?? true,
                },
            };
            return this.commitEntries([nextEntry, ...this.entries.filter((entry) => entry.toilet.id !== toilet.id)]);
        },
        saveEditedToilet(toilet: ToiletPlace, baseUpdatedAt: number | null) {
            return this.addToilet(toilet, {baseUpdatedAt, locallyEdited: true});
        },
        updateToilet(toilet: ToiletPlace) {
            const existing = this.entries.find((entry) => entry.toilet.id === toilet.id);
            if (!existing) return false;
            return this.addToilet(toilet, existing.sync);
        },
        removeToilet(id: string) {
            const nextEntries = this.entries.filter((entry) => entry.toilet.id !== id);
            if (nextEntries.length === this.entries.length) return false;
            return this.commitEntries(nextEntries);
        },
        hasToilet(id: string) {
            return this.entries.some((entry) => entry.toilet.id === id);
        },
        getMetadata(id: string) {
            return this.entries.find((entry) => entry.toilet.id === id)?.sync;
        },
        hasConflict(id: string) {
            return Boolean(this.getMetadata(id)?.conflict);
        },
        keepLocalConflict(id: string) {
            const entry = this.entries.find((item) => item.toilet.id === id);
            const conflict = entry?.sync.conflict;
            if (!entry || !conflict) return false;
            const nextEntries = this.entries.map((item) => item.toilet.id === id ? {
                ...item,
                sync: {
                    baseUpdatedAt: conflict.sourceUpdatedAt,
                    locallyEdited: true,
                },
            } : item);
            return this.commitEntries(nextEntries);
        },
        acceptSourceConflict(id: string) {
            const entry = this.entries.find((item) => item.toilet.id === id);
            const sourceRecord = entry?.sync.conflict?.sourceRecord;
            if (!sourceRecord) return null;
            if (!this.removeToilet(id)) return null;
            return sourceRecord;
        },
        mergeWithDataset(datasetToilets: ToiletPlace[]) {
            const sourceById = new Map(datasetToilets.map((toilet) => [toilet.id, toilet]));
            const resolvedToilets: ToiletPlace[] = [];
            let nextEntries = this.entries;
            let entriesChanged = false;
            let newConflictCount = 0;

            for (const sourceToilet of datasetToilets) {
                const entry = this.entries.find((item) => item.toilet.id === sourceToilet.id);
                if (!entry) {
                    resolvedToilets.push(sourceToilet);
                    continue;
                }

                const updatedAt = sourceUpdatedAt(sourceToilet);
                const sourceIsNewer = entry.sync.baseUpdatedAt === null || updatedAt > entry.sync.baseUpdatedAt;
                if (!sourceIsNewer) {
                    resolvedToilets.push(entry.toilet);
                    continue;
                }

                if (!entry.sync.locallyEdited) {
                    const replacement: LocalToiletCacheEntry = {
                        toilet: sourceToilet,
                        sync: {baseUpdatedAt: updatedAt, locallyEdited: false},
                    };
                    nextEntries = nextEntries.map((item) => item.toilet.id === sourceToilet.id ? replacement : item);
                    entriesChanged = true;
                    resolvedToilets.push(sourceToilet);
                    continue;
                }

                const existingConflict = entry.sync.conflict;
                const conflict = existingConflict?.sourceUpdatedAt === updatedAt ? existingConflict : {
                    sourceUpdatedAt: updatedAt,
                    detectedAt: Date.now(),
                    sourceRecord: sourceToilet,
                };
                if (!existingConflict || existingConflict.sourceUpdatedAt !== updatedAt) newConflictCount += 1;
                nextEntries = nextEntries.map((item) => item.toilet.id === sourceToilet.id ? {
                    ...item,
                    sync: {...item.sync, conflict},
                } : item);
                entriesChanged = true;
                resolvedToilets.push(entry.toilet);
            }

            for (const entry of this.entries) {
                if (!sourceById.has(entry.toilet.id)) resolvedToilets.push(entry.toilet);
            }

            if (entriesChanged) this.commitEntries(nextEntries);
            return {toilets: resolvedToilets, newConflictCount};
        },
        clear() {
            this.entries = [];
            localStorage.removeItem(STORAGE_KEY);
            this.storageError = "";
        },
    },
});
