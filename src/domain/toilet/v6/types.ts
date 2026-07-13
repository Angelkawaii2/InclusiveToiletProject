export type DataVersion = string;

export type Unknownable<T> = T | null;

export type CoordinateSystem = "wgs84" | "gcj02" | "bd09" | "unknown";

export type ToiletKind =
    | "allGender"
    | "male"
    | "female"
    | "family"
    | "accessible"
    | "other";

export type AccessRestriction =
    | "public"
    | "customersOnly"
    | "ticketedArea"
    | "private"
    | "unknown";

export type FacilityKey =
    | "hook"
    | "mirror"
    | "dryer"
    | "sink"
    | "shower"
    | "babyCare"
    | "changingTable"
    | "menstrualProducts"
    | "emergencyButton"
    | "adultChangingTable"
    | "parkingAllowed";

export interface AuditMetadata {
    createdAt: number;
    updatedAt: number;
    reviewed: boolean;
    createdBy?: string;
    updatedBy?: string;
    source?: string;
}

export interface GeoPoint {
    lat: number;
    lon: number;
    alt: Unknownable<number>;
    accuracy: Unknownable<number>;
    coordinateSystem: CoordinateSystem;
}

export interface PlaceAddress {
    country?: string;
    province?: string;
    city?: string;
    description?: string;
}

export interface OpeningHours {
    isAlwaysOpen: Unknownable<boolean>;
    text?: string;
    periods?: OpeningPeriod[];
}

export interface OpeningPeriod {
    days: number[];
    openAt: string;
    closeAt: string;
}

export interface AccessibilityInfo {
    hasAccessibleToilet: Unknownable<boolean>;
    isSeparateStall: Unknownable<boolean>;
    isLocked: Unknownable<boolean>;
    unlockMethod?: string;
    notes?: string;
}

export interface MediaAsset {
    id: string;
    type: "image";
    url: string;
    thumbnailUrl?: string;
    hash?: string;
    caption?: string;
    createdAt?: number;
}

export interface UserObservation {
    id: string;
    author?: string;
    rating: Unknownable<number>;
    text: string;
    createdAt: number;
    signature?: string;
    signatureAlgorithm?: string;
}

export interface ToiletPlace {
    id: string;
    version: DataVersion;
    name: string;
    aliases?: string[];
    isActive: boolean;
    location: GeoPoint;
    address?: PlaceAddress;
    kinds: ToiletKind[];
    access: {
        restriction: AccessRestriction;
        notes?: string;
    };
    facilities: Partial<Record<FacilityKey, Unknownable<boolean>>>;
    accessibility: AccessibilityInfo;
    openingHours?: OpeningHours;
    media?: MediaAsset[];
    observations?: UserObservation[];
    externalIds?: Record<string, string>;
    audit: AuditMetadata;
}

export interface ToiletDatasetRegion {
    id: string;
    name: string;
    bbox: [number, number, number, number];
    updatedAt: number;
    recordCount: number;
    dataUrl: string;
    sha256?: string;
}

export interface ToiletDatasetManifest {
    version: DataVersion;
    generatedAt: number;
    regions: ToiletDatasetRegion[];
}
