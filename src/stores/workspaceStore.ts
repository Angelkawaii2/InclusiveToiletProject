import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

export type WorkspaceTab = "search" | "maintenance" | "data-transfer" | "settings";

export const useWorkspaceStore = defineStore("workspace", {
    state: () => ({
        activeTab: "search" as WorkspaceTab,
        selectedToilet: null as ToiletPlace | null,
        captureOpen: false,
        editOpen: false,
    }),
    actions: {
        openSearch() {
            this.activeTab = "search";
        },
        openCapture() {
            this.captureOpen = true;
        },
        closeCapture() {
            this.captureOpen = false;
        },
        openMaintenance() {
            this.activeTab = "maintenance";
        },
        editToilet(toilet: ToiletPlace) {
            this.selectedToilet = toilet;
            this.editOpen = true;
        },
        closeEditor() {
            this.editOpen = false;
        },
        selectToilet(toilet: ToiletPlace) {
            this.selectedToilet = toilet;
        }
    }
});
