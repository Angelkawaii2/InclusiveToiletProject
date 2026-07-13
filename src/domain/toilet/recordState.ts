import type {ToiletPlace} from "@/domain/toilet/v6";

export type RecordOrigin = "bundled" | "fileImport" | "localCreate";
export type RecordChangeKind = "none" | "modified";

export function inferRecordOrigin(record: ToiletPlace): RecordOrigin {
    const source = record.audit.source || "";
    return record.id.startsWith("local-") || source.startsWith("local-") ? "localCreate" : "bundled";
}
