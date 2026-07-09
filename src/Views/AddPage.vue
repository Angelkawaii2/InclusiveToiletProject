<script lang="ts" setup>
import {computed, reactive, ref} from "vue";
import {Delete, Download, Location, RefreshLeft} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {
  ACCESS_RESTRICTION_OPTIONS,
  TOILET_KIND_OPTIONS,
  type AccessRestriction,
  type ToiletKind,
  type ToiletPlace
} from "@/domain/toilet/v6";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {DATA_VERSION} from "@/constants/projectVersions";
import {reverseGeocode} from "@/domain/geo/reverseGeocode";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";

defineProps<{
  embedded?: boolean
}>()

const workspace = useWorkspaceStore();
const localCache = useLocalToiletCacheStore();
const isLocating = ref(false);

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
  kinds: ["allGender"] as ToiletKind[],
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

const previewRecord = computed(() => buildRecord());

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
  draft.kinds = ["allGender"];
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
}

function fillCurrentLocation() {
  if (!navigator.geolocation) {
    ElMessage.error("当前浏览器不支持定位");
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    draft.lat = Number(position.coords.latitude.toFixed(6));
    draft.lon = Number(position.coords.longitude.toFixed(6));
    draft.accuracy = Math.round(position.coords.accuracy);
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
  }, () => {
    ElMessage.error("定位失败，请检查浏览器定位权限");
    isLocating.value = false;
  }, {
    timeout: 8000,
    enableHighAccuracy: true
  });
}

function buildRecord(): ToiletPlace {
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
      source: "local-create-form"
    }
  };
}

function downloadRecord() {
  const record = buildRecord();
  downloadJson(record, `${record.id}.json`);
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function saveRecordToBrowser() {
  const record = buildRecord();
  localCache.addToilet(record);
  ElMessage.success(`已保存到浏览器缓存，当前 ${localCache.count} 条`);
}

function downloadCachedRecords() {
  if (localCache.count === 0) {
    ElMessage.warning("浏览器缓存中还没有记录");
    return;
  }
  downloadJson(localCache.toilets, "toilet-local-cache-v6.json");
}

function clearCachedRecords() {
  localCache.clear();
  ElMessage.success("已清空浏览器缓存记录");
}

function useAsEditingRecord() {
  const record = buildRecord();
  workspace.editToilet(record);
  ElMessage.success("已创建草稿并切换到编辑模式");
}
</script>

<template>
  <section class="workspace-page">
    <div v-if="!embedded" class="workspace-hero create-hero">
      <div>
        <p class="workspace-eyebrow">新增采集</p>
        <h2>记录一个新的 v6 卫生间点位</h2>
        <p>按 v6 数据结构填写位置、类型、通行、无障碍和开放时间，可导出单条 JSON 或转入编辑模式继续调整。</p>
      </div>
      <div class="hero-actions">
        <el-button type="danger" @click="resetDraft">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="downloadRecord">
          <el-icon><Download /></el-icon>
          导出 v6 JSON
        </el-button>
      </div>
    </div>

    <div v-else class="embedded-toolbar">
      <div>
        <h3>新增点位</h3>
        <p>按 v6 数据结构创建一条卫生间记录。浏览器缓存中已有 {{ localCache.count }} 条。</p>
      </div>
      <div class="hero-actions">
        <el-button type="danger" @click="resetDraft">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="downloadRecord">
          <el-icon><Download /></el-icon>
          导出 v6 JSON
        </el-button>
      </div>
    </div>

    <div class="create-layout">
      <el-form class="create-form" label-position="top">
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
            <el-button @click="useAsEditingRecord">创建为编辑草稿</el-button>
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
.create-hero {
  border-color: rgba(198, 80, 80, 0.2);
  background: var(--itp-create-hero);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.embedded-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.embedded-toolbar h3 {
  margin: 0;
  font-size: 18px;
}

.embedded-toolbar p {
  margin: 6px 0 0;
  color: var(--itp-text-muted);
}

.create-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  margin-top: 16px;
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

  .embedded-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
