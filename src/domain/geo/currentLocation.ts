import {debugLog} from "@/Utils/Debug";

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
  reason?: string;
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
  const {forceRefresh = false, timeout = 8000, enableHighAccuracy = true, reason = "位置请求"} = options;
  const cached = getFreshCachedLocation();
  if (cached && !forceRefresh) {
    debugLog("定位", `${reason}：使用 ${Date.now() - cached.capturedAt} ms 前的位置缓存`, cached);
    return Promise.resolve(cached);
  }
  if (pendingLocationRequest) {
    debugLog("定位", `${reason}：复用进行中的浏览器定位请求`);
    return pendingLocationRequest;
  }
  if (!navigator.geolocation) {
    debugLog("定位", `${reason}：当前浏览器不支持定位`, undefined, "warning");
    return Promise.resolve(null);
  }

  debugLog("定位", `${reason}：向浏览器请求当前位置（超时 ${timeout / 1000} 秒）`, {forceRefresh, enableHighAccuracy});

  pendingLocationRequest = new Promise<CurrentLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const location: CurrentLocation = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lon: Number(position.coords.longitude.toFixed(6)),
        accuracy: Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : null,
        capturedAt: Date.now(),
      };
      cachedLocation = location;
      debugLog("定位", `${reason}：定位成功，精度 ${location.accuracy ?? "未知"} 米`, location);
      resolve(location);
    }, (error) => {
      debugLog("定位", `${reason}：定位失败（${error.code}: ${error.message || "未知错误"}）`, error, "warning");
      resolve(null);
    }, {
      timeout,
      maximumAge: 0,
      enableHighAccuracy,
    });
  }).finally(() => {
    pendingLocationRequest = null;
  });

  return pendingLocationRequest;
}
