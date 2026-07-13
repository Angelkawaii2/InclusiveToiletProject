import {ACCESS_RESTRICTION_VALUES, TOILET_KIND_VALUES} from "./options";
import type {AccessRestriction, ToiletKind, ToiletPlace} from "./types";

type PlainObject = Record<string, unknown>;

function isObject(value: unknown): value is PlainObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableBoolean(value: unknown): value is boolean | null {
    return typeof value === "boolean" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
    return typeof value === "number" || value === null;
}

function isToiletKind(value: unknown): value is ToiletKind {
    return typeof value === "string" && TOILET_KIND_VALUES.includes(value as ToiletKind);
}

function isAccessRestriction(value: unknown): value is AccessRestriction {
    return typeof value === "string" && ACCESS_RESTRICTION_VALUES.includes(value as AccessRestriction);
}

export function normalizeToiletKinds(kinds: unknown): ToiletKind[] {
    if (!Array.isArray(kinds)) return ["other"];
    const normalized = kinds
        .map((kind) => kind === "family" || kind === "accessible" ? "familyAccessible" : kind)
        .filter(isToiletKind);
    const uniqueKinds = [...new Set(normalized)];
    return uniqueKinds.length > 0 ? uniqueKinds : ["other"];
}

export function isV6ToiletPlace(value: unknown): value is ToiletPlace {
    if (!isObject(value)) return false;
    if (typeof value.id !== "string") return false;
    if (typeof value.version !== "string") return false;
    if (typeof value.name !== "string") return false;
    if (typeof value.isActive !== "boolean") return false;
    if (!isObject(value.location)) return false;
    if (typeof value.location.lat !== "number" || typeof value.location.lon !== "number") return false;
    if (!isNullableNumber(value.location.alt) || !isNullableNumber(value.location.accuracy)) return false;
    if (!["wgs84", "gcj02", "bd09", "unknown"].includes(String(value.location.coordinateSystem))) return false;
    if (!Array.isArray(value.kinds) || value.kinds.some((kind) => !isToiletKind(kind))) return false;
    if (!isObject(value.access) || !isAccessRestriction(value.access.restriction)) return false;
    if (!isObject(value.facilities)) return false;
    if (!isObject(value.accessibility)) return false;
    if (!isNullableBoolean(value.accessibility.hasAccessibleToilet)) return false;
    if (!isNullableBoolean(value.accessibility.isSeparateStall)) return false;
    if (!isNullableBoolean(value.accessibility.isLocked)) return false;
    if (!isObject(value.audit)) return false;
    if (value.audit.isMock !== undefined && typeof value.audit.isMock !== "boolean") return false;
    return typeof value.audit.createdAt === "number" && typeof value.audit.updatedAt === "number";
}
