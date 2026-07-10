import {defineStore} from "pinia";
import type {ToiletPlace} from "@/domain/toilet/v6";

export type WorkspaceTab = "search" | "maintenance" | "data-transfer" | "settings";
export type MaintenanceMode = "create" | "edit" | "review";

export const useWorkspaceStore = defineStore("workspace", {
    state: () => ({
        activeTab: "search" as WorkspaceTab,
        maintenanceMode: "create" as MaintenanceMode,
        selectedToilet: null as ToiletPlace | null,
    }),
    actions: {
        openSearch() {
            this.activeTab = "search";
        },
        openMaintenance(mode: MaintenanceMode = "create") {
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
