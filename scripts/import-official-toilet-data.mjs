import {createHash} from "node:crypto";
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";

const sourceDirectory = process.argv[2];

if (!sourceDirectory) {
    throw new Error("用法：pnpm import:official-data -- <公共厕所数据目录>");
}

const sourceRoot = resolve(sourceDirectory);
if (!existsSync(sourceRoot)) {
    throw new Error(`找不到数据目录：${sourceRoot}`);
}

const projectVersions = JSON.parse(readFileSync(resolve("project-versions.json"), "utf8"));
const outputRoot = resolve("public/data");
const outputRegionsRoot = resolve(outputRoot, "regions");
const importTimestamp = Date.parse("2024-09-12T00:00:00+08:00");

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(sourceRoot, relativePath), "utf8"));
}

function extractTopLevelArrays(relativePath) {
    const text = readFileSync(resolve(sourceRoot, relativePath), "utf8");
    const arrays = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (inString) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === "\"") inString = false;
            continue;
        }
        if (char === "\"") {
            inString = true;
            continue;
        }
        if (char === "[") {
            if (depth === 0) start = index;
            depth += 1;
            continue;
        }
        if (char === "]" && depth > 0) {
            depth -= 1;
            if (depth === 0) arrays.push(JSON.parse(text.slice(start, index + 1)));
        }
    }
    return arrays;
}

function sourceRows(relativePath) {
    const arrays = extractTopLevelArrays(relativePath);
    const rows = arrays.at(-1);
    if (!Array.isArray(rows)) throw new Error(`无法读取记录数组：${relativePath}`);
    return rows;
}

function cleanText(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return trimmed === "-" ? "" : trimmed;
}

function timestamp(value, fallback = importTimestamp) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const text = cleanText(value);
    if (!text) return fallback;
    const normalized = /[zZ]|[+-]\d\d:\d\d$/.test(text)
        ? text
        : `${text.replace(" ", "T")}+08:00`;
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function sourceBoolean(value) {
    const text = cleanText(String(value));
    if (["是", "有", "1", "2", "true"].includes(text)) return true;
    if (["否", "无", "0", "false"].includes(text)) return false;
    return null;
}

function coordinatePair(value) {
    if (!Array.isArray(value) || value.length < 2) return null;
    const [lon, lat] = value.map(Number);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return {lat, lon};
}

function baseRecord({id, name, location, address, updatedAt, source, kinds = ["other"], isActive = true, facilities = {}, accessibility = {}, openingHours, externalIds = {}, aliases = []}) {
    return {
        id,
        version: projectVersions.dataVersion,
        name: cleanText(name) || "未命名卫生间",
        ...(aliases.length > 0 ? {aliases} : {}),
        isActive,
        location: {
            ...location,
            alt: null,
            accuracy: null,
            coordinateSystem: "wgs84",
        },
        address,
        kinds,
        access: {restriction: "public"},
        facilities,
        accessibility: {
            hasAccessibleToilet: accessibility.hasAccessibleToilet ?? null,
            isSeparateStall: null,
            isLocked: null,
        },
        ...(openingHours ? {openingHours} : {}),
        externalIds,
        audit: {
            createdAt: updatedAt,
            updatedAt,
            reviewed: false,
            source,
        },
    };
}

function deduplicate(records) {
    return [...new Map(records.map((record) => [record.id, record])).values()];
}

function buildPudongRegion() {
    const records = readJson("浦东新区卫生间.json").flatMap((row) => {
        try {
            const geometry = JSON.parse(row["几何坐标"]);
            const location = coordinatePair(geometry.coordinates);
            if (!location) return [];
            const sequence = String(row["序号"] || `${location.lon},${location.lat}`);
            return [baseRecord({
                id: `cn-shanghai-pudong-${sequence}`,
                name: row["名称"],
                location,
                address: {country: "中国", province: "上海市", city: "上海市", description: "浦东新区"},
                updatedAt: importTimestamp,
                source: "shanghai-pudong-public-toilet",
                externalIds: {sourceId: sequence, sourceCategory: cleanText(row["地图分类"])},
            })];
        } catch {
            return [];
        }
    });
    return {id: "shanghai-pudong", name: "上海市浦东新区", fileName: "shanghai-pudong.json", records: deduplicate(records)};
}

function buildXiamenRegion() {
    const outputDirectory = resolve(sourceRoot, "output");
    const records = readdirSync(outputDirectory)
        .filter((name) => name.endsWith(".json"))
        .sort((left, right) => left.localeCompare(right, "zh-CN"))
        .flatMap((fileName) => {
            const legacy = JSON.parse(readFileSync(resolve(outputDirectory, fileName), "utf8"));
            const location = coordinatePair([legacy.loc?.lon, legacy.loc?.lat]);
            const metadata = legacy.extra?.amoy || {};
            const sourceId = cleanText(String(metadata.id));
            if (!location || !sourceId) return [];
            const labelName = cleanText(metadata.labelname);
            const name = cleanText(legacy.name) || labelName;
            return [baseRecord({
                id: `cn-xiamen-${sourceId}`,
                name,
                aliases: labelName && labelName !== name ? [labelName] : [],
                location,
                address: {
                    country: "中国",
                    province: "福建省",
                    city: "厦门市",
                    description: [cleanText(metadata.flmc), cleanText(metadata.xxlmc)].filter(Boolean).join(" ") || undefined,
                },
                updatedAt: timestamp(legacy.lastUpdateAt),
                source: "xiamen-public-toilet-2022",
                externalIds: {
                    sourceId,
                    objectId: cleanText(String(metadata.objectid)),
                    sourceCategory: cleanText(metadata.xxlmc),
                },
            })];
        });
    return {id: "xiamen", name: "厦门市", fileName: "xiamen.json", records: deduplicate(records)};
}

function buildShenzhenRegion() {
    const records = sourceRows("20230515-深圳-公共厕所信息_2920000100929.json").flatMap((row) => {
        try {
            const location = coordinatePair(JSON.parse(row.JWD).wgs84.split(","));
            const sourceId = cleanText(String(row.ID));
            if (!location || !sourceId || cleanText(row.STATUS) === "作废") return [];
            const hasThirdToilet = sourceBoolean(row.DSWSJ);
            const hasBabyCare = sourceBoolean(row.MYS);
            const openAt = cleanText(row.OPEN);
            const closeAt = cleanText(row.CLOSED);
            const hasOpeningHours = openAt && closeAt;
            const isAlwaysOpen = openAt === "00:00" && ["00:00", "23:59", "24:00"].includes(closeAt);
            return [baseRecord({
                id: `cn-shenzhen-${sourceId}`,
                name: row.NAME,
                location,
                address: {country: "中国", province: "广东省", city: "深圳市", description: cleanText(row.ADDRESS) || undefined},
                updatedAt: importTimestamp,
                source: "shenzhen-public-toilet-20230515",
                kinds: hasThirdToilet ? ["familyAccessible"] : ["other"],
                facilities: hasBabyCare === null ? {} : {babyCare: hasBabyCare},
                accessibility: {hasAccessibleToilet: hasThirdToilet},
                ...(hasOpeningHours ? {
                    openingHours: {
                        isAlwaysOpen: isAlwaysOpen,
                        text: isAlwaysOpen ? "24 小时开放" : `${openAt}-${closeAt}`,
                    },
                } : {}),
                externalIds: {sourceId, sourceStatus: cleanText(row.STATUS), thirdToilet: cleanText(row.DSWSJ)},
            })];
        } catch {
            return [];
        }
    });
    return {id: "shenzhen", name: "深圳市", fileName: "shenzhen.json", records: deduplicate(records)};
}

function bounds(records) {
    const lons = records.map((record) => record.location.lon);
    const lats = records.map((record) => record.location.lat);
    return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

function writeJson(filePath, value) {
    mkdirSync(dirname(filePath), {recursive: true});
    writeFileSync(filePath, `${JSON.stringify(value)}\n`);
}

const regions = [buildPudongRegion(), buildXiamenRegion(), buildShenzhenRegion()];
const manifestRegions = regions.map((region) => {
    const filePath = resolve(outputRegionsRoot, region.fileName);
    writeJson(filePath, region.records);
    const serialized = readFileSync(filePath);
    return {
        id: region.id,
        name: region.name,
        bbox: bounds(region.records),
        updatedAt: Math.max(...region.records.map((record) => record.audit.updatedAt)),
        recordCount: region.records.length,
        dataUrl: `./regions/${region.fileName}`,
        sha256: createHash("sha256").update(serialized).digest("hex"),
    };
});

writeJson(resolve(outputRoot, "manifest.json"), {
    version: projectVersions.dataVersion,
    generatedAt: importTimestamp,
    regions: manifestRegions,
});

writeJson(resolve(outputRoot, "conversion-report.json"), {
    sourcePackage: "公共厕所信息20240912012345594352",
    importedAt: importTimestamp,
    importedRegions: manifestRegions.map(({id, name, recordCount}) => ({id, name, recordCount})),
    skippedSources: [
        {file: "全市公共厕所基本信息表.json", recordCount: sourceRows("全市公共厕所基本信息表.json").length, reason: "缺少经纬度，无法准确显示在地图上"},
        {file: "公厕信息表.json", recordCount: sourceRows("公厕信息表.json").length, reason: "缺少经纬度，无法准确显示在地图上"},
        {file: "宝山区公厕信息.json", recordCount: readJson("宝山区公厕信息.json").length, reason: "缺少经纬度，无法准确显示在地图上"},
    ],
    excludedRecords: [
        {file: "20230515-深圳-公共厕所信息_2920000100929.json", reason: "作废或缺少有效 WGS84 坐标"},
        {file: "厦门市公共厕所地理分布汇总.json", reason: "仅导入已生成且包含有效 WGS84 坐标的 output/ 记录"},
    ],
});

console.log(`Imported ${manifestRegions.reduce((total, region) => total + region.recordCount, 0)} official records across ${manifestRegions.length} regions.`);
