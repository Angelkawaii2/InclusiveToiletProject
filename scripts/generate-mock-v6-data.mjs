import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";

const outputPath = resolve("public/data/regions/mock-qingdao.json");
const manifestPath = resolve("public/data/manifest.json");
const projectVersions = JSON.parse(readFileSync(resolve("project-versions.json"), "utf8"));
const now = Date.now();

const districts = [
    {name: "市南区", center: [120.412, 36.075]},
    {name: "市北区", center: [120.374, 36.100]},
    {name: "李沧区", center: [120.432, 36.166]},
    {name: "崂山区", center: [120.468, 36.107]},
    {name: "城阳区", center: [120.396, 36.307]},
    {name: "西海岸新区", center: [120.198, 35.966]},
    {name: "即墨区", center: [120.447, 36.389]},
    {name: "胶州市", center: [120.033, 36.264]},
];

const placeWords = ["地铁站", "商场", "海滨公园", "图书馆", "社区中心", "游客中心", "医院", "大学", "文化馆", "写字楼"];
const detailWords = ["一层东侧", "二层中庭", "B1 出入口旁", "服务台后方", "无障碍通道旁", "海边步道入口附近"];

function random(seed) {
    let value = seed % 2147483647;
    return () => {
        value = value * 16807 % 2147483647;
        return (value - 1) / 2147483646;
    };
}

const rng = random(projectVersions.mockSeed);

function pick(items) {
    return items[Math.floor(rng() * items.length)];
}

function maybe(value, chance = 0.75) {
    return rng() < chance ? value : null;
}

function buildKinds(index) {
    const kinds = new Set();
    kinds.add(index % 5 === 0 ? "allGender" : pick(["male", "female"]));
    if (index % 3 === 0) kinds.add("accessible");
    if (index % 8 === 0) kinds.add("family");
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
    const id = `mock-qingdao-${String(index + 1).padStart(3, "0")}`;

    return {
        id,
        version: projectVersions.dataVersion,
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
            country: "中国",
            province: "山东省",
            city: "青岛市",
            description: `${district.name}${100 + index}号示例路，${pick(detailWords)}`
        },
        kinds,
        access: {
            restriction: pick(["public", "customersOnly", "ticketedArea", "unknown"]),
            notes: isAccessible && index % 4 === 0 ? "建议向服务台确认开放状态" : undefined
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
            isSeparateStall: isAccessible ? maybe(index % 6 !== 0, 0.85) : null,
            isLocked: isAccessible ? maybe(index % 4 === 0, 0.85) : null,
            unlockMethod: undefined,
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
    version: projectVersions.dataVersion,
    generatedAt: now,
    regions: [
        {
            id: "mock-qingdao",
            name: "青岛模拟数据",
            bbox: [119.45, 35.55, 121.25, 37.15],
            updatedAt: now,
            recordCount: records.length,
            dataUrl: "./regions/mock-qingdao.json"
        }
    ]
};

mkdirSync(dirname(outputPath), {recursive: true});
writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${records.length} records at ${outputPath}`);
