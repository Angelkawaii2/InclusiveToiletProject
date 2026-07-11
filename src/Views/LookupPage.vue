<script lang="ts" setup>

import ToiletMap from "@/components/map/ToiletMap.vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {
  ACCESS_RESTRICTION_OPTIONS,
  normalizeImportedToilets,
  TOILET_KIND_OPTIONS,
  type AccessRestriction,
  type ToiletDatasetManifest,
  type ToiletKind,
  type ToiletPlace
} from "@/domain/toilet/v6";
import {Aim, Edit, Location, Plus, Position, Search, View, UploadFilled} from "@element-plus/icons-vue";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {useToiletDatasetStore} from "@/stores/toiletDatasetStore";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import {ElNotification} from "element-plus";
import {getLocationPermissionState} from "@/domain/geo/locationPermission";

const files = ref<File[]>([])
const workspace = useWorkspaceStore()
const dataset = useToiletDatasetStore()
const localCache = useLocalToiletCacheStore()

const keyword = ref("")
const isLoading = ref(false)
const loadError = ref("")
const selectedId = ref("")
const userLocation = ref<{ lat: number; lon: number } | null>(null)
const userLocationAccuracy = ref<number | null>(null)
const isLocating = ref(false)
const detailVisible = ref(false)
const detailToilet = ref<ToiletPlace | null>(null)
const selectedKinds = ref<ToiletKind[]>([])
const selectedRestrictions = ref<AccessRestriction[]>([])
const activeFilter = ref<"all" | "active" | "inactive">("active")
const basemapStyle = ref<"standard" | "mono" | "light" | "dark">("mono")
const accessibleFilter = ref<"all" | "yes" | "no" | "unknown">("all")
const separateStallFilter = ref<"all" | "yes" | "no" | "unknown">("all")
const lockedFilter = ref<"all" | "yes" | "no" | "unknown">("all")
const mobileFilterOpen = ref(false)

const mapComponent = ref<InstanceType<typeof ToiletMap> | null>(null)
const detailDrawerSize = computed(() => "420px");

function handleFiles(event: Event) {
  const selectFiles = (event.target as HTMLInputElement).files;
  if (!selectFiles) return;
  files.value = Array.from(selectFiles);
  readFiles(files.value)
}

function readFiles(fs: File[]) {
  fs.forEach((file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const jsonData = JSON.parse(fileContent as string);
        const imported = normalizeImportedToilets(jsonData);
        dataset.appendToilets(
            imported.toilets,
            `本地导入 ${imported.toilets.length} 条，当前共 ${dataset.toilets.length + imported.toilets.length} 条`,
            imported.errors
        );
        loadError.value = imported.errors.length > 0 ? imported.errors.join("；") : "";
        renderPoints();
      } catch (err) {
        loadError.value = "导入失败：JSON 格式不正确或不是支持的数据结构。";
      }
    };

    reader.onerror = () => {
      loadError.value = "读取文件失败，请重新选择 JSON 文件。";
    };

    reader.readAsText(file);

  })
}

async function loadStaticMockData() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const manifestResponse = await fetch("./data/manifest.json");
    const manifest = await manifestResponse.json() as ToiletDatasetManifest;
    const region = manifest.regions[0];
    const regionResponse = await fetch(`./data/${region.dataUrl.replace("./", "")}`);
    const toilets = await regionResponse.json() as ToiletPlace[];
    const mergedDataset = localCache.mergeWithDataset(toilets);
    dataset.replaceDataset(mergedDataset.toilets, `${region.name}：${mergedDataset.toilets.length} 条`);
    if (mergedDataset.newConflictCount > 0) {
      ElNotification({
        title: "发现数据更新冲突",
        message: `${mergedDataset.newConflictCount} 条本地人工修改与数据源更新不一致，请到数据维护的待 Review 页面处理。`,
        type: "warning",
        position: "top-right",
        duration: 5000,
      });
    }
    await nextTick();
    renderPoints();
  } catch (err) {
    loadError.value = "静态模拟数据加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function renderPoints() {
  const points = filteredBathrooms.value
      .filter((item) => Number.isFinite(item.location?.lon) && Number.isFinite(item.location?.lat))
      .map((item) => ({id: item.id, lon: item.location.lon, lat: item.location.lat, kinds: item.kinds}));
  mapComponent.value?.setPoints(points);
}

function getNearestMapPoints(location: { lat: number; lon: number }, limit = 5) {
  return [...filteredBathrooms.value]
      .filter((item) => Number.isFinite(item.location?.lon) && Number.isFinite(item.location?.lat))
      .sort((a, b) => distanceInMeters(location, a.location) - distanceInMeters(location, b.location))
      .slice(0, limit)
      .map((item) => ({lon: item.location.lon, lat: item.location.lat}));
}

async function focusAroundUserLocation() {
  if (!userLocation.value) return;
  await nextTick();
  mapComponent.value?.fitAroundLocation(
      {lat: userLocation.value.lat, lon: userLocation.value.lon},
      getNearestMapPoints(userLocation.value)
  );
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

async function updateCurrentLocation(showPermissionHint = true) {
  loadError.value = "";
  if (!navigator.geolocation) {
    loadError.value = "当前浏览器不支持定位，请使用支持位置权限的浏览器。";
    return;
  }
  const permissionState = await getLocationPermissionState();
  if (permissionState === "denied") {
    loadError.value = "定位权限未开启，请在浏览器或系统设置中允许访问位置后重试。";
    return;
  }
  if (showPermissionHint && permissionState === "prompt") {
    ElNotification.info({
      title: "需要位置权限",
      message: "请在浏览器授权弹窗中允许使用当前位置。",
      position: "top-right",
      duration: 2600,
    });
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition((position) => {
    userLocation.value = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };
    userLocationAccuracy.value = Math.round(position.coords.accuracy);
    mapComponent.value?.setUserLocation({
      lat: userLocation.value.lat,
      lon: userLocation.value.lon,
      accuracy: userLocationAccuracy.value,
    });
    void focusAroundUserLocation();
    isLocating.value = false;
  }, () => {
    loadError.value = "定位失败，请在浏览器设置中重新开启位置权限后重试。";
    isLocating.value = false;
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

function selectMapPoint(id: string) {
  const item = dataset.toilets.find((record) => record.id === id);
  if (item) selectToilet(item);
}

function openDataEntry() {
  workspace.openMaintenance("create");
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

function navigateToToilet(item: ToiletPlace) {
  selectToilet(item);
  const lat = item.location.lat;
  const lon = item.location.lon;
  const label = encodeURIComponent(item.name || "卫生间");
  const geoUrl = `geo:${lat},${lon}?q=${lat},${lon}(${label})`;
  const fallbackUrl = `https://maps.apple.com/?daddr=${lat},${lon}&q=${label}`;
  const openedAt = Date.now();
  window.location.href = geoUrl;
  window.setTimeout(() => {
    if (document.hidden || Date.now() - openedAt > 1600) return;
    window.open(fallbackUrl, "_blank", "noopener,noreferrer");
  }, 700);
}

function formatBoolean(value: boolean | null | undefined, yes = "是", no = "否") {
  if (value === null || value === undefined) return "未知";
  return value ? yes : no;
}

function getKindLabel(kind: ToiletKind) {
  return TOILET_KIND_OPTIONS.find((item) => item.value === kind)?.label || kind;
}

function getKindTagType(kind: ToiletKind) {
  if (kind === "male") return "primary";
  if (kind === "female") return "danger";
  if (kind === "accessible") return "success";
  if (kind === "family") return "warning";
  if (kind === "allGender") return "success";
  return "info";
}

function getRestrictionLabel(restriction: AccessRestriction) {
  return ACCESS_RESTRICTION_OPTIONS.find((item) => item.value === restriction)?.label || restriction;
}

function getBooleanTagType(value: boolean | null | undefined, positiveType = "success") {
  if (value === null || value === undefined) return "info";
  return value ? positiveType : "warning";
}

function formatAddress(item: ToiletPlace | null) {
  if (!item?.address) return "地址未知";
  return [
    item.address.country,
    item.address.province,
    item.address.city,
    item.address.description
  ].filter(Boolean).join(" ") || "地址未知";
}

function matchesTriState(value: boolean | null | undefined, filter: "all" | "yes" | "no" | "unknown") {
  if (filter === "all") return true;
  if (filter === "unknown") return value === null || value === undefined;
  return filter === "yes" ? value === true : value === false;
}

function resetFilters() {
  keyword.value = "";
  selectedKinds.value = [];
  selectedRestrictions.value = [];
  activeFilter.value = "active";
  accessibleFilter.value = "all";
  separateStallFilter.value = "all";
  lockedFilter.value = "all";
}

const filteredBathrooms = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  const filtered = dataset.toilets.filter((item) => {
    const matchesKeyword = !q || [
      item.name,
      item.address?.country,
      item.address?.province,
      item.address?.city,
      item.address?.description,
      item.location?.lat?.toString(),
      item.location?.lon?.toString(),
      item.access.restriction,
      ...(item.kinds || [])
    ].some((value) => value?.toLowerCase().includes(q))
    const matchesKind = selectedKinds.value.length === 0 || selectedKinds.value.some((kind) => item.kinds.includes(kind));
    const matchesRestriction = selectedRestrictions.value.length === 0 || selectedRestrictions.value.includes(item.access.restriction);
    const matchesActive = activeFilter.value === "all" || (activeFilter.value === "active" ? item.isActive : !item.isActive);
    return matchesKeyword
        && matchesKind
        && matchesRestriction
        && matchesActive
        && matchesTriState(item.accessibility.hasAccessibleToilet, accessibleFilter.value)
        && matchesTriState(item.accessibility.isSeparateStall, separateStallFilter.value)
        && matchesTriState(item.accessibility.isLocked, lockedFilter.value);
  })
  if (!userLocation.value) return filtered;
  return [...filtered].sort((a, b) => {
    return distanceInMeters(userLocation.value!, a.location) - distanceInMeters(userLocation.value!, b.location);
  });
})

watch(filteredBathrooms, () => {
  renderPoints();
}, {flush: "post"});

watch([
  selectedKinds,
  selectedRestrictions,
  activeFilter,
  accessibleFilter,
  separateStallFilter,
  lockedFilter,
], () => {
  ElNotification.closeAll();
  ElNotification({
    title: "筛选已生效",
    message: `当前显示 ${filteredBathrooms.value.length} 条记录`,
    type: "success",
    position: "top-right",
    duration: 1600,
  });
}, {deep: true, flush: "post"});

watch([userLocation, userLocationAccuracy], ([location, accuracy]) => {
  mapComponent.value?.setUserLocation(location ? {lat: location.lat, lon: location.lon, accuracy} : null);
}, {flush: "post"});

onMounted(() => {
  loadStaticMockData();
  updateCurrentLocation(true);
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
      <div class="hero-actions">
        <label class="import-button">
          <el-icon><UploadFilled /></el-icon>
          导入 JSON
          <input ref="fileInput" accept=".json" multiple type="file" @change="handleFiles"/>
        </label>
      </div>
    </div>

    <div class="search-layout">
      <div class="map-column">
        <toilet-map
            ref="mapComponent"
            :basemap-style="basemapStyle"
            :selected-point-id="selectedId"
            @point-click="selectMapPoint"
        />
      </div>

      <aside class="result-column">
        <div class="result-toolbar">
          <el-input v-model="keyword" clearable placeholder="搜索名称、类型或坐标">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="toolbar-actions">
            <el-button :loading="isLocating" @click="updateCurrentLocation">
              <el-icon><Location /></el-icon>
              获取当前位置
            </el-button>
            <el-button @click="resetFilters">
              清空条件
            </el-button>
            <el-button class="desktop-capture-button" type="primary" @click="openDataEntry">
              <el-icon><Plus /></el-icon>
              录入数据
            </el-button>
          </div>
          <div class="filter-panel desktop-filter-panel">
            <el-form label-position="top">
              <div class="filter-grid">
                <el-form-item label="卫生间类型">
                  <el-select v-model="selectedKinds" clearable collapse-tags collapse-tags-tooltip multiple placeholder="全部类型">
                    <el-option v-for="item in TOILET_KIND_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="进入限制">
                  <el-select v-model="selectedRestrictions" clearable collapse-tags collapse-tags-tooltip multiple placeholder="全部限制">
                    <el-option v-for="item in ACCESS_RESTRICTION_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="是否启用">
                  <el-select v-model="activeFilter">
                    <el-option label="全部" value="all"/>
                    <el-option label="启用" value="active"/>
                    <el-option label="停用" value="inactive"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="无障碍卫生间">
                  <el-select v-model="accessibleFilter">
                    <el-option label="全部" value="all"/>
                    <el-option label="有" value="yes"/>
                    <el-option label="无" value="no"/>
                    <el-option label="未知" value="unknown"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="单独隔间">
                  <el-select v-model="separateStallFilter">
                    <el-option label="全部" value="all"/>
                    <el-option label="是" value="yes"/>
                    <el-option label="否" value="no"/>
                    <el-option label="未知" value="unknown"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="是否上锁">
                  <el-select v-model="lockedFilter">
                    <el-option label="全部" value="all"/>
                    <el-option label="是" value="yes"/>
                    <el-option label="否" value="no"/>
                    <el-option label="未知" value="unknown"/>
                  </el-select>
                </el-form-item>
              </div>
            </el-form>
          </div>
          <div class="result-meta">
            <span>{{ dataset.dataSourceName }}</span>
            <span>{{ filteredBathrooms.length }} / {{ dataset.toilets.length }} 条</span>
          </div>
          <div class="basemap-switcher">
            <span>底图</span>
            <el-segmented v-model="basemapStyle" :options="[
              {label: '标准', value: 'standard'},
              {label: '单色', value: 'mono'},
              {label: '浅色', value: 'light'},
              {label: '深色', value: 'dark'}
            ]"/>
          </div>
          <div v-if="userLocation" class="location-meta">
            当前位置：{{ userLocation.lat.toFixed(5) }}, {{ userLocation.lon.toFixed(5) }}
            <span v-if="userLocationAccuracy">精度约 {{ userLocationAccuracy }} m</span>
          </div>
          <div class="map-legend">
            <span><i class="legend-dot male"></i>男厕</span>
            <span><i class="legend-dot female"></i>女厕</span>
            <span><i class="legend-dot neutral"></i>中立/无性别</span>
            <span><i class="legend-dot mixed"></i>混合/其他</span>
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
              <div class="tag-row">
                <el-tag v-for="kind in item.kinds" :key="kind" :type="getKindTagType(kind)" size="small">
                  {{ getKindLabel(kind) }}
                </el-tag>
                <el-tag v-if="item.accessibility.hasAccessibleToilet" size="small" type="success">无障碍</el-tag>
                <el-tag v-if="item.facilities.parkingAllowed" size="small" type="info">可停车</el-tag>
                <el-tag v-if="item.audit.reviewed" size="small" type="success" effect="plain">已人工核验</el-tag>
              </div>
            </div>
            <p class="address">{{ formatAddress(item) }}</p>
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
              <el-button size="small" type="success" @click.stop="navigateToToilet(item)">
                <el-icon><Position /></el-icon>
                前往
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

    <button class="mobile-filter-button" type="button" @click="mobileFilterOpen = true">
      <el-icon><Search /></el-icon>
      筛选
    </button>
    <button class="mobile-capture-button" type="button" @click="openDataEntry">
      <el-icon><Plus /></el-icon>
      录入
    </button>

    <Transition name="mobile-filter">
      <div v-if="mobileFilterOpen" class="mobile-filter-overlay" @click.self="mobileFilterOpen = false">
        <div class="mobile-filter-sheet">
          <div class="mobile-filter-header">
            <div>
              <h3>筛选条件</h3>
              <p>{{ filteredBathrooms.length }} / {{ dataset.toilets.length }} 条</p>
            </div>
            <el-button text @click="mobileFilterOpen = false">完成</el-button>
          </div>
          <el-form label-position="top">
            <div class="filter-grid mobile-filter-grid">
              <el-form-item label="卫生间类型">
                <el-select v-model="selectedKinds" clearable collapse-tags collapse-tags-tooltip multiple placeholder="全部类型">
                  <el-option v-for="item in TOILET_KIND_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="进入限制">
                <el-select v-model="selectedRestrictions" clearable collapse-tags collapse-tags-tooltip multiple placeholder="全部限制">
                  <el-option v-for="item in ACCESS_RESTRICTION_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="是否启用">
                <el-select v-model="activeFilter">
                  <el-option label="全部" value="all"/>
                  <el-option label="启用" value="active"/>
                  <el-option label="停用" value="inactive"/>
                </el-select>
              </el-form-item>
              <el-form-item label="无障碍卫生间">
                <el-select v-model="accessibleFilter">
                  <el-option label="全部" value="all"/>
                  <el-option label="有" value="yes"/>
                  <el-option label="无" value="no"/>
                  <el-option label="未知" value="unknown"/>
                </el-select>
              </el-form-item>
              <el-form-item label="单独隔间">
                <el-select v-model="separateStallFilter">
                  <el-option label="全部" value="all"/>
                  <el-option label="是" value="yes"/>
                  <el-option label="否" value="no"/>
                  <el-option label="未知" value="unknown"/>
                </el-select>
              </el-form-item>
              <el-form-item label="是否上锁">
                <el-select v-model="lockedFilter">
                  <el-option label="全部" value="all"/>
                  <el-option label="是" value="yes"/>
                  <el-option label="否" value="no"/>
                  <el-option label="未知" value="unknown"/>
                </el-select>
              </el-form-item>
            </div>
          </el-form>
          <div class="mobile-filter-actions">
            <el-button @click="resetFilters">清空条件</el-button>
            <el-button type="primary" @click="mobileFilterOpen = false">应用</el-button>
          </div>
        </div>
      </div>
    </Transition>

    <el-drawer v-model="detailVisible" class="detail-drawer" :size="detailDrawerSize" direction="rtl">
      <template #header>
        <div>
          <h3 class="drawer-title">{{ detailToilet?.name || "卫生间详情" }}</h3>
          <p class="drawer-subtitle">{{ formatAddress(detailToilet) }}</p>
        </div>
      </template>

      <div v-if="detailToilet" class="detail-panel">
        <section class="detail-summary">
          <div class="tag-row detail-tags">
            <el-tag v-for="kind in detailToilet.kinds" :key="kind" :type="getKindTagType(kind)">
              {{ getKindLabel(kind) }}
            </el-tag>
            <el-tag :type="detailToilet.isActive ? 'success' : 'danger'">
              {{ detailToilet.isActive ? "启用" : "停用" }}
            </el-tag>
            <el-tag :type="getBooleanTagType(detailToilet.accessibility.hasAccessibleToilet)">
              无障碍：{{ formatBoolean(detailToilet.accessibility.hasAccessibleToilet, "有", "无") }}
            </el-tag>
            <el-tag :type="getBooleanTagType(detailToilet.facilities.parkingAllowed, 'info')">
              停车：{{ formatBoolean(detailToilet.facilities.parkingAllowed, "允许", "不允许") }}
            </el-tag>
            <el-tag :type="detailToilet.audit.reviewed ? 'success' : 'warning'">
              {{ detailToilet.audit.reviewed ? "已 Review" : "未 Review" }}
            </el-tag>
          </div>
        </section>

        <section>
          <h4>位置</h4>
          <dl>
            <div>
              <dt>坐标</dt>
              <dd>{{ detailToilet.location.lat.toFixed(6) }}, {{ detailToilet.location.lon.toFixed(6) }}</dd>
            </div>
            <div>
              <dt>国家</dt>
              <dd>{{ detailToilet.address?.country || "未知" }}</dd>
            </div>
            <div>
              <dt>省份</dt>
              <dd>{{ detailToilet.address?.province || "未知" }}</dd>
            </div>
            <div>
              <dt>城市</dt>
              <dd>{{ detailToilet.address?.city || "未知" }}</dd>
            </div>
            <div>
              <dt>描述</dt>
              <dd>{{ detailToilet.address?.description || "暂无" }}</dd>
            </div>
            <div>
              <dt>定位精度</dt>
              <dd>{{ detailToilet.location.accuracy ? `${detailToilet.location.accuracy} m` : "未知" }}</dd>
            </div>
            <div>
              <dt>离当前位置</dt>
              <dd>{{ userLocation ? formatDistance(detailToilet) : "未获取当前位置" }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>类型与通行</h4>
          <dl>
            <div>
              <dt>类型</dt>
              <dd>
                <div class="tag-row">
                  <el-tag v-for="kind in detailToilet.kinds" :key="kind" :type="getKindTagType(kind)" size="small">
                    {{ getKindLabel(kind) }}
                  </el-tag>
                </div>
              </dd>
            </div>
            <div>
              <dt>进入限制</dt>
              <dd><el-tag type="info">{{ getRestrictionLabel(detailToilet.access.restriction) }}</el-tag></dd>
            </div>
            <div>
              <dt>允许停车</dt>
              <dd>
                <el-tag :type="getBooleanTagType(detailToilet.facilities.parkingAllowed, 'info')">
                  {{ formatBoolean(detailToilet.facilities.parkingAllowed, "允许", "不允许") }}
                </el-tag>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>无障碍信息</h4>
          <dl>
            <div>
              <dt>无障碍卫生间</dt>
              <dd>
                <el-tag :type="getBooleanTagType(detailToilet.accessibility.hasAccessibleToilet)">
                  {{ formatBoolean(detailToilet.accessibility.hasAccessibleToilet, "有", "无") }}
                </el-tag>
              </dd>
            </div>
            <div>
              <dt>单独隔间</dt>
              <dd>
                <el-tag :type="getBooleanTagType(detailToilet.accessibility.isSeparateStall)">
                  {{ formatBoolean(detailToilet.accessibility.isSeparateStall) }}
                </el-tag>
              </dd>
            </div>
            <div>
              <dt>是否上锁</dt>
              <dd>
                <el-tag :type="getBooleanTagType(detailToilet.accessibility.isLocked, 'warning')">
                  {{ formatBoolean(detailToilet.accessibility.isLocked) }}
                </el-tag>
              </dd>
            </div>
            <div>
              <dt>备注</dt>
              <dd>{{ detailToilet.accessibility.notes || "暂无" }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>开放与维护</h4>
          <dl>
            <div>
              <dt>开放时间</dt>
              <dd>{{ detailToilet.openingHours?.text || "未知" }}</dd>
            </div>
            <div>
              <dt>最近更新</dt>
              <dd>{{ new Date(detailToilet.audit.updatedAt).toLocaleString() }}</dd>
            </div>
            <div>
              <dt>人工 Review</dt>
              <dd>
                <el-tag :type="detailToilet.audit.reviewed ? 'success' : 'warning'">
                  {{ detailToilet.audit.reviewed ? "已确认" : "未确认" }}
                </el-tag>
              </dd>
            </div>
          </dl>
        </section>

        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="success" @click="navigateToToilet(detailToilet)">
            <el-icon><Position /></el-icon>
            前往
          </el-button>
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

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
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
  grid-template-columns: minmax(0, 1.55fr) minmax(340px, 0.9fr);
  gap: 12px;
  height: clamp(390px, calc(100vh - 250px), 540px);
  margin-top: 12px;
}

.map-column,
.result-column {
  min-width: 0;
  min-height: 0;
}

.map-column {
  height: 100%;
}

.result-column {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  overflow: hidden;
  padding: 12px;
  border: 1px solid rgba(111, 139, 153, 0.2);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.result-toolbar {
  display: grid;
  gap: 8px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-panel {
  padding: 8px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.filter-panel :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-panel :deep(.el-form-item__label) {
  height: auto;
  padding-bottom: 3px;
  line-height: 1.2;
  font-size: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.mobile-filter-button,
.mobile-capture-button,
.mobile-filter-overlay {
  display: none;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.location-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.basemap-switcher {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--itp-text-muted);
  font-size: 12px;
}

.map-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.14);
}

.legend-dot.male {
  background: #2f80ed;
}

.legend-dot.female {
  background: #f26ba7;
}

.legend-dot.neutral {
  background: #29a36a;
}

.legend-dot.mixed {
  background: #8b6bdc;
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
  height: 100%;
  gap: 10px;
  margin-top: 14px;
  min-height: 0;
  max-height: none;
  overflow: auto;
}

.map-column :deep(.map-container) {
  min-height: 0;
  height: 100%;
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

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.result-item p,
.coord,
.distance {
  margin: 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.distance {
  color: var(--itp-primary);
  font-weight: 700;
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

.detail-summary {
  border-color: rgba(51, 110, 190, 0.22) !important;
  background: color-mix(in srgb, var(--itp-primary) 8%, var(--itp-surface-soft)) !important;
}

.detail-tags {
  gap: 8px;
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
    height: auto;
    grid-template-columns: 1fr;
  }

  .map-column :deep(.map-container) {
    height: 460px;
  }

  .result-column {
    display: block;
  }

  .result-list {
    max-height: 520px;
  }
}

@media (max-width: 640px) {
  .search-hero {
    display: none;
  }

  .search-layout {
    gap: 8px;
    margin-top: 0;
  }

  .map-column {
    position: sticky;
    top: 0;
    z-index: 3;
    margin: -10px -10px 0;
    border-bottom: 1px solid var(--itp-border);
    background: var(--itp-surface);
  }

  .map-column :deep(.map-container) {
    min-height: 220px;
    height: 34vh;
    max-height: 280px;
  }

  .result-column {
    padding: 10px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .result-toolbar {
    gap: 8px;
  }

  .toolbar-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  .toolbar-actions :deep(.el-button:nth-child(n + 3)) {
    display: none;
  }

  .desktop-filter-panel,
  .result-meta,
  .basemap-switcher,
  .location-meta,
  .map-legend {
    display: none;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .mobile-filter-button {
    position: fixed;
    right: 16px;
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: 30;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: var(--itp-primary);
    color: #fff;
    box-shadow: 0 12px 28px rgba(51, 110, 190, 0.28);
    font: inherit;
  }

  .mobile-capture-button {
    position: fixed;
    right: 16px;
    bottom: max(72px, calc(env(safe-area-inset-bottom) + 56px));
    z-index: 30;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: var(--el-color-success);
    color: #fff;
    box-shadow: 0 12px 28px rgba(35, 145, 98, 0.28);
    font: inherit;
  }

  .mobile-filter-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    padding: 10px;
    background: rgba(15, 23, 42, 0.68);
    backdrop-filter: blur(2px);
  }

  .mobile-filter-sheet {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 16px;
    border: 1px solid var(--itp-border);
    border-radius: 8px;
    background: var(--itp-surface);
    box-shadow: 0 24px 72px rgba(15, 23, 42, 0.34);
    transform-origin: bottom center;
  }

  .mobile-filter-enter-active,
  .mobile-filter-leave-active {
    transition: opacity 0.22s ease;
  }

  .mobile-filter-enter-active .mobile-filter-sheet,
  .mobile-filter-leave-active .mobile-filter-sheet {
    transition: transform 0.24s ease, opacity 0.22s ease;
  }

  .mobile-filter-enter-from,
  .mobile-filter-leave-to {
    opacity: 0;
  }

  .mobile-filter-enter-from .mobile-filter-sheet,
  .mobile-filter-leave-to .mobile-filter-sheet {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }

  .mobile-filter-header,
  .mobile-filter-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-filter-header {
    margin-bottom: 12px;
  }

  .mobile-filter-header h3,
  .mobile-filter-header p {
    margin: 0;
  }

  .mobile-filter-header h3 {
    font-size: 17px;
  }

  .mobile-filter-header p {
    margin-top: 3px;
    color: var(--itp-text-muted);
    font-size: 12px;
  }

  .mobile-filter-grid {
    gap: 10px;
  }

  .mobile-filter-grid :deep(.el-form-item) {
    margin-bottom: 0;
  }

  .mobile-filter-actions {
    position: sticky;
    bottom: -16px;
    margin: 16px -16px -16px;
    padding: 12px 16px max(12px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--itp-border);
    background: var(--itp-surface);
  }

  .result-list {
    gap: 8px;
    max-height: max(260px, calc(100dvh - 430px));
    margin-top: 10px;
    padding-bottom: 74px;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .empty-result {
    margin-top: 10px;
  }

  .result-item {
    gap: 6px;
    padding: 10px;
  }

  .result-item h3 {
    font-size: 15px;
  }

  .result-item > div:first-child p,
  .address,
  .coord {
    display: none;
  }

  .result-footer,
  .item-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .result-footer {
    gap: 0;
  }

  .item-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .item-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
    padding: 0 8px;
  }

  .drawer-actions {
    flex-direction: column;
  }

  .drawer-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  .detail-drawer :deep(.el-drawer) {
    width: 100% !important;
    max-width: 100%;
  }

  .detail-drawer :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 14px 14px 10px;
  }

  .detail-drawer :deep(.el-drawer__body) {
    max-height: calc(100dvh - 76px);
    padding: 12px;
    overflow: auto;
  }

  .drawer-title {
    font-size: 17px;
  }

  .drawer-subtitle {
    display: none;
  }

  .detail-panel {
    gap: 10px;
  }

  .detail-panel section {
    padding: 12px;
  }

  .detail-panel dl div {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 8px;
  }
}

</style>
