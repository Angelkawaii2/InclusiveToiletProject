import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";
import {inferRecordOrigin, type RecordOrigin} from "@/domain/toilet/recordState";

export const useToiletDatasetStore = defineStore("toilet.dataset", {
    state: () => ({
        toilets: [] as ToiletPlace[],
        dataSourceName: "尚未加载",
        importErrors: [] as string[],
        recordOrigins: {} as Record<string, RecordOrigin>,
    }),
    getters: {
        getRecordOrigin: (state) => (id: string): RecordOrigin => state.recordOrigins[id] ?? "bundled",
    },
    actions: {
        replaceDataset(toilets: ToiletPlace[], sourceName: string, origins: Record<string, RecordOrigin> = {}) {
            this.toilets = toilets;
            this.dataSourceName = sourceName;
            this.importErrors = [];
            this.recordOrigins = Object.fromEntries(toilets.map((toilet) => [
                toilet.id,
                origins[toilet.id] ?? inferRecordOrigin(toilet),
            ]));
        },
        appendToilets(toilets: ToiletPlace[], sourceName: string, errors: string[] = []) {
            const merged = new Map(this.toilets.map((toilet) => [toilet.id, toilet]));
            toilets.forEach((toilet) => merged.set(toilet.id, toilet));
            this.toilets = [...merged.values()];
            this.dataSourceName = sourceName;
            this.importErrors = errors;
            this.recordOrigins = {
                ...this.recordOrigins,
                ...Object.fromEntries(toilets.map((toilet) => [toilet.id, "fileImport" as RecordOrigin])),
            };
        },
        updateToilet(updatedToilet: ToiletPlace) {
            const index = this.toilets.findIndex((item) => item.id === updatedToilet.id);
            if (index >= 0) {
                this.toilets.splice(index, 1, updatedToilet);
            } else {
                this.toilets.push(updatedToilet);
                this.recordOrigins[updatedToilet.id] = inferRecordOrigin(updatedToilet);
            }
        },
        updateRecordOrigin(id: string, origin: RecordOrigin) {
            this.recordOrigins[id] = origin;
        },
    },
});
