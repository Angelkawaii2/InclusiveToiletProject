// stores/gpsDeltaSecStore.ts
import {defineStore} from 'pinia';

export const useCurrentGpsStatus = defineStore("gps:status", {
    state: () => ({
        deltaSec: -1,
        isAcquiring: false,
        gpsCoords: null,
        gpsTimestamp: 0
    }),
    actions: {
        isTimeout(): boolean {
            return this.deltaSec === -1;
        },
        reset() {
            this.deltaSec = -1;
            this.gpsTimestamp = 0
        },
        hasGpsData(): boolean {
            return this.gpsCoords === undefined
        }
    }
});
