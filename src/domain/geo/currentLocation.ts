export interface CurrentLocation {
  lat: number;
  lon: number;
  accuracy: number | null;
  capturedAt: number;
}

interface CurrentLocationOptions {
  forceRefresh?: boolean;
  timeout?: number;
  enableHighAccuracy?: boolean;
}

export const CURRENT_LOCATION_CACHE_MS = 15_000;

let cachedLocation: CurrentLocation | null = null;
let pendingLocationRequest: Promise<CurrentLocation | null> | null = null;

function getFreshCachedLocation() {
  if (!cachedLocation || Date.now() - cachedLocation.capturedAt >= CURRENT_LOCATION_CACHE_MS) return null;
  return cachedLocation;
}

export function getCurrentLocationCache() {
  return getFreshCachedLocation();
}

export function requestCurrentLocation(options: CurrentLocationOptions = {}) {
  const {forceRefresh = false, timeout = 8000, enableHighAccuracy = true} = options;
  const cached = getFreshCachedLocation();
  if (cached && !forceRefresh) return Promise.resolve(cached);
  if (pendingLocationRequest) return pendingLocationRequest;
  if (!navigator.geolocation) return Promise.resolve(null);

  pendingLocationRequest = new Promise<CurrentLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const location: CurrentLocation = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lon: Number(position.coords.longitude.toFixed(6)),
        accuracy: Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : null,
        capturedAt: Date.now(),
      };
      cachedLocation = location;
      resolve(location);
    }, () => resolve(null), {
      timeout,
      maximumAge: 0,
      enableHighAccuracy,
    });
  }).finally(() => {
    pendingLocationRequest = null;
  });

  return pendingLocationRequest;
}
