import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

export type WorkspaceTab = "search" | "capture" | "maintenance" | "data-transfer" | "settings";
export type MaintenanceMode = "edit" | "review";

export const useWorkspaceStore = defineStore("workspace", {
    state: () => ({
        activeTab: "search" as WorkspaceTab,
        maintenanceMode: "review" as MaintenanceMode,
        selectedToilet: null as ToiletPlace | null,
    }),
    actions: {
        openSearch() {
            this.activeTab = "search";
        },
        openCapture() {
            this.activeTab = "capture";
        },
        openMaintenance(mode: MaintenanceMode = "review") {
            this.activeTab = "maintenance";
            this.maintenanceMode = mode;
        },
        editToilet(toilet: ToiletPlace) {
            this.selectedToilet = toilet;
            this.openMaintenance("edit");
        },
        selectToilet(toilet: ToiletPlace) {
            this.selectedToilet = toilet;
        }
    }
});
