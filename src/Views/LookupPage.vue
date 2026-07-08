<script lang="ts" setup>

import MapComponent from "@/components/edit/v5/MapComponent.vue";
import {computed, nextTick, onMounted, ref} from "vue";
import {Bathroom} from "@/types/ToiletData-V5";
import {ToiletDatasetManifest, ToiletPlace} from "@/types/ToiletData-V6";
import {Aim, Edit, Location, Search, View, UploadFilled} from "@element-plus/icons-vue";
import {useWorkspaceStore} from "@/stores/workspaceStore";

const files = ref([])
const workspace = useWorkspaceStore()

const bathroomList = ref([] as ToiletPlace[])
const keyword = ref("")
const dataSourceName = ref("尚未加载")
const isLoading = ref(false)
const loadError = ref("")
const selectedId = ref("")
const sortByNearest = ref(false)
const userLocation = ref<{ lat: number; lon: number } | null>(null)
const detailVisible = ref(false)
const detailToilet = ref<ToiletPlace | null>(null)

const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null)

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

function distanceInMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const radius = 6371000;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function formatDistance(item: ToiletPlace) {
  if (!userLocation.value) return "";
  const meters = distanceInMeters(userLocation.value, item.location);
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function sortNearest() {
  loadError.value = "";
  if (!navigator.geolocation) {
    loadError.value = "当前浏览器不支持定位，无法按最近排序。";
    return;
  }
  navigator.geolocation.getCurrentPosition((position) => {
    userLocation.value = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };
    sortByNearest.value = true;
  }, () => {
    loadError.value = "定位失败，请检查浏览器定位权限后重试。";
  }, {
    timeout: 8000,
    enableHighAccuracy: true
  });
}

function selectToilet(item: ToiletPlace) {
  selectedId.value = item.id;
  workspace.selectToilet(item);
  mapComponent.value?.focusPoint(item.location.lon, item.location.lat);
}

function viewDetails(item: ToiletPlace) {
  selectToilet(item);
  detailToilet.value = item;
  detailVisible.value = true;
}

function editToilet(item: ToiletPlace) {
  selectToilet(item);
  detailVisible.value = false;
  workspace.editToilet(item);
}

function formatBoolean(value: boolean | null | undefined, yes = "是", no = "否") {
  if (value === null || value === undefined) return "未知";
  return value ? yes : no;
}

const filteredBathrooms = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  const filtered = !q ? bathroomList.value : bathroomList.value.filter((item) => {
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
  if (!sortByNearest.value || !userLocation.value) return filtered;
  return [...filtered].sort((a, b) => {
    return distanceInMeters(userLocation.value!, a.location) - distanceInMeters(userLocation.value!, b.location);
  });
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
          <div class="toolbar-actions">
            <el-button :type="sortByNearest ? 'primary' : 'default'" @click="sortNearest">
              <el-icon><Location /></el-icon>
              按最近排序
            </el-button>
            <el-button v-if="sortByNearest" @click="sortByNearest = false">
              恢复默认排序
            </el-button>
          </div>
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
          <article v-for="(item,idx) in filteredBathrooms"
                   :key="`${item.name}-${idx}`"
                   :class="['result-item', { active: selectedId === item.id }]"
                   @click="selectToilet(item)">
            <div>
              <h3>{{ item.name || "未命名卫生间" }}</h3>
              <p>{{ item.kinds?.join(" / ") || "未标记类型" }}</p>
            </div>
            <p class="address">{{ item.address?.district }} {{ item.address?.detail }}</p>
            <div class="result-footer">
              <div class="coord">
                <el-icon><Aim /></el-icon>
                {{ item.location?.lat?.toFixed?.(5) ?? "?" }}, {{ item.location?.lon?.toFixed?.(5) ?? "?" }}
              </div>
              <span v-if="userLocation" class="distance">{{ formatDistance(item) }}</span>
            </div>
            <div class="item-actions">
              <el-button size="small" @click.stop="viewDetails(item)">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button size="small" type="primary" @click.stop="editToilet(item)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
          </article>
        </div>
      </aside>
    </div>

    <el-drawer v-model="detailVisible" size="420px" direction="rtl">
      <template #header>
        <div>
          <h3 class="drawer-title">{{ detailToilet?.name || "卫生间详情" }}</h3>
          <p class="drawer-subtitle">{{ detailToilet?.address?.district }} {{ detailToilet?.address?.detail }}</p>
        </div>
      </template>

      <div v-if="detailToilet" class="detail-panel">
        <section>
          <h4>位置</h4>
          <dl>
            <div>
              <dt>坐标</dt>
              <dd>{{ detailToilet.location.lat.toFixed(6) }}, {{ detailToilet.location.lon.toFixed(6) }}</dd>
            </div>
            <div>
              <dt>楼层</dt>
              <dd>{{ detailToilet.address?.floor || "未知" }}</dd>
            </div>
            <div>
              <dt>定位精度</dt>
              <dd>{{ detailToilet.location.accuracy ? `${detailToilet.location.accuracy} m` : "未知" }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>类型与通行</h4>
          <dl>
            <div>
              <dt>类型</dt>
              <dd>{{ detailToilet.kinds.join(" / ") || "未标记" }}</dd>
            </div>
            <div>
              <dt>进入限制</dt>
              <dd>{{ detailToilet.access.restriction }}</dd>
            </div>
            <div>
              <dt>免费</dt>
              <dd>{{ formatBoolean(detailToilet.access.isFree) }}</dd>
            </div>
            <div>
              <dt>需要钥匙</dt>
              <dd>{{ formatBoolean(detailToilet.access.requiresKey) }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>无障碍信息</h4>
          <dl>
            <div>
              <dt>无障碍卫生间</dt>
              <dd>{{ formatBoolean(detailToilet.accessibility.hasAccessibleToilet, "有", "无") }}</dd>
            </div>
            <div>
              <dt>是否上锁</dt>
              <dd>{{ formatBoolean(detailToilet.accessibility.isLocked) }}</dd>
            </div>
            <div>
              <dt>备注</dt>
              <dd>{{ detailToilet.accessibility.notes || "暂无" }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>开放与标签</h4>
          <dl>
            <div>
              <dt>开放时间</dt>
              <dd>{{ detailToilet.openingHours?.text || "未知" }}</dd>
            </div>
            <div>
              <dt>标签</dt>
              <dd>{{ detailToilet.tags?.join(" / ") || "无" }}</dd>
            </div>
            <div>
              <dt>最近更新</dt>
              <dd>{{ new Date(detailToilet.audit.updatedAt).toLocaleString() }}</dd>
            </div>
          </dl>
        </section>

        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="primary" @click="editToilet(detailToilet)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>
    </el-drawer>
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

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.result-item:hover,
.result-item.active {
  border-color: var(--itp-primary);
  box-shadow: 0 8px 24px rgba(51, 110, 190, 0.14);
}

.result-item.active {
  transform: translateY(-1px);
}

.result-item h3 {
  margin: 0;
  font-size: 16px;
}

.result-item p,
.coord,
.distance {
  margin: 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.result-footer,
.coord,
.item-actions {
  display: flex;
  align-items: center;
}

.result-footer {
  justify-content: space-between;
  gap: 10px;
}

.coord {
  gap: 4px;
}

.item-actions {
  gap: 8px;
  justify-content: flex-end;
}

.drawer-title {
  margin: 0;
  font-size: 18px;
}

.drawer-subtitle {
  margin: 6px 0 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.detail-panel {
  display: grid;
  gap: 16px;
}

.detail-panel section {
  padding: 14px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.detail-panel h4 {
  margin: 0 0 10px;
  font-size: 15px;
}

.detail-panel dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.detail-panel dl div {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 12px;
}

.detail-panel dt {
  color: var(--itp-text-muted);
}

.detail-panel dd {
  margin: 0;
  color: var(--itp-text);
  overflow-wrap: anywhere;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
