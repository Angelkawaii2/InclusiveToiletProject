import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

export const useToiletDatasetStore = defineStore("toilet.dataset", {
    state: () => ({
        toilets: [] as ToiletPlace[],
        dataSourceName: "尚未加载",
        importErrors: [] as string[],
    }),
    actions: {
        replaceDataset(toilets: ToiletPlace[], sourceName: string) {
            this.toilets = toilets;
            this.dataSourceName = sourceName;
            this.importErrors = [];
        },
        appendToilets(toilets: ToiletPlace[], sourceName: string, errors: string[] = []) {
            const merged = new Map(this.toilets.map((toilet) => [toilet.id, toilet]));
            toilets.forEach((toilet) => merged.set(toilet.id, toilet));
            this.toilets = [...merged.values()];
            this.dataSourceName = sourceName;
            this.importErrors = errors;
        },
        updateToilet(updatedToilet: ToiletPlace) {
            const index = this.toilets.findIndex((item) => item.id === updatedToilet.id);
            if (index >= 0) {
                this.toilets.splice(index, 1, updatedToilet);
            } else {
                this.toilets.push(updatedToilet);
            }
        },
    },
});
