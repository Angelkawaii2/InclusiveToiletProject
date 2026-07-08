import {defineStore} from "pinia";
import {ToiletPlace} from "@/types/ToiletData-V6";

export type WorkspaceTab = "search" | "maintenance" | "settings";
export type MaintenanceMode = "create" | "edit" | "batch";

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
