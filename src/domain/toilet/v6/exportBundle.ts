import {DATA_VERSION} from "@/constants/projectVersions";
import type {ToiletPlace} from "./types";

export const LOCAL_EXPORT_FORMAT = "inclusive-toilet-local-bundle";

export interface ToiletLocalExportBundle {
    format: typeof LOCAL_EXPORT_FORMAT;
    schemaVersion: string;
    exportedAt: number;
    recordCount: number;
    records: ToiletPlace[];
}

export function buildLocalExportBundle(records: ToiletPlace[]): ToiletLocalExportBundle {
    const uniqueRecords = [...new Map(records.map((item) => [item.id, item])).values()];
    return {
        format: LOCAL_EXPORT_FORMAT,
        schemaVersion: DATA_VERSION,
        exportedAt: Date.now(),
        recordCount: uniqueRecords.length,
        records: uniqueRecords,
    };
}

export function createLocalExportFilename(date = new Date()) {
    const timestamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        "-",
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
    ].join("");
    return `inclusive-toilet-local-v6-${timestamp}.json`;
}
