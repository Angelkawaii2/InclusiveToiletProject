<script lang="ts" setup>
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import {Check, Delete, Download, Location, RefreshLeft} from "@element-plus/icons-vue";
import {ElMessage, ElNotification} from "element-plus";
import {
  ACCESS_RESTRICTION_OPTIONS,
  TOILET_KIND_OPTIONS,
  type AccessRestriction,
  type ToiletKind,
  type ToiletPlace
} from "@/domain/toilet/v6";
import {buildLocalExportBundle, createLocalExportFilename} from "@/domain/toilet/v6";
import {DATA_VERSION} from "@/constants/projectVersions";
import {reverseGeocode} from "@/domain/geo/reverseGeocode";
import {getLocationPermissionState} from "@/domain/geo/locationPermission";
import {getCurrentLocationCache, requestCurrentLocation} from "@/domain/geo/currentLocation";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import {downloadJsonFile} from "@/Utils/downloadJson";
import ToiletMap from "@/components/map/ToiletMap.vue";

const localCache = useLocalToiletCacheStore();
const isLocating = ref(false);
const captureMode = ref<"quick" | "full">("quick");
const hasCapturedLocation = ref(false);
const captureMap = ref<InstanceType<typeof ToiletMap> | null>(null);
const GPS_TIMEOUT_MS = 12_000;

const draft = reactive({
  name: "",
  isActive: true,
  lat: 31.2304,
  lon: 121.4737,
  accuracy: null as number | null,
  country: "中国",
  province: "上海市",
  city: "上海市",
  description: "",
  kinds: ["male", "female"] as ToiletKind[],
  restriction: "public" as AccessRestriction,
  accessNotes: "",
  parkingAllowed: null as boolean | null,
  hasAccessibleToilet: null as boolean | null,
  isSeparateStall: null as boolean | null,
  isLocked: null as boolean | null,
  unlockMethod: "",
  accessibilityNotes: "",
  isAlwaysOpen: null as boolean | null,
  openingText: "",
});

const previewRecord = computed(() => buildRecord({
  reviewed: captureMode.value === "full",
  source: captureMode.value === "quick" ? "local-quick-capture" : "local-create-form"
}));

async function refreshCaptureMap() {
  await nextTick();
  captureMap.value?.setPoints([{
    lat: Number(draft.lat),
    lon: Number(draft.lon),
    kinds: draft.kinds,
  }]);
  captureMap.value?.setUserLocation(hasCapturedLocation.value ? {
    lat: Number(draft.lat),
    lon: Number(draft.lon),
    accuracy: draft.accuracy,
  } : null);
  captureMap.value?.focusPoint(Number(draft.lon), Number(draft.lat));
}

function handleCaptureMapCoordinateChange(location: {lon: number; lat: number}) {
  draft.lat = location.lat;
  draft.lon = location.lon;
  hasCapturedLocation.value = true;
}

watch([() => draft.lat, () => draft.lon, () => draft.kinds, captureMode, hasCapturedLocation], () => {
  void refreshCaptureMap();
}, {deep: true, flush: "post"});

function applyCachedLocation() {
  const cachedLocation = getCurrentLocationCache();
  if (!cachedLocation) return false;
  draft.lat = cachedLocation.lat;
  draft.lon = cachedLocation.lon;
  draft.accuracy = cachedLocation.accuracy;
  draft.country = "";
  draft.province = "";
  draft.city = "";
  draft.description = "";
  hasCapturedLocation.value = true;
  return true;
}

onMounted(() => {
  applyCachedLocation();
  void refreshCaptureMap();
});

function resetDraft() {
  draft.name = "";
  draft.isActive = true;
  draft.lat = 31.2304;
  draft.lon = 121.4737;
  draft.accuracy = null;
  draft.country = "中国";
  draft.province = "上海市";
  draft.city = "上海市";
  draft.description = "";
  draft.kinds = ["male", "female"];
  draft.restriction = "public";
  draft.accessNotes = "";
  draft.parkingAllowed = null;
  draft.hasAccessibleToilet = null;
  draft.isSeparateStall = null;
  draft.isLocked = null;
  draft.unlockMethod = "";
  draft.accessibilityNotes = "";
  draft.isAlwaysOpen = null;
  draft.openingText = "";
  hasCapturedLocation.value = false;
  applyCachedLocation();
}

async function fillCurrentLocation() {
  if (isLocating.value) return;
  if (!navigator.geolocation) {
    ElMessage.error("当前浏览器不支持定位，请使用支持位置权限的浏览器");
    return;
  }
  const permissionState = await getLocationPermissionState();
  if (permissionState === "denied") {
    ElMessage.error("定位权限未开启，请在浏览器或系统设置中允许访问位置后重试");
    return;
  }
  if (permissionState === "prompt") ElMessage.info("请在浏览器授权弹窗中允许使用当前位置");
  isLocating.value = true;
  const location = await requestCurrentLocation({forceRefresh: true, timeout: GPS_TIMEOUT_MS});
  if (!location) {
    isLocating.value = false;
    ElMessage.warning("定位失败或超时，请确认已开启定位服务和浏览器位置权限后重试");
    return;
  }
  draft.lat = location.lat;
  draft.lon = location.lon;
  draft.accuracy = location.accuracy;
  hasCapturedLocation.value = true;
  if (captureMode.value === "quick") {
    draft.country = "";
    draft.province = "";
    draft.city = "";
    draft.description = "";
    isLocating.value = false;
    ElMessage.success("已填入当前位置，可在 Review 阶段反查地址");
    return;
  }
  try {
    const address = await reverseGeocode(draft.lat, draft.lon);
    if (address) {
      draft.country = address.country || draft.country;
      draft.province = address.province || draft.province;
      draft.city = address.city || draft.city;
      draft.description = address.description || draft.description;
      ElMessage.success("已填入当前位置和地址信息");
    } else {
      ElMessage.success("已填入当前位置，地址信息未识别");
    }
  } catch {
    ElMessage.success("已填入当前位置，地址反查失败");
  } finally {
    isLocating.value = false;
  }
}

function buildRecord(options: {reviewed?: boolean; source?: string} = {}): ToiletPlace {
  const now = Date.now();
  const id = `local-${now}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    version: DATA_VERSION,
    name: draft.name.trim() || "未命名卫生间",
    isActive: draft.isActive,
    location: {
      lat: Number(draft.lat),
      lon: Number(draft.lon),
      alt: null,
      accuracy: draft.accuracy,
      coordinateSystem: "wgs84"
    },
    address: {
      country: draft.country.trim() || undefined,
      province: draft.province.trim() || undefined,
      city: draft.city.trim() || undefined,
      description: draft.description.trim() || undefined,
    },
    kinds: [...draft.kinds],
    access: {
      restriction: draft.restriction,
      notes: draft.accessNotes.trim() || undefined,
    },
    facilities: {
      parkingAllowed: draft.parkingAllowed,
    },
    accessibility: {
      hasAccessibleToilet: draft.hasAccessibleToilet,
      isSeparateStall: draft.isSeparateStall,
      isLocked: draft.isLocked,
      unlockMethod: draft.unlockMethod.trim() || undefined,
      notes: draft.accessibilityNotes.trim() || undefined,
    },
    openingHours: {
      isAlwaysOpen: draft.isAlwaysOpen,
      text: draft.openingText.trim() || undefined,
    },
    media: [],
    observations: [],
    externalIds: {},
    audit: {
      createdAt: now,
      updatedAt: now,
      reviewed: options.reviewed ?? true,
      source: options.source || "local-create-form"
    }
  };
}

function downloadRecord() {
  const record = buildRecord();
  downloadJsonFile(record, `${record.id}.json`);
  resetDraft();
  ElMessage.success("记录已导出，表单已重置");
}

function saveRecordToBrowser() {
  if (captureMode.value === "quick" && !hasCapturedLocation.value) {
    ElNotification({
      title: "尚未保存",
      message: "请先获取当前位置，避免保存到错误的坐标",
      type: "warning",
      duration: 4500,
    });
    return;
  }
  const record = buildRecord({
    reviewed: captureMode.value === "full",
    source: captureMode.value === "quick" ? "local-quick-capture" : "local-create-form"
  });
  if (!localCache.addToilet(record)) {
    ElNotification({
      title: "保存失败",
      message: localCache.storageError || "无法保存到浏览器缓存，请检查浏览器存储空间后重试",
      type: "error",
      duration: 0,
    });
    return;
  }
  resetDraft();
  ElNotification({
    title: "保存成功",
    message: `已保存为${record.audit.reviewed ? "记录" : "待 Review 草稿"}，当前缓存 ${localCache.count} 条，可以继续采集`,
    type: "success",
    duration: 5000,
  });
}

function downloadCachedRecords() {
  if (localCache.count === 0) {
    ElMessage.warning("浏览器缓存中还没有记录");
    return;
  }
  downloadJsonFile(buildLocalExportBundle(localCache.toilets), createLocalExportFilename());
  ElMessage.success(`已聚合导出 ${localCache.count} 条缓存记录`);
}

function clearCachedRecords() {
  localCache.clear();
  ElMessage.success("已清空浏览器缓存记录");
}

</script>

<template>
  <section class="workspace-page">
    <el-segmented v-model="captureMode" class="capture-mode" :options="[
      {label: '快速采集', value: 'quick'},
      {label: '完整采集', value: 'full'}
    ]"/>

    <div v-if="captureMode === 'quick'" class="quick-capture">
      <div class="quick-heading">
        <div>
          <p class="workspace-eyebrow">10-15 秒采集</p>
          <h3>先留下可靠的位置和现场信息</h3>
        </div>
        <div class="mode-actions">
          <el-tag type="warning" effect="plain">保存后待 Review</el-tag>
          <el-button type="danger" plain @click="resetDraft">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <el-form label-position="top">
        <section class="quick-location" :class="{'is-ready': hasCapturedLocation}">
          <div>
            <strong>{{ hasCapturedLocation ? '位置已获取' : '第一步：获取当前位置' }}</strong>
            <p v-if="hasCapturedLocation">
              {{ draft.city || draft.province || draft.country || '地址识别中' }} ·
              {{ draft.lat.toFixed(6) }}, {{ draft.lon.toFixed(6) }}
            </p>
            <p v-else>定位成功后会自动填写国家、省份、城市和位置描述。</p>
          </div>
          <el-button type="primary" size="large" :loading="isLocating" @click="fillCurrentLocation">
            <el-icon><Location /></el-icon>
            {{ hasCapturedLocation ? '重新定位' : '使用当前位置' }}
          </el-button>
        </section>

        <section class="capture-map-panel">
          <div class="capture-map-heading">
            <div>
              <strong>位置预览</strong>
              <p>{{ hasCapturedLocation ? "拖动大头钉可微调采集坐标" : "获取当前位置后会将大头钉移到当前位置" }}</p>
            </div>
            <el-tag size="small" type="info" effect="plain">{{ draft.lat.toFixed(5) }}, {{ draft.lon.toFixed(5) }}</el-tag>
          </div>
          <div class="capture-map-canvas quick-map-canvas">
            <toilet-map
                ref="captureMap"
                basemap-style="mono"
                editable-marker
                :cluster-points="false"
                @coordinate-change="handleCaptureMapCoordinateChange"
            />
          </div>
        </section>

        <div class="quick-form-grid">
          <el-form-item label="名称或一句话描述">
            <el-input v-model="draft.name" size="large" placeholder="可不填，例如：商场一楼服务台旁"/>
          </el-form-item>
          <el-form-item label="卫生间类型">
            <el-checkbox-group v-model="draft.kinds" class="quick-kind-options">
              <el-checkbox-button v-for="item in TOILET_KIND_OPTIONS" :key="item.value" :label="item.value">
                {{ item.label }}
              </el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="无障碍卫生间">
            <el-radio-group v-model="draft.hasAccessibleToilet">
              <el-radio-button :label="null">未知</el-radio-button>
              <el-radio-button :label="true">有</el-radio-button>
              <el-radio-button :label="false">无</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="允许停车">
            <el-radio-group v-model="draft.parkingAllowed">
              <el-radio-button :label="null">未知</el-radio-button>
              <el-radio-button :label="true">允许</el-radio-button>
              <el-radio-button :label="false">不允许</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="进入限制">
            <el-select v-model="draft.restriction" size="large">
              <el-option v-for="item in ACCESS_RESTRICTION_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="24 小时开放">
            <el-radio-group v-model="draft.isAlwaysOpen">
              <el-radio-button :label="null">未知</el-radio-button>
              <el-radio-button :label="true">是</el-radio-button>
              <el-radio-button :label="false">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="quick-save-bar">
          <span>已缓存 {{ localCache.count }} 条，本条将进入待 Review 队列</span>
          <el-button type="success" size="large" :disabled="!hasCapturedLocation" @click="saveRecordToBrowser">
            <el-icon><Check /></el-icon>
            保存并继续采集
          </el-button>
        </div>
      </el-form>
    </div>

    <div v-else class="create-layout">
      <el-form class="create-form" label-position="top">
        <div class="full-form-toolbar">
          <strong>完整采集表单</strong>
          <el-button type="danger" plain @click="resetDraft">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
        <section class="form-section">
          <h3>基础信息</h3>
          <div class="form-grid">
            <el-form-item label="名称">
              <el-input v-model="draft.name" placeholder="例如：静安寺站无障碍卫生间"/>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="draft.isActive" active-text="启用" inactive-text="停用"/>
            </el-form-item>
            <el-form-item label="纬度">
              <el-input-number v-model="draft.lat" :precision="6" :step="0.0001" controls-position="right"/>
            </el-form-item>
            <el-form-item label="经度">
              <el-input-number v-model="draft.lon" :precision="6" :step="0.0001" controls-position="right"/>
            </el-form-item>
          </div>
          <el-button :loading="isLocating" @click="fillCurrentLocation">
            <el-icon><Location /></el-icon>
            使用当前位置
          </el-button>
          <p class="field-hint">会先填入经纬度，并尝试联网反查国家、省份、城市和行政区描述。</p>
          <section class="capture-map-panel full-map-panel">
            <div class="capture-map-heading">
              <div>
                <strong>位置预览</strong>
                <p>使用当前位置或拖动大头钉可直接调整表单坐标。</p>
              </div>
              <el-tag size="small" type="info" effect="plain">{{ draft.lat.toFixed(5) }}, {{ draft.lon.toFixed(5) }}</el-tag>
            </div>
            <div class="capture-map-canvas">
              <toilet-map
                  ref="captureMap"
                  basemap-style="mono"
                  editable-marker
                  :cluster-points="false"
                  @coordinate-change="handleCaptureMapCoordinateChange"
              />
            </div>
          </section>
        </section>

        <section class="form-section">
          <h3>地址与位置描述</h3>
          <div class="form-grid">
            <el-form-item label="国家">
              <el-input v-model="draft.country" placeholder="例如：中国"/>
            </el-form-item>
            <el-form-item label="省份">
              <el-input v-model="draft.province" placeholder="例如：上海市"/>
            </el-form-item>
            <el-form-item label="城市">
              <el-input v-model="draft.city" placeholder="例如：上海市"/>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="draft.description" placeholder="例如：静安寺站 B1 客服中心右侧"/>
            </el-form-item>
          </div>
        </section>

        <section class="form-section">
          <h3>类型与通行</h3>
          <el-form-item label="卫生间类型">
            <el-select v-model="draft.kinds" multiple clearable>
              <el-option v-for="item in TOILET_KIND_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="进入限制">
              <el-select v-model="draft.restriction">
                <el-option v-for="item in ACCESS_RESTRICTION_OPTIONS" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="24 小时开放">
              <el-select v-model="draft.isAlwaysOpen">
                <el-option label="未知" :value="null"/>
                <el-option label="是" :value="true"/>
                <el-option label="否" :value="false"/>
              </el-select>
            </el-form-item>
            <el-form-item label="允许停车">
              <el-select v-model="draft.parkingAllowed">
                <el-option label="未知" :value="null"/>
                <el-option label="允许" :value="true"/>
                <el-option label="不允许" :value="false"/>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="开放时间说明">
            <el-input v-model="draft.openingText" placeholder="例如：每日 08:00-22:00"/>
          </el-form-item>
          <el-form-item label="通行备注">
            <el-input v-model="draft.accessNotes" type="textarea" :rows="2"/>
          </el-form-item>
        </section>

        <section class="form-section">
          <h3>无障碍信息</h3>
          <div class="form-grid">
            <el-form-item label="是否有无障碍卫生间">
              <el-select v-model="draft.hasAccessibleToilet">
                <el-option label="未知" :value="null"/>
                <el-option label="有" :value="true"/>
                <el-option label="无" :value="false"/>
              </el-select>
            </el-form-item>
            <el-form-item label="是否单独隔间">
              <el-select v-model="draft.isSeparateStall">
                <el-option label="未知" :value="null"/>
                <el-option label="是" :value="true"/>
                <el-option label="否" :value="false"/>
              </el-select>
            </el-form-item>
            <el-form-item label="是否上锁">
              <el-select v-model="draft.isLocked">
                <el-option label="未知" :value="null"/>
                <el-option label="是" :value="true"/>
                <el-option label="否" :value="false"/>
              </el-select>
            </el-form-item>
            <el-form-item label="解锁方式">
              <el-input v-model="draft.unlockMethod" placeholder="例如：联系服务台"/>
            </el-form-item>
          </div>
          <el-form-item label="无障碍备注">
            <el-input v-model="draft.accessibilityNotes" type="textarea" :rows="2"/>
          </el-form-item>
        </section>

        <section class="form-section">
          <h3>输出</h3>
          <p class="field-hint">外出采集时建议先保存到浏览器缓存，回到电脑前再批量导出 JSON。缓存只保存在当前浏览器中。</p>
          <div class="form-actions">
            <el-button type="success" @click="saveRecordToBrowser">保存到浏览器缓存</el-button>
            <el-button type="primary" @click="downloadRecord">
              <el-icon><Download /></el-icon>
              导出 v6 JSON
            </el-button>
          </div>
          <div class="cache-actions">
            <span>缓存记录：{{ localCache.count }} 条</span>
            <el-button :disabled="localCache.count === 0" @click="downloadCachedRecords">
              <el-icon><Download /></el-icon>
              批量导出缓存
            </el-button>
            <el-button :disabled="localCache.count === 0" type="danger" @click="clearCachedRecords">
              <el-icon><Delete /></el-icon>
              清空缓存
            </el-button>
          </div>
        </section>
      </el-form>

      <aside class="preview-panel">
        <h3>v6 预览</h3>
        <dl>
          <div>
            <dt>名称</dt>
            <dd>{{ previewRecord.name }}</dd>
          </div>
          <div>
            <dt>坐标</dt>
            <dd>{{ previewRecord.location.lat.toFixed(6) }}, {{ previewRecord.location.lon.toFixed(6) }}</dd>
          </div>
          <div>
            <dt>类型</dt>
            <dd>{{ previewRecord.kinds.join(" / ") || "未标记" }}</dd>
          </div>
          <div>
            <dt>进入限制</dt>
            <dd>{{ previewRecord.access.restriction }}</dd>
          </div>
          <div>
            <dt>无障碍</dt>
            <dd>{{ previewRecord.accessibility.hasAccessibleToilet === null ? "未知" : previewRecord.accessibility.hasAccessibleToilet ? "有" : "无" }}</dd>
          </div>
        </dl>
        <pre>{{ JSON.stringify(previewRecord, null, 2) }}</pre>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.create-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  margin-top: 16px;
}

.capture-mode {
  margin-top: 16px;
}

.quick-capture {
  max-width: 920px;
  margin: 16px auto 0;
  padding: 20px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.quick-heading,
.quick-location,
.quick-save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.quick-heading {
  margin-bottom: 18px;
}

.mode-actions,
.full-form-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.full-form-toolbar {
  margin-bottom: 12px;
  padding: 10px 0;
}

.quick-heading h3 {
  margin: 4px 0 0;
  font-size: 20px;
}

.quick-location {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--itp-border-strong);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.quick-location.is-ready {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.quick-location p {
  margin: 5px 0 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.capture-map-panel {
  margin: 0 0 18px;
  padding: 14px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.capture-map-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.capture-map-heading p {
  margin: 4px 0 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.capture-map-canvas {
  height: 260px;
  overflow: hidden;
  border-radius: 8px;
}

.quick-map-canvas {
  height: 220px;
}

.capture-map-canvas :deep(.map-container) {
  min-height: 100%;
}

.quick-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.quick-kind-options {
  display: flex;
  flex-wrap: wrap;
}

.quick-save-bar {
  position: sticky;
  bottom: 0;
  margin: 6px -20px -20px;
  padding: 14px 20px;
  border-top: 1px solid var(--itp-border);
  background: var(--itp-surface);
  color: var(--itp-text-muted);
  font-size: 13px;
}

.create-form,
.preview-panel {
  min-width: 0;
}

.form-section,
.preview-panel {
  margin-bottom: 14px;
  padding: 18px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.form-section h3,
.preview-panel h3 {
  margin: 0 0 14px;
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.cache-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.field-hint {
  margin: 8px 0 0;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.preview-panel {
  position: sticky;
  top: 16px;
  align-self: start;
}

.preview-panel dl {
  display: grid;
  gap: 10px;
  margin: 0 0 14px;
}

.preview-panel dl div {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 10px;
}

.preview-panel dt {
  color: var(--itp-text-muted);
}

.preview-panel dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.preview-panel pre {
  max-height: 420px;
  margin: 0;
  padding: 12px;
  overflow: auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.08);
  color: var(--itp-text);
  font-size: 12px;
}

@media (max-width: 980px) {
  .create-layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .quick-capture {
    padding: 16px;
  }

  .quick-heading,
  .quick-location,
  .quick-save-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-form-grid {
    grid-template-columns: 1fr;
  }

  .quick-save-bar {
    margin: 6px -16px -16px;
    padding: 12px 16px;
  }

  .quick-save-bar .el-button {
    width: 100%;
  }

  .capture-map-panel {
    padding: 12px;
  }

  .capture-map-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .capture-map-canvas,
  .quick-map-canvas {
    height: 200px;
  }

  .mode-actions {
    align-items: flex-end;
  }
}
</style>
