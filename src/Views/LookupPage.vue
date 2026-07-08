<script lang="ts" setup>

import MapComponent from "@/components/edit/v5/MapComponent.vue";
import {computed, nextTick, onMounted, ref} from "vue";
import {Bathroom} from "@/types/ToiletData-V5";
import {ToiletDatasetManifest, ToiletPlace} from "@/types/ToiletData-V6";
import {Search, UploadFilled} from "@element-plus/icons-vue";

const files = ref([])

const bathroomList = ref([] as ToiletPlace[])
const keyword = ref("")
const dataSourceName = ref("尚未加载")
const isLoading = ref(false)
const loadError = ref("")

const mapComponent = ref(null)

function handleFiles(event) {
  const selectFiles = event.target.files;
  files.value = Array.from(selectFiles);
  readFiles(files.value)
}

function readFiles(fs) {
  fs.forEach((file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const jsonData = JSON.parse(fileContent as string);
        const imported = normalizeImportedData(jsonData);
        bathroomList.value = [...bathroomList.value, ...imported];
        dataSourceName.value = `本地导入 ${bathroomList.value.length} 条`;
        renderPoints();
      } catch (err) {
        console.error('Error parsing JSON:', err);
        loadError.value = "导入失败：JSON 格式不正确或不是支持的数据结构。";
      }
    };

    reader.onerror = (e) => {
      console.error('Error reading file:', e.target.error);
    };

    reader.readAsText(file);

  })
}

function normalizeImportedData(input: unknown): ToiletPlace[] {
  const items = Array.isArray(input) ? input : [input];
  return items.map((item) => {
    if (isV6ToiletPlace(item)) return item;
    return convertV5ToPreview(item as Bathroom);
  }).filter(Boolean);
}

function isV6ToiletPlace(item: unknown): item is ToiletPlace {
  return typeof item === "object" && item !== null && "location" in item && "kinds" in item;
}

function convertV5ToPreview(item: Bathroom): ToiletPlace {
  return {
    id: `v5-preview-${item.name || crypto.randomUUID()}`,
    version: "20260708",
    name: item.name || "未命名卫生间",
    isActive: item.isDisabled !== true,
    location: {
      lat: item.loc.lat,
      lon: item.loc.lon,
      alt: item.loc.alt ?? null,
      accuracy: item.loc.accuracy ?? null,
      coordinateSystem: "wgs84"
    },
    kinds: item.types as ToiletPlace["kinds"],
    access: {
      restriction: item.properties?.inPrivateArea ? "private" : "public",
      isFree: item.properties?.isFree ?? null,
      requiresKey: item.accessible?.isLocked ?? null
    },
    facilities: item.properties?.facilities || {},
    accessibility: {
      hasAccessibleToilet: item.types?.includes("accessible") ?? null,
      isIndependentRoom: null,
      isLocked: item.accessible?.isLocked ?? null,
      notes: item.accessible?.comments
    },
    openingHours: item.time
        ? {
          isAlwaysOpen: item.time.allDay,
          text: item.time.allDay ? "24 小时开放" : `${item.time.openAt}-${item.time.closeAt}`
        }
        : undefined,
    audit: {
      createdAt: item.lastUpdateAt || Date.now(),
      updatedAt: item.lastUpdateAt || Date.now(),
      source: "v5-import-preview"
    }
  };
}

async function loadStaticMockData() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const manifestResponse = await fetch("./data/manifest.json");
    const manifest = await manifestResponse.json() as ToiletDatasetManifest;
    const region = manifest.regions[0];
    const regionResponse = await fetch(`./data/${region.dataUrl.replace("./", "")}`);
    bathroomList.value = await regionResponse.json() as ToiletPlace[];
    dataSourceName.value = `${region.name}：${bathroomList.value.length} 条`;
    await nextTick();
    renderPoints();
  } catch (err) {
    console.error(err);
    loadError.value = "静态模拟数据加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function renderPoints() {
  const points = bathroomList.value
      .filter((item) => Number.isFinite(item.location?.lon) && Number.isFinite(item.location?.lat))
      .map((item) => ({lon: item.location.lon, lat: item.location.lat}));
  mapComponent.value?.setPoints(points);
}

const filteredBathrooms = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return bathroomList.value
  return bathroomList.value.filter((item) => {
    return [
      item.name,
      item.address?.district,
      item.address?.detail,
      item.location?.lat?.toString(),
      item.location?.lon?.toString(),
      item.access.restriction,
      ...(item.kinds || []),
      ...(item.tags || [])
    ].some((value) => value?.toLowerCase().includes(q))
  })
})

onMounted(() => {
  loadStaticMockData();
})
</script>

<template>
  <section class="workspace-page">
    <div class="workspace-hero search-hero">
      <div>
        <p class="workspace-eyebrow">搜索浏览</p>
        <h2>查看本地或静态数据里的卫生间</h2>
        <p>默认加载 v6 静态模拟数据，也可以继续导入 JSON 文件叠加预览。</p>
      </div>
      <label class="import-button">
        <el-icon><UploadFilled /></el-icon>
        导入 JSON
        <input ref="fileInput" accept=".json" multiple type="file" @change="handleFiles"/>
      </label>
    </div>

    <div class="search-layout">
      <div class="map-column">
        <map-component ref="mapComponent"></map-component>
      </div>

      <aside class="result-column">
        <div class="result-toolbar">
          <el-input v-model="keyword" clearable placeholder="搜索名称、类型或坐标">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="result-meta">
            <span>{{ dataSourceName }}</span>
            <span>{{ filteredBathrooms.length }} / {{ bathroomList.length }} 条</span>
          </div>
          <el-alert v-if="loadError" :title="loadError" show-icon type="error"/>
          <el-alert v-if="isLoading" title="正在加载静态模拟数据" show-icon type="info"/>
        </div>

        <div v-if="filteredBathrooms.length === 0" class="empty-result">
          <h3>暂无可显示数据</h3>
          <p>静态数据加载完成后，会在这里显示列表并在地图上标记点位。</p>
        </div>

        <div v-else class="result-list">
          <article v-for="(item,idx) in filteredBathrooms" :key="`${item.name}-${idx}`" class="result-item">
            <div>
              <h3>{{ item.name || "未命名卫生间" }}</h3>
              <p>{{ item.kinds?.join(" / ") || "未标记类型" }}</p>
            </div>
            <p class="address">{{ item.address?.district }} {{ item.address?.detail }}</p>
            <div class="coord">
              {{ item.location?.lat?.toFixed?.(5) ?? "?" }}, {{ item.location?.lon?.toFixed?.(5) ?? "?" }}
            </div>
          </article>
        </div>
      </aside>
    </div>
  </section>

</template>

<style scoped>
.search-hero {
  border-color: rgba(51, 110, 190, 0.2);
  background: var(--itp-search-hero);
}

.import-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  background: var(--itp-primary);
  color: #fff;
  cursor: pointer;
}

.import-button input {
  display: none;
}

.search-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.85fr);
  gap: 16px;
  margin-top: 16px;
}

.map-column,
.result-column {
  min-width: 0;
}

.result-column {
  padding: 16px;
  border: 1px solid rgba(111, 139, 153, 0.2);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.result-toolbar {
  display: grid;
  gap: 10px;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.empty-result {
  margin-top: 18px;
  padding: 20px;
  border: 1px dashed var(--itp-border-strong);
  border-radius: 8px;
  color: var(--itp-text-muted);
}

.empty-result h3 {
  margin: 0 0 6px;
  color: var(--itp-text);
}

.empty-result p {
  margin: 0;
}

.result-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
  max-height: 520px;
  overflow: auto;
}

.result-item {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(111, 139, 153, 0.18);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-strong);
}

.result-item h3 {
  margin: 0;
  font-size: 16px;
}

.result-item p,
.coord {
  margin: 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.address {
  color: var(--itp-text) !important;
}

@media (max-width: 920px) {
  .search-layout {
    grid-template-columns: 1fr;
  }
}

</style>
