import {ElNotification} from "element-plus";
import {SETTINGS_KEYS} from "@/stores/settingsStore";

type DebugLevel = "info" | "warning" | "error";

function isDebugEnabled() {
  return localStorage.getItem(SETTINGS_KEYS.IS_DEBUG) === "true";
}

export function debugLog(scope: string, message: string, details?: unknown, level: DebugLevel = "info") {
  if (!isDebugEnabled()) return;

  const prefix = `[Debug][${scope}] ${message}`;
  if (level === "error") console.error(prefix, details ?? "");
  else if (level === "warning") console.warn(prefix, details ?? "");
  else console.info(prefix, details ?? "");

  ElNotification({
    title: `Debug · ${scope}`,
    message,
    type: level,
    position: "top-right",
    duration: 2800,
  });
}
