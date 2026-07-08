import type {AccessRestriction, ToiletKind} from "./types";

export const TOILET_KIND_VALUES: ToiletKind[] = [
    "allGender",
    "male",
    "female",
    "family",
    "accessible",
    "other",
];

export const ACCESS_RESTRICTION_VALUES: AccessRestriction[] = [
    "public",
    "customersOnly",
    "ticketedArea",
    "staffOnly",
    "private",
    "unknown",
];

export const TOILET_KIND_OPTIONS: Array<{ label: string; value: ToiletKind }> = [
    {label: "无性别/包容", value: "allGender"},
    {label: "男厕", value: "male"},
    {label: "女厕", value: "female"},
    {label: "家庭卫生间", value: "family"},
    {label: "无障碍", value: "accessible"},
    {label: "其他", value: "other"},
];

export const ACCESS_RESTRICTION_OPTIONS: Array<{ label: string; value: AccessRestriction }> = [
    {label: "公共开放", value: "public"},
    {label: "仅顾客", value: "customersOnly"},
    {label: "票区内", value: "ticketedArea"},
    {label: "仅员工", value: "staffOnly"},
    {label: "私人区域", value: "private"},
    {label: "未知", value: "unknown"},
];
