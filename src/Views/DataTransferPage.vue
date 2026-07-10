<script lang="ts" setup>
import {computed, ref} from "vue";
import {Download, UploadFilled} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {
  buildLocalExportBundle,
  createLocalExportFilename,
  normalizeImportedToilets,
  type ToiletPlace,
} from "@/domain/toilet/v6";
import {downloadJsonFile} from "@/Utils/downloadJson";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import {useToiletDatasetStore} from "@/stores/toiletDatasetStore";

type ExportScope = "all" | "selected";
type EditFilter = "all" | "edited" | "unedited";
type CreationFilter = "all" | "created" | "source";

interface ExportRow {
  record: ToiletPlace;
  locallyEdited: boolean;
  userCreated: boolean;
}

const dataset = useToiletDatasetStore();
const localCache = useLocalToiletCacheStore();
const exportScope = ref<ExportScope>("all");
const editFilter = ref<EditFilter>("all");
const creationFilter = ref<CreationFilter>("all");
const dateRange = ref<[Date, Date] | null>(null);
const selectedIds = ref<string[]>([]);
const importInput = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

const allRows = computed<ExportRow[]>(() => {
  const records = new Map<string, ToiletPlace>();
  dataset.toilets.forEach((record) => records.set(record.id, record));
  localCache.toilets.forEach((record) => records.set(record.id, record));

  return [...records.values()]
      .map((record) => {
        const metadata = localCache.getMetadata(record.id);
        const source = record.audit.source || "";
        return {
          record,
          locallyEdited: metadata?.locallyEdited === true,
          userCreated: record.id.startsWith("local-") || source.startsWith("local-"),
        };
      })
      .sort((a, b) => b.record.audit.updatedAt - a.record.audit.updatedAt);
});

const filteredRows = computed(() => allRows.value.filter((row) => {
  if (editFilter.value === "edited" && !row.locallyEdited) return false;
  if (editFilter.value === "unedited" && row.locallyEdited) return false;
  if (creationFilter.value === "created" && !row.userCreated) return false;
  if (creationFilter.value === "source" && row.userCreated) return false;
  if (!dateRange.value) return true;
  const [start, end] = dateRange.value;
  const timestamp = row.record.audit.updatedAt;
  const startAt = new Date(start).setHours(0, 0, 0, 0);
  const endAt = new Date(end).setHours(23, 59, 59, 999);
  return timestamp >= startAt && timestamp <= endAt;
}));

const selectedVisibleIds = computed(() => selectedIds.value.filter((id) => filteredRows.value.some((row) => row.record.id === id)));
const allVisibleSelected = computed(() => filteredRows.value.length > 0 && selectedVisibleIds.value.length === filteredRows.value.length);
const recordsToExport = computed(() => {
  if (exportScope.value === "all") return filteredRows.value.map((row) => row.record);
  const ids = new Set(selectedVisibleIds.value);
  return filteredRows.value.filter((row) => ids.has(row.record.id)).map((row) => row.record);
});

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function toggleAllVisible(value: boolean) {
  const visibleIds = new Set(filteredRows.value.map((row) => row.record.id));
  const preservedIds = selectedIds.value.filter((id) => !visibleIds.has(id));
  selectedIds.value = value ? [...preservedIds, ...visibleIds] : preservedIds;
}

function exportRecords() {
  if (recordsToExport.value.length === 0) {
    ElMessage.warning(exportScope.value === "selected" ? "请先选择要导出的记录" : "当前筛选条件下没有可导出的记录");
    return;
  }
  downloadJsonFile(buildLocalExportBundle(recordsToExport.value), createLocalExportFilename());
  ElMessage.success(`已聚合导出 ${recordsToExport.value.length} 条记录`);
}

async function importFiles(files: File[]) {
  if (files.length === 0) return;
  isImporting.value = true;
  let importedCount = 0;
  const errors: string[] = [];
  try {
    for (const file of files) {
      try {
        const imported = normalizeImportedToilets(JSON.parse(await file.text()));
        if (imported.toilets.length > 0) {
          dataset.appendToilets(imported.toilets, `本地导入 ${imported.toilets.length} 条`, imported.errors);
          importedCount += imported.toilets.length;
        }
        errors.push(...imported.errors.map((error) => `${file.name}：${error}`));
      } catch {
        errors.push(`${file.name}：无法读取 JSON 文件`);
      }
    }
    if (importedCount > 0) ElMessage.success(`已导入 ${importedCount} 条记录，可在首页查看`);
    if (errors.length > 0) ElMessage.warning(`导入完成，但有 ${errors.length} 条记录未通过校验`);
    if (importedCount === 0 && errors.length === 0) ElMessage.warning("文件中没有可导入的记录");
  } finally {
    isImporting.value = false;
    if (importInput.value) importInput.value.value = "";
  }
}

function handleImport(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || []);
  void importFiles(files);
}
</script>

<template>
  <section class="workspace-page transfer-page">
    <div class="workspace-hero transfer-hero">
      <div>
        <p class="workspace-eyebrow">数据导入导出</p>
        <h2>管理本地卫生间数据文件</h2>
        <p>导入普通 v6 JSON 或本项目导出的聚合包；导出前可按本地修改、创建来源和更新时间精确筛选。</p>
      </div>
    </div>

    <section class="transfer-section import-section">
      <div class="section-heading">
        <div>
          <h3>导入数据</h3>
          <p>导入后将叠加到当前会话的数据集中，并立即可在首页地图查看。</p>
        </div>
        <label class="import-button" :class="{disabled: isImporting}">
          <el-icon><UploadFilled /></el-icon>
          {{ isImporting ? "正在导入" : "选择 JSON 文件" }}
          <input ref="importInput" accept="application/json,.json" multiple type="file" :disabled="isImporting" @change="handleImport"/>
        </label>
      </div>
      <el-alert type="info" :closable="false" show-icon title="兼容项目导出的聚合包和单条、数组形式的 v6 JSON 记录。"/>
    </section>

    <section class="transfer-section export-section">
      <div class="section-heading">
        <div>
          <h3>导出数据</h3>
          <p>当前可筛选 {{ filteredRows.length }} 条记录，浏览器缓存中有 {{ localCache.count }} 条本地记录。</p>
        </div>
        <el-button type="primary" :disabled="recordsToExport.length === 0" @click="exportRecords">
          <el-icon><Download /></el-icon>
          导出{{ exportScope === "all" ? "筛选结果" : "已选记录" }}（{{ recordsToExport.length }}）
        </el-button>
      </div>

      <div class="export-filters">
        <el-segmented v-model="exportScope" :options="[
          {label: '全部筛选结果', value: 'all'},
          {label: '部分勾选记录', value: 'selected'}
        ]"/>
        <el-select v-model="editFilter" aria-label="编辑状态筛选">
          <el-option label="编辑状态：全部" value="all"/>
          <el-option label="仅用户编辑过" value="edited"/>
          <el-option label="仅未编辑" value="unedited"/>
        </el-select>
        <el-select v-model="creationFilter" aria-label="新增数据筛选">
          <el-option label="创建来源：全部" value="all"/>
          <el-option label="仅用户新增" value="created"/>
          <el-option label="仅预置或导入" value="source"/>
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="最后编辑起始日期" end-placeholder="最后编辑结束日期"/>
      </div>

      <div class="export-list-toolbar">
        <el-checkbox :model-value="allVisibleSelected" @update:model-value="toggleAllVisible">
          选择当前筛选结果（{{ filteredRows.length }}）
        </el-checkbox>
        <span>导出日期按最后编辑时间筛选</span>
      </div>

      <el-empty v-if="filteredRows.length === 0" description="当前筛选条件下没有记录"/>
      <div v-else class="export-record-list">
        <article v-for="row in filteredRows" :key="row.record.id" class="export-record">
          <el-checkbox-group v-model="selectedIds" class="record-select">
            <el-checkbox :label="row.record.id"><span class="sr-only">选择 {{ row.record.name }}</span></el-checkbox>
          </el-checkbox-group>
          <div class="record-content">
            <div class="record-title-row">
              <h4>{{ row.record.name }}</h4>
              <el-tag v-if="row.userCreated" type="success" effect="plain">用户新增</el-tag>
              <el-tag v-else type="info" effect="plain">预置或导入</el-tag>
              <el-tag v-if="row.locallyEdited" type="warning" effect="plain">用户编辑过</el-tag>
            </div>
            <p>{{ [row.record.address?.province, row.record.address?.city, row.record.address?.description].filter(Boolean).join(" ") || "暂无地址描述" }}</p>
            <span>最后编辑：{{ formatTime(row.record.audit.updatedAt) }}</span>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.transfer-hero {
  background: var(--itp-edit-hero);
}

.transfer-section {
  margin-top: 16px;
  padding: 20px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.section-heading,
.export-list-toolbar,
.record-title-row,
.export-record {
  display: flex;
  align-items: center;
}

.section-heading {
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.section-heading h3,
.record-title-row h4 {
  margin: 0;
}

.section-heading p,
.record-content p,
.record-content span,
.export-list-toolbar span {
  color: var(--itp-text-muted);
  font-size: 13px;
}

.section-heading p,
.record-content p {
  margin: 5px 0 0;
}

.import-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 7px 12px;
  border-radius: 6px;
  color: var(--el-color-primary);
  cursor: pointer;
}

.import-button:hover {
  background: var(--itp-surface-soft);
}

.import-button.disabled {
  cursor: wait;
  opacity: 0.7;
}

.import-button input {
  display: none;
}

.export-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid var(--itp-border);
}

.export-filters .el-select {
  width: 172px;
}

.export-list-toolbar {
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--itp-border);
}

.export-record-list {
  display: grid;
  gap: 8px;
  max-height: 480px;
  overflow: auto;
}

.export-record {
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.record-select {
  flex: 0 0 auto;
}

.record-content {
  min-width: 0;
}

.record-title-row {
  flex-wrap: wrap;
  gap: 7px;
}

.record-title-row h4 {
  overflow-wrap: anywhere;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 760px) {
  .transfer-section {
    padding: 14px;
  }

  .section-heading,
  .export-list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .export-filters .el-select,
  .export-filters :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
