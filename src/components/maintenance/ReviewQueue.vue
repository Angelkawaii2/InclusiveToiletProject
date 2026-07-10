<script lang="ts" setup>
import {computed, ref} from "vue";
import {Check, Delete, Edit} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import type {ToiletPlace} from "@/domain/toilet/v6";
import {TOILET_KIND_OPTIONS} from "@/domain/toilet/v6";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import {useToiletDatasetStore} from "@/stores/toiletDatasetStore";
import {useWorkspaceStore} from "@/stores/workspaceStore";

type QueueFilter = "pending" | "reviewed" | "all";

const localCache = useLocalToiletCacheStore();
const dataset = useToiletDatasetStore();
const workspace = useWorkspaceStore();
const queueFilter = ref<QueueFilter>("pending");
const selectedIds = ref<string[]>([]);

const allRecords = computed(() => {
  const records = new Map<string, ToiletPlace>();
  dataset.toilets.forEach((item) => records.set(item.id, item));
  localCache.toilets.forEach((item) => records.set(item.id, item));
  return [...records.values()].sort((a, b) => b.audit.updatedAt - a.audit.updatedAt);
});

const visibleRecords = computed(() => allRecords.value.filter((item) => {
  if (queueFilter.value === "pending") return !item.audit.reviewed;
  if (queueFilter.value === "reviewed") return item.audit.reviewed;
  return true;
}));

const pendingCount = computed(() => allRecords.value.filter((item) => !item.audit.reviewed).length);
const selectedVisibleIds = computed(() => selectedIds.value.filter((id) => visibleRecords.value.some((item) => item.id === id)));
const allVisibleSelected = computed(() => visibleRecords.value.length > 0 && selectedVisibleIds.value.length === visibleRecords.value.length);
const kindLabels = new Map(TOILET_KIND_OPTIONS.map((item) => [item.value, item.label]));

function toggleAllVisible(value: boolean) {
  const visibleIds = new Set(visibleRecords.value.map((item) => item.id));
  const preservedIds = selectedIds.value.filter((id) => !visibleIds.has(id));
  selectedIds.value = value ? [...preservedIds, ...visibleIds] : preservedIds;
}

function updateReviewState(record: ToiletPlace, reviewed: boolean) {
  const updated: ToiletPlace = {
    ...record,
    audit: {
      ...record.audit,
      reviewed,
      updatedAt: Date.now(),
      updatedBy: "local-review-workflow"
    }
  };
  dataset.updateToilet(updated);
  localCache.updateToilet(updated);
}

function markReviewed(record: ToiletPlace) {
  updateReviewState(record, true);
  selectedIds.value = selectedIds.value.filter((id) => id !== record.id);
  ElMessage.success("记录已通过人工 Review");
}

function markSelectedReviewed() {
  const selected = allRecords.value.filter((item) => selectedIds.value.includes(item.id) && !item.audit.reviewed);
  if (selected.length === 0) {
    ElMessage.warning("请先选择待 Review 记录");
    return;
  }
  selected.forEach((item) => updateReviewState(item, true));
  selectedIds.value = [];
  ElMessage.success(`已确认 ${selected.length} 条记录`);
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

    <div class="review-toolbar">
      <el-segmented v-model="queueFilter" :options="[
        {label: `待 Review (${pendingCount})`, value: 'pending'},
        {label: '已确认', value: 'reviewed'},
        {label: '全部', value: 'all'}
      ]"/>
      <div class="review-bulk-actions">
        <el-checkbox :model-value="allVisibleSelected" @update:model-value="toggleAllVisible">
          全选当前列表
        </el-checkbox>
        <el-button type="success" :disabled="selectedVisibleIds.length === 0" @click="markSelectedReviewed">
          <el-icon><Check /></el-icon>
          批量确认（{{ selectedVisibleIds.length }}）
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
            <el-tag v-if="localCache.hasToilet(record.id)" type="info" effect="plain">浏览器缓存</el-tag>
          </div>
          <p>{{ [record.address?.country, record.address?.province, record.address?.city, record.address?.description].filter(Boolean).join(" ") || "暂无地址描述" }}</p>
          <div class="review-tags">
            <el-tag v-for="kind in record.kinds" :key="kind" size="small">{{ kindLabels.get(kind) || kind }}</el-tag>
            <el-tag v-if="record.accessibility.hasAccessibleToilet" size="small" type="success">无障碍</el-tag>
            <el-tag v-if="record.facilities.parkingAllowed" size="small" type="info">允许停车</el-tag>
            <span>{{ record.location.lat.toFixed(5) }}, {{ record.location.lon.toFixed(5) }}</span>
          </div>
        </div>
        <div class="review-actions">
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
