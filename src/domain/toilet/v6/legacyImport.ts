import {DATA_VERSION} from "@/constants/projectVersions";
import type {ToiletPlace} from "./types";
import {isV6ToiletPlace, normalizeToiletKinds} from "./validation";

interface LegacyBathroom {
    name?: string;
    isDisabled?: boolean;
    lastUpdateAt?: number;
    loc?: {
        lat?: number;
        lon?: number;
        alt?: number | null;
        accuracy?: number | null;
    };
    types?: string[];
    properties?: {
        inPrivateArea?: boolean;
        isFree?: boolean;
        facilities?: ToiletPlace["facilities"];
    };
    accessible?: {
        isLocked?: boolean | null;
        comments?: string;
    };
    time?: {
        allDay?: boolean | null;
        openAt?: string;
        closeAt?: string;
    };
}

export interface ImportResult {
    toilets: ToiletPlace[];
    errors: string[];
}

function isLegacyBathroom(value: unknown): value is LegacyBathroom {
    return typeof value === "object" && value !== null && "loc" in value && "types" in value;
}

function convertLegacyBathroomToV6(item: LegacyBathroom): ToiletPlace | null {
    if (typeof item.loc?.lat !== "number" || typeof item.loc?.lon !== "number") return null;
    const updatedAt = item.lastUpdateAt || Date.now();
    return {
        id: `legacy-preview-${item.name || crypto.randomUUID()}`,
        version: DATA_VERSION,
        name: item.name || "未命名卫生间",
        isActive: item.isDisabled !== true,
        location: {
            lat: item.loc.lat,
            lon: item.loc.lon,
            alt: item.loc.alt ?? null,
            accuracy: item.loc.accuracy ?? null,
            coordinateSystem: "wgs84",
        },
        kinds: normalizeToiletKinds(item.types),
        access: {
            restriction: item.properties?.inPrivateArea ? "private" : "public",
            notes: item.properties?.isFree === false ? "旧数据标记为收费" : undefined,
        },
        facilities: item.properties?.facilities || {},
        accessibility: {
            hasAccessibleToilet: item.types?.includes("accessible") ?? null,
            isSeparateStall: null,
            isLocked: item.accessible?.isLocked ?? null,
            notes: item.accessible?.comments,
        },
        openingHours: item.time
            ? {
                isAlwaysOpen: item.time.allDay ?? null,
                text: item.time.allDay ? "24 小时开放" : `${item.time.openAt || "?"}-${item.time.closeAt || "?"}`,
            }
            : undefined,
        audit: {
            createdAt: updatedAt,
            updatedAt,
            reviewed: false,
            source: "legacy-import-preview",
        },
    };
}

export function normalizeImportedToilets(input: unknown): ImportResult {
    const items = Array.isArray(input) ? input : [input];
    const toilets: ToiletPlace[] = [];
    const errors: string[] = [];

    items.forEach((item, index) => {
        if (isV6ToiletPlace(item)) {
            toilets.push({
                ...item,
                audit: {
                    ...item.audit,
                    reviewed: item.audit.reviewed ?? false,
                },
            });
            return;
        }
        if (isLegacyBathroom(item)) {
            const converted = convertLegacyBathroomToV6(item);
            if (converted) {
                toilets.push(converted);
                return;
            }
        }
        errors.push(`第 ${index + 1} 条记录不是可识别的 v6 或旧版数据`);
    });

    return {toilets, errors};
}
