export type LocationPermissionState = PermissionState | "unknown";

export async function getLocationPermissionState(): Promise<LocationPermissionState> {
    if (!navigator.permissions?.query) return "unknown";
    try {
        const status = await navigator.permissions.query({name: "geolocation"} as PermissionDescriptor);
        return status.state;
    } catch {
        return "unknown";
    }
}
