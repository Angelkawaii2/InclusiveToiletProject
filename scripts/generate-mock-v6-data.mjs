import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";

const outputPath = resolve("public/data/regions/mock-shanghai.json");
const manifestPath = resolve("public/data/manifest.json");
const now = Date.now();

const districts = [
    {name: "黄浦区", center: [121.490, 31.230]},
    {name: "徐汇区", center: [121.436, 31.188]},
    {name: "静安区", center: [121.459, 31.246]},
    {name: "长宁区", center: [121.424, 31.220]},
    {name: "浦东新区", center: [121.544, 31.221]},
    {name: "虹口区", center: [121.505, 31.271]},
    {name: "杨浦区", center: [121.526, 31.259]},
    {name: "普陀区", center: [121.395, 31.249]},
];

const placeWords = ["地铁站", "商场", "公园", "图书馆", "社区中心", "游客中心", "医院", "大学", "文化馆", "办公楼"];
const detailWords = ["一层东侧", "二层中庭", "B1 出入口旁", "服务台后方", "无障碍通道旁", "北门附近"];
const kindPool = ["allGender", "accessible", "family", "male", "female", "squat", "seated", "urinal"];

function random(seed) {
    let value = seed % 2147483647;
    return () => {
        value = value * 16807 % 2147483647;
        return (value - 1) / 2147483646;
    };
}

const rng = random(20260708);

function pick(items) {
    return items[Math.floor(rng() * items.length)];
}

function maybe(value, chance = 0.75) {
    return rng() < chance ? value : null;
}

function buildKinds(index) {
    const kinds = new Set();
    kinds.add(index % 5 === 0 ? "allGender" : pick(["male", "female", "seated", "squat"]));
    if (index % 3 === 0) kinds.add("accessible");
    if (index % 8 === 0) kinds.add("family");
    if (index % 9 === 0) kinds.add("urinal");
    return [...kinds];
}

const records = Array.from({length: 200}, (_, index) => {
    const district = districts[index % districts.length];
    const [baseLon, baseLat] = district.center;
    const lon = Number((baseLon + (rng() - 0.5) * 0.08).toFixed(6));
    const lat = Number((baseLat + (rng() - 0.5) * 0.06).toFixed(6));
    const kinds = buildKinds(index);
    const isAccessible = kinds.includes("accessible");
    const placeType = pick(placeWords);
    const id = `mock-shanghai-${String(index + 1).padStart(3, "0")}`;

    return {
        id,
        version: "20260708",
        name: `${district.name}${placeType}包容卫生间 ${index + 1}`,
        aliases: [`${placeType}${index + 1}号卫生间`],
        isActive: index % 37 !== 0,
        location: {
            lat,
            lon,
            alt: null,
            accuracy: Math.round(8 + rng() * 45),
            coordinateSystem: "wgs84"
        },
        address: {
            countryCode: "CN",
            region: "上海市",
            city: "上海市",
            district: district.name,
            street: `${100 + index}号示例路`,
            detail: pick(detailWords),
            floor: pick(["B1", "1F", "2F", "3F"])
        },
        kinds,
        access: {
            restriction: pick(["public", "customersOnly", "ticketedArea", "unknown"]),
            isFree: maybe(index % 11 !== 0, 0.9),
            requiresKey: isAccessible ? maybe(index % 4 === 0, 0.85) : false,
            notes: isAccessible && index % 4 === 0 ? "可能需要向服务台领取钥匙" : undefined
        },
        facilities: {
            hook: maybe(index % 2 === 0),
            mirror: maybe(index % 3 !== 0),
            dryer: maybe(index % 4 !== 0),
            sink: true,
            shower: maybe(index % 17 === 0, 0.4),
            babyCare: maybe(index % 8 === 0, 0.7),
            changingTable: maybe(index % 10 === 0, 0.6),
            menstrualProducts: maybe(index % 13 === 0, 0.5),
            emergencyButton: isAccessible ? maybe(index % 5 !== 0, 0.8) : null,
            adultChangingTable: isAccessible ? maybe(index % 19 === 0, 0.4) : null
        },
        accessibility: {
            hasAccessibleToilet: isAccessible,
            isIndependentRoom: isAccessible ? maybe(index % 6 !== 0, 0.85) : null,
            isLocked: isAccessible ? maybe(index % 4 === 0, 0.85) : null,
            unlockMethod: isAccessible && index % 4 === 0 ? "联系服务台" : undefined,
            notes: isAccessible ? "模拟数据：入口宽度、扶手和回转空间待核验" : undefined
        },
        openingHours: index % 7 === 0
            ? {isAlwaysOpen: true, text: "24 小时开放"}
            : {
                isAlwaysOpen: false,
                text: "每日 08:00-22:00",
                periods: [{days: [1, 2, 3, 4, 5, 6, 0], openAt: "08:00", closeAt: "22:00"}]
            },
        media: [],
        observations: [
            {
                id: `${id}-obs-001`,
                author: "mock-generator",
                rating: Math.round(3 + rng() * 2),
                text: "模拟评价，用于测试列表展示与后续编辑流程。",
                createdAt: now - index * 86400000
            }
        ],
        tags: isAccessible ? ["无障碍", "模拟数据"] : ["模拟数据"],
        externalIds: {
            mock: id
        },
        audit: {
            createdAt: now - index * 86400000,
            updatedAt: now - index * 3600000,
            source: "mock-generator"
        }
    };
});

const manifest = {
    version: "20260708",
    generatedAt: now,
    regions: [
        {
            id: "mock-shanghai",
            name: "上海模拟数据",
            bbox: [121.35, 31.15, 121.60, 31.31],
            updatedAt: now,
            recordCount: records.length,
            dataUrl: "./regions/mock-shanghai.json"
        }
    ]
};

mkdirSync(dirname(outputPath), {recursive: true});
writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${records.length} records at ${outputPath}`);
