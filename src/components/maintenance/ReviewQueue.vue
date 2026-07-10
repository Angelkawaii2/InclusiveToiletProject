<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {Check, Delete, Download, Edit, Position} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import type {ToiletPlace} from "@/domain/toilet/v6";
import {buildLocalExportBundle, createLocalExportFilename, TOILET_KIND_OPTIONS} from "@/domain/toilet/v6";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import {useToiletDatasetStore} from "@/stores/toiletDatasetStore";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {downloadJsonFile} from "@/Utils/downloadJson";

type QueueFilter = "pending" | "reviewed" | "conflict" | "all";
type QueueSort = "updated" | "nearest";

const localCache = useLocalToiletCacheStore();
const dataset = useToiletDatasetStore();
const workspace = useWorkspaceStore();
const queueFilter = ref<QueueFilter>("pending");
const queueSort = ref<QueueSort>("updated");
const selectedIds = ref<string[]>([]);
const currentLocation = ref<{lat: number; lon: number} | null>(null);
const isLocating = ref(false);

const allRecords = computed(() => {
  const records = new Map<string, ToiletPlace>();
  dataset.toilets.forEach((item) => records.set(item.id, item));
  localCache.toilets.forEach((item) => records.set(item.id, item));
  return [...records.values()].sort((a, b) => b.audit.updatedAt - a.audit.updatedAt);
});

const filteredRecords = computed(() => allRecords.value.filter((item) => {
  if (queueFilter.value === "pending") return !item.audit.reviewed;
  if (queueFilter.value === "reviewed") return item.audit.reviewed;
  if (queueFilter.value === "conflict") return localCache.hasConflict(item.id);
  return true;
}));

const visibleRecords = computed(() => {
  if (queueSort.value === "updated" || !currentLocation.value) return filteredRecords.value;
  return [...filteredRecords.value].sort((a, b) => distanceInMeters(currentLocation.value!, a) - distanceInMeters(currentLocation.value!, b));
});

const pendingCount = computed(() => allRecords.value.filter((item) => !item.audit.reviewed).length);
const selectedVisibleIds = computed(() => selectedIds.value.filter((id) => visibleRecords.value.some((item) => item.id === id)));
const allVisibleSelected = computed(() => visibleRecords.value.length > 0 && selectedVisibleIds.value.length === visibleRecords.value.length);
const selectedCachedRecords = computed(() => localCache.toilets.filter((item) => selectedIds.value.includes(item.id)));
const conflictCount = computed(() => localCache.conflictCount);
const kindLabels = new Map(TOILET_KIND_OPTIONS.map((item) => [item.value, item.label]));

function distanceInMeters(origin: {lat: number; lon: number}, record: ToiletPlace) {
  const radius = 6371000;
  const toRadians = (value: number) => value * Math.PI / 180;
  const dLat = toRadians(record.location.lat - origin.lat);
  const dLon = toRadians(record.location.lon - origin.lon);
  const originLat = toRadians(origin.lat);
  const recordLat = toRadians(record.location.lat);
  const value = Math.sin(dLat / 2) ** 2
      + Math.cos(originLat) * Math.cos(recordLat) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

function formatDistance(record: ToiletPlace) {
  if (!currentLocation.value) return "";
  const meters = distanceInMeters(currentLocation.value, record);
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function getCurrentLocation(): Promise<{lat: number; lon: number} | null> {
  if (!navigator.geolocation) {
    ElMessage.error("当前浏览器不支持定位，请使用支持位置权限的浏览器");
    return Promise.resolve(null);
  }
  ElMessage.info("请在浏览器授权弹窗中允许使用当前位置");
  isLocating.value = true;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const location = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lon: Number(position.coords.longitude.toFixed(6)),
      };
      currentLocation.value = location;
      isLocating.value = false;
      resolve(location);
    }, () => {
      isLocating.value = false;
      ElMessage.error("定位失败，请在浏览器设置中重新开启位置权限后重试");
      resolve(null);
    }, {
      timeout: 8000,
      enableHighAccuracy: true,
    });
  });
}

function navigateToRecord(record: ToiletPlace) {
  void getCurrentLocation().then((origin) => {
    if (!origin) return;
    const destination = `${record.location.lat},${record.location.lon}`;
    const label = encodeURIComponent(record.name || "卫生间");
    const geoUrl = `geo:${destination}?q=${destination}(${label})`;
    const fallbackUrl = `https://maps.apple.com/?saddr=${origin.lat},${origin.lon}&daddr=${destination}&dirflg=d&q=${label}`;
    const openedAt = Date.now();
    window.location.href = geoUrl;
    window.setTimeout(() => {
      if (document.hidden || Date.now() - openedAt > 1600) return;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }, 700);
  });
}

watch(queueSort, (sort) => {
  if (sort === "nearest" && !currentLocation.value) {
    void getCurrentLocation();
  }
});

function toggleAllVisible(value: boolean) {
  const visibleIds = new Set(visibleRecords.value.map((item) => item.id));
  const preservedIds = selectedIds.value.filter((id) => !visibleIds.has(id));
  selectedIds.value = value ? [...preservedIds, ...visibleIds] : preservedIds;
}

function updateReviewState(record: ToiletPlace, reviewed: boolean) {
  const baseUpdatedAt = localCache.getMetadata(record.id)?.baseUpdatedAt ?? record.audit.updatedAt;
  const updated: ToiletPlace = {
    ...record,
    audit: {
      ...record.audit,
      reviewed,
      updatedAt: Date.now(),
      updatedBy: "local-review-workflow"
    }
  };
  if (!localCache.saveEditedToilet(updated, baseUpdatedAt)) {
    ElMessage.error(localCache.storageError || "保存 Review 状态失败，刷新后无法保留修改");
    return false;
  }
  dataset.updateToilet(updated);
  return true;
}

function keepLocalConflict(record: ToiletPlace) {
  if (!localCache.keepLocalConflict(record.id)) {
    ElMessage.error(localCache.storageError || "保留本地修改失败");
    return;
  }
  ElMessage.success("已保留本地修改，并以当前数据源版本作为比较基线");
}

async function acceptSourceConflict(record: ToiletPlace) {
  const sourceRecord = localCache.getMetadata(record.id)?.conflict?.sourceRecord;
  if (!sourceRecord) return;
  await ElMessageBox.confirm("采用数据源会丢弃该记录的本地人工修改，且无法恢复。", "采用数据源更新", {
    confirmButtonText: "采用数据源",
    cancelButtonText: "取消",
    type: "warning",
  });
  const acceptedRecord = localCache.acceptSourceConflict(record.id);
  if (!acceptedRecord) {
    ElMessage.error(localCache.storageError || "采用数据源失败");
    return;
  }
  dataset.updateToilet(acceptedRecord);
  workspace.selectToilet(acceptedRecord);
  ElMessage.success("已采用数据源更新");
}

function markReviewed(record: ToiletPlace) {
  if (!updateReviewState(record, true)) return;
  selectedIds.value = selectedIds.value.filter((id) => id !== record.id);
  ElMessage.success("记录已通过人工 Review");
}

function markSelectedReviewed() {
  const selected = allRecords.value.filter((item) => selectedIds.value.includes(item.id) && !item.audit.reviewed);
  if (selected.length === 0) {
    ElMessage.warning("请先选择待 Review 记录");
    return;
  }
  const savedCount = selected.filter((item) => updateReviewState(item, true)).length;
  selectedIds.value = [];
  if (savedCount > 0) ElMessage.success(`已确认 ${savedCount} 条记录`);
}

function editRecord(record: ToiletPlace) {
  workspace.editToilet(record);
}

async function removeDraft(record: ToiletPlace) {
  if (!localCache.hasToilet(record.id)) return;
  await ElMessageBox.confirm("该草稿将从当前浏览器中删除，且无法恢复。", "删除缓存草稿", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  });
  localCache.removeToilet(record.id);
  selectedIds.value = selectedIds.value.filter((id) => id !== record.id);
  ElMessage.success("缓存草稿已删除");
}

function exportCachedRecords(records: ToiletPlace[]) {
  if (records.length === 0) {
    ElMessage.warning("没有可导出的缓存记录");
    return;
  }
  downloadJsonFile(buildLocalExportBundle(records), createLocalExportFilename());
  ElMessage.success(`已聚合导出 ${records.length} 条缓存记录`);
}
</script>

<template>
  <section class="review-workspace">
    <header class="review-header">
      <div>
        <p class="workspace-eyebrow">人工确认</p>
        <h3>待 Review 工作台</h3>
        <p>快速采集和外部导入的数据先在这里核对，再进入可发布数据。</p>
      </div>
      <div class="review-stats">
        <strong>{{ pendingCount }}</strong>
        <span>条待确认</span>
      </div>
    </header>

    <el-alert
        v-if="conflictCount > 0"
        class="conflict-alert"
        :title="`${conflictCount} 条本地人工修改与更新后的数据源发生冲突`"
        description="请在冲突筛选中选择保留本地修改，或采用数据源版本。"
        type="warning"
        show-icon
        :closable="false"
    />

    <div class="review-toolbar">
      <el-segmented v-model="queueFilter" :options="[
        {label: `待 Review (${pendingCount})`, value: 'pending'},
        {label: '已确认', value: 'reviewed'},
        {label: `冲突 (${conflictCount})`, value: 'conflict'},
        {label: '全部', value: 'all'}
      ]"/>
      <el-segmented v-model="queueSort" :options="[
        {label: '最后编辑时间', value: 'updated'},
        {label: '最近距离', value: 'nearest'}
      ]" :disabled="isLocating"/>
      <div class="review-bulk-actions">
        <el-checkbox :model-value="allVisibleSelected" @update:model-value="toggleAllVisible">
          全选当前列表
        </el-checkbox>
        <el-button type="success" :disabled="selectedVisibleIds.length === 0" @click="markSelectedReviewed">
          <el-icon><Check /></el-icon>
          批量确认（{{ selectedVisibleIds.length }}）
        </el-button>
        <el-button :disabled="selectedCachedRecords.length === 0" @click="exportCachedRecords(selectedCachedRecords)">
          <el-icon><Download /></el-icon>
          导出选中缓存（{{ selectedCachedRecords.length }}）
        </el-button>
        <el-button type="primary" :disabled="localCache.count === 0" @click="exportCachedRecords(localCache.toilets)">
          <el-icon><Download /></el-icon>
          导出全部缓存（{{ localCache.count }}）
        </el-button>
      </div>
    </div>

    <el-empty v-if="visibleRecords.length === 0" description="当前视图没有记录"/>
    <div v-else class="review-list">
      <article v-for="record in visibleRecords" :key="record.id" class="review-item">
        <el-checkbox-group v-model="selectedIds" class="review-select">
          <el-checkbox :label="record.id"><span class="sr-only">选择 {{ record.name }}</span></el-checkbox>
        </el-checkbox-group>
        <div class="review-content">
          <div class="review-title-row">
            <h4>{{ record.name }}</h4>
            <el-tag :type="record.audit.reviewed ? 'success' : 'warning'" effect="plain">
              {{ record.audit.reviewed ? "已确认" : "待 Review" }}
            </el-tag>
            <el-tag v-if="localCache.getMetadata(record.id)?.locallyEdited" type="info" effect="plain">本地人工修改</el-tag>
            <el-tag v-if="localCache.hasConflict(record.id)" type="danger" effect="plain">数据源更新冲突</el-tag>
            <el-tag v-if="localCache.hasToilet(record.id)" type="info" effect="plain">浏览器缓存</el-tag>
          </div>
          <p>{{ [record.address?.country, record.address?.province, record.address?.city, record.address?.description].filter(Boolean).join(" ") || "暂无地址描述" }}</p>
          <div class="review-tags">
            <el-tag v-for="kind in record.kinds" :key="kind" size="small">{{ kindLabels.get(kind) || kind }}</el-tag>
            <el-tag v-if="record.accessibility.hasAccessibleToilet" size="small" type="success">无障碍</el-tag>
            <el-tag v-if="record.facilities.parkingAllowed" size="small" type="info">允许停车</el-tag>
            <span v-if="currentLocation">{{ formatDistance(record) }}</span>
            <span>{{ record.location.lat.toFixed(5) }}, {{ record.location.lon.toFixed(5) }}</span>
          </div>
        </div>
        <div class="review-actions">
          <el-button v-if="localCache.hasConflict(record.id)" size="small" type="warning" @click="keepLocalConflict(record)">保留本地</el-button>
          <el-button v-if="localCache.hasConflict(record.id)" size="small" type="danger" @click="acceptSourceConflict(record)">采用数据源</el-button>
          <el-button circle type="success" title="导航到卫生间" :loading="isLocating" @click="navigateToRecord(record)"><el-icon><Position /></el-icon></el-button>
          <el-button circle title="编辑记录" @click="editRecord(record)"><el-icon><Edit /></el-icon></el-button>
          <el-button v-if="!record.audit.reviewed" circle type="success" title="确认通过" @click="markReviewed(record)"><el-icon><Check /></el-icon></el-button>
          <el-button v-if="localCache.hasToilet(record.id)" circle type="danger" title="删除缓存草稿" @click="removeDraft(record)"><el-icon><Delete /></el-icon></el-button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.review-workspace {
  padding: 20px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.review-header,
.review-toolbar,
.review-item,
.review-title-row,
.review-tags,
.review-actions,
.review-bulk-actions {
  display: flex;
  align-items: center;
}

.review-header,
.review-toolbar {
  justify-content: space-between;
  gap: 18px;
}

.conflict-alert {
  margin-top: 18px;
}

.review-header h3 {
  margin: 4px 0;
  font-size: 21px;
}

.review-header p {
  margin: 0;
  color: var(--itp-text-muted);
}

.review-stats {
  display: grid;
  min-width: 104px;
  text-align: right;
}

.review-stats strong {
  color: var(--el-color-warning);
  font-size: 30px;
}

.review-stats span,
.review-item p,
.review-tags span {
  color: var(--itp-text-muted);
  font-size: 13px;
}

.review-toolbar {
  margin: 20px 0 12px;
  padding-top: 16px;
  border-top: 1px solid var(--itp-border);
}

.review-bulk-actions,
.review-title-row,
.review-tags,
.review-actions {
  flex-wrap: wrap;
  gap: 8px;
}

.review-list {
  display: grid;
  gap: 10px;
  max-height: 580px;
  overflow: auto;
}

.review-item {
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.review-select {
  flex: 0 0 auto;
}

.review-content {
  flex: 1;
  min-width: 0;
}

.review-title-row h4 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 16px;
}

.review-item p {
  margin: 7px 0;
}

.review-actions {
  flex: 0 0 auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 760px) {
  .review-workspace {
    padding: 14px;
  }

  .review-header,
  .review-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .review-stats {
    text-align: left;
  }

  .review-bulk-actions {
    justify-content: space-between;
  }

  .review-item {
    align-items: flex-start;
  }

  .review-actions {
    flex-direction: column;
  }
}
</style>
