import {defineStore} from "pinia";
import {markRaw} from "vue";
import type {ToiletPlace} from "@/domain/toilet/v6";
import {inferRecordOrigin, type RecordOrigin} from "@/domain/toilet/recordState";

export const useToiletDatasetStore = defineStore("toilet.dataset", {
    state: () => ({
        toilets: markRaw([] as ToiletPlace[]),
        dataSourceName: "尚未加载",
        importErrors: [] as string[],
        recordOrigins: markRaw({} as Record<string, RecordOrigin>),
        recordById: markRaw(new Map<string, ToiletPlace>()),
    }),
    getters: {
        getRecordOrigin: (state) => (id: string): RecordOrigin => state.recordOrigins[id] ?? "bundled",
        getToiletById: (state) => (id: string) => state.recordById.get(id),
    },
    actions: {
        replaceDataset(toilets: ToiletPlace[], sourceName: string, origins: Record<string, RecordOrigin> = {}) {
            this.toilets = markRaw(toilets);
            this.dataSourceName = sourceName;
            this.importErrors = [];
            this.recordOrigins = markRaw(Object.fromEntries(toilets.map((toilet) => [
                toilet.id,
                origins[toilet.id] ?? inferRecordOrigin(toilet),
            ])));
            this.recordById = markRaw(new Map(toilets.map((toilet) => [toilet.id, toilet])));
        },
        appendToilets(toilets: ToiletPlace[], sourceName: string, errors: string[] = []) {
            const merged = new Map(this.toilets.map((toilet) => [toilet.id, toilet]));
            toilets.forEach((toilet) => merged.set(toilet.id, toilet));
            this.toilets = markRaw([...merged.values()]);
            this.dataSourceName = sourceName;
            this.importErrors = errors;
            this.recordOrigins = markRaw({
                ...this.recordOrigins,
                ...Object.fromEntries(toilets.map((toilet) => [toilet.id, "fileImport" as RecordOrigin])),
            });
            this.recordById = markRaw(new Map(this.toilets.map((toilet) => [toilet.id, toilet])));
        },
        updateToilet(updatedToilet: ToiletPlace) {
            const index = this.toilets.findIndex((item) => item.id === updatedToilet.id);
            if (index >= 0) {
                const nextToilets = [...this.toilets];
                nextToilets[index] = updatedToilet;
                this.toilets = markRaw(nextToilets);
            } else {
                this.toilets = markRaw([...this.toilets, updatedToilet]);
                this.recordOrigins = markRaw({
                    ...this.recordOrigins,
                    [updatedToilet.id]: inferRecordOrigin(updatedToilet),
                });
            }
            const nextRecordById = new Map(this.recordById);
            nextRecordById.set(updatedToilet.id, updatedToilet);
            this.recordById = markRaw(nextRecordById);
        },
        updateRecordOrigin(id: string, origin: RecordOrigin) {
            this.recordOrigins = markRaw({...this.recordOrigins, [id]: origin});
        },
    },
});
