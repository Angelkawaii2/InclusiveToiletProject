<script lang="ts" setup>
import {computed, nextTick, reactive, ref, watch} from "vue";
import {Check, Edit, Location, UploadFilled} from "@element-plus/icons-vue";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {ElMessage} from "element-plus";
import {
  ACCESS_RESTRICTION_OPTIONS,
  TOILET_KIND_OPTIONS,
  type AccessRestriction,
  type ToiletKind
} from "@/domain/toilet/v6";
import {useToiletDatasetStore} from "@/stores/toiletDatasetStore";
import {useLocalToiletCacheStore} from "@/stores/localToiletCacheStore";
import ToiletMap from "@/components/map/ToiletMap.vue";
import {useSettingStore} from "@/stores/settingsStore";

defineProps<{
  embedded?: boolean
}>()

const workspace = useWorkspaceStore();
const dataset = useToiletDatasetStore();
const localCache = useLocalToiletCacheStore();
const settings = useSettingStore();
const editMap = ref<InstanceType<typeof ToiletMap> | null>(null);
const isLocating = ref(false);

const draft = reactive({
  name: "",
  isActive: true,
  reviewed: true,
  lat: 0,
  lon: 0,
  country: "",
  province: "",
  city: "",
  description: "",
  kinds: [] as ToiletKind[],
  restriction: "public" as AccessRestriction,
  accessNotes: "",
  parkingAllowed: null as boolean | null,
  hasAccessibleToilet: null as boolean | null,
  isSeparateStall: null as boolean | null,
  isLocked: null as boolean | null,
  accessibilityNotes: "",
  openingText: "",
});

const hasSelection = computed(() => Boolean(workspace.selectedToilet));

function loadDraft() {
  const item = workspace.selectedToilet;
  if (!item) return;
  draft.name = item.name;
  draft.isActive = item.isActive;
  draft.reviewed = settings.autoReviewOnEdit || item.audit.reviewed;
  draft.lat = item.location.lat;
  draft.lon = item.location.lon;
  draft.country = item.address?.country || "";
  draft.province = item.address?.province || "";
  draft.city = item.address?.city || "";
  draft.description = item.address?.description || "";
  draft.kinds = [...item.kinds];
  draft.restriction = item.access.restriction;
  draft.accessNotes = item.access.notes || "";
  draft.parkingAllowed = item.facilities.parkingAllowed ?? null;
  draft.hasAccessibleToilet = item.accessibility.hasAccessibleToilet;
  draft.isSeparateStall = item.accessibility.isSeparateStall;
  draft.isLocked = item.accessibility.isLocked;
  draft.accessibilityNotes = item.accessibility.notes || "";
  draft.openingText = item.openingHours?.text || "";
}

async function renderEditMap() {
  const item = workspace.selectedToilet;
  if (!item) return;
  await nextTick();
  editMap.value?.setPoints([{
    lon: item.location.lon,
    lat: item.location.lat,
    kinds: item.kinds,
  }]);
  editMap.value?.focusPoint(item.location.lon, item.location.lat);
}

function handleMapCoordinateChange(location: {lon: number; lat: number}) {
  draft.lon = location.lon;
  draft.lat = location.lat;
}

function updateEditLocation(useForCoordinates = false) {
  if (!navigator.geolocation) {
    ElMessage.error("当前浏览器不支持定位，请使用支持位置权限的浏览器");
    return;
  }
  ElMessage.info("请在浏览器授权弹窗中允许使用当前位置");
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: Number(position.coords.latitude.toFixed(6)),
      lon: Number(position.coords.longitude.toFixed(6)),
      accuracy: Math.round(position.coords.accuracy),
    };
    editMap.value?.setUserLocation(location);
    if (useForCoordinates) {
      draft.lat = location.lat;
      draft.lon = location.lon;
      editMap.value?.setPoints([{lon: draft.lon, lat: draft.lat, kinds: draft.kinds}]);
      editMap.value?.focusPoint(draft.lon, draft.lat);
      ElMessage.success("已使用当前位置更新坐标");
    } else {
      ElMessage.success("已在地图上显示当前位置");
    }
    isLocating.value = false;
  }, () => {
    isLocating.value = false;
    ElMessage.error("定位失败，请在浏览器设置中重新开启位置权限后重试");
  }, {
    timeout: 8000,
    enableHighAccuracy: true,
  });
}

function saveDraft() {
  const item = workspace.selectedToilet;
  if (!item) return;
  const baseUpdatedAt = localCache.getMetadata(item.id)?.baseUpdatedAt ?? item.audit.updatedAt;
  item.name = draft.name.trim() || "未命名卫生间";
  item.isActive = draft.isActive;
  item.location.lat = Number(draft.lat);
  item.location.lon = Number(draft.lon);
  item.address = {
    ...(item.address || {}),
    country: draft.country.trim() || undefined,
    province: draft.province.trim() || undefined,
    city: draft.city.trim() || undefined,
    description: draft.description.trim() || undefined,
  };
  item.kinds = [...draft.kinds];
  item.access = {
    ...item.access,
    restriction: draft.restriction,
    notes: draft.accessNotes.trim() || undefined,
  };
  item.facilities = {
    ...item.facilities,
    parkingAllowed: draft.parkingAllowed,
  };
  item.accessibility = {
    ...item.accessibility,
    hasAccessibleToilet: draft.hasAccessibleToilet,
    isSeparateStall: draft.isSeparateStall,
    isLocked: draft.isLocked,
    notes: draft.accessibilityNotes.trim() || undefined,
  };
  item.openingHours = {
    ...(item.openingHours || {isAlwaysOpen: null}),
    text: draft.openingText.trim() || undefined,
  };
  item.audit.updatedAt = Date.now();
  item.audit.reviewed = settings.autoReviewOnEdit || draft.reviewed;
  if (!localCache.saveEditedToilet(item, baseUpdatedAt)) {
    ElMessage.error(localCache.storageError || "保存到浏览器缓存失败，刷新后无法保留修改");
    return;
  }
  dataset.updateToilet(item);
  workspace.selectToilet(item);
  ElMessage.success("记录已保存到浏览器缓存，刷新后仍会保留修改");
}

watch(() => workspace.selectedToilet?.id, () => {
  if (!workspace.selectedToilet) return;
  loadDraft();
  void renderEditMap();
  updateEditLocation();
}, {immediate: true});
</script>

<template>
  <section class="workspace-page">
    <div v-if="!embedded" class="workspace-hero edit-hero">
      <div>
        <p class="workspace-eyebrow">修改维护</p>
        <h2>编辑已导入的卫生间资料</h2>
        <p>这里用于承接搜索页选中的记录，后续会支持修改、停用、合并重复点位和导出更新后的数据包。</p>
      </div>
      <el-button size="large" type="primary" disabled>
        <el-icon><UploadFilled /></el-icon>
        导入待编辑数据
      </el-button>
    </div>

    <div v-if="hasSelection" class="edit-form-shell">
      <div class="edit-selected-state">
        <el-icon><Edit /></el-icon>
        <div>
          <h3>{{ workspace.selectedToilet.name }}</h3>
          <p>{{ workspace.selectedToilet.address?.province }} {{ workspace.selectedToilet.address?.city }} {{ workspace.selectedToilet.address?.description }}</p>
          <p>{{ workspace.selectedToilet.location.lat.toFixed(5) }}, {{ workspace.selectedToilet.location.lon.toFixed(5) }}</p>
        </div>
      </div>

      <div class="edit-layout">
      <el-form class="edit-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="名称">
            <el-input v-model="draft.name"/>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="draft.isActive" active-text="启用" inactive-text="停用"/>
          </el-form-item>
          <el-form-item label="人工 Review">
            <el-switch v-model="draft.reviewed" active-text="已确认" inactive-text="未确认"/>
          </el-form-item>
          <el-form-item label="纬度">
            <el-input-number v-model="draft.lat" :precision="6" :step="0.0001" controls-position="right"/>
          </el-form-item>
          <el-form-item label="经度">
            <el-input-number v-model="draft.lon" :precision="6" :step="0.0001" controls-position="right"/>
          </el-form-item>
          <el-form-item label="坐标定位">
            <el-button :loading="isLocating" type="primary" plain @click="updateEditLocation(true)">
              <el-icon><Location /></el-icon>
              使用当前定位
            </el-button>
          </el-form-item>
          <el-form-item label="国家">
            <el-input v-model="draft.country"/>
          </el-form-item>
          <el-form-item label="省份">
            <el-input v-model="draft.province"/>
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="draft.city"/>
          </el-form-item>
        </div>

        <el-form-item label="描述">
          <el-input v-model="draft.description"/>
        </el-form-item>

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
          <el-form-item label="无障碍卫生间">
            <el-select v-model="draft.hasAccessibleToilet">
              <el-option label="未知" :value="null"/>
              <el-option label="有" :value="true"/>
              <el-option label="无" :value="false"/>
            </el-select>
          </el-form-item>
          <el-form-item label="允许停车">
            <el-select v-model="draft.parkingAllowed">
              <el-option label="未知" :value="null"/>
              <el-option label="允许" :value="true"/>
              <el-option label="不允许" :value="false"/>
            </el-select>
          </el-form-item>
          <el-form-item label="是否单独隔间">
            <el-select v-model="draft.isSeparateStall">
              <el-option label="未知" :value="null"/>
              <el-option label="是" :value="true"/>
              <el-option label="否" :value="false"/>
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="开放时间说明">
          <el-input v-model="draft.openingText"/>
        </el-form-item>
        <el-form-item label="通行备注">
          <el-input v-model="draft.accessNotes" type="textarea" :rows="2"/>
        </el-form-item>
        <el-form-item label="无障碍备注">
          <el-input v-model="draft.accessibilityNotes" type="textarea" :rows="2"/>
        </el-form-item>
        <div class="form-actions">
          <el-button @click="loadDraft">重置草稿</el-button>
          <el-button type="primary" @click="saveDraft">
            <el-icon><Check /></el-icon>
            保存修改
          </el-button>
        </div>
      </el-form>
        <aside class="edit-map-panel">
          <div class="edit-map-heading">
            <div>
              <p class="workspace-eyebrow">位置预览</p>
              <h3>当前卫生间点位</h3>
            </div>
            <el-tag type="info" effect="plain">{{ draft.lat.toFixed(6) }}, {{ draft.lon.toFixed(6) }}</el-tag>
          </div>
          <div class="edit-map-canvas">
            <toilet-map
                ref="editMap"
                basemap-style="mono"
                editable-marker
                :cluster-points="false"
                @coordinate-change="handleMapCoordinateChange"
            />
          </div>
          <p class="field-hint">拖动红色大头钉可以直接选择坐标，也可以通过左侧经纬度输入框修改。</p>
        </aside>
      </div>
    </div>

    <div v-else class="edit-empty-state">
      <el-icon><Edit /></el-icon>
      <div>
        <h3>尚未选择记录</h3>
        <p>下一步可以把搜索结果列表和这里打通：点击某条记录后进入编辑状态，保存时写回本地数据集。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edit-hero {
  border-color: rgba(20, 118, 100, 0.2);
  background: var(--itp-edit-hero);
}

.edit-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  gap: 18px;
  margin-top: 18px;
}

.edit-map-panel {
  align-self: start;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.edit-map-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-map-heading h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.edit-map-canvas {
  height: 360px;
  overflow: hidden;
  border-radius: 8px;
}

.edit-map-canvas :deep(.map-container) {
  min-height: 360px;
}

@media (max-width: 980px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }
}

.edit-empty-state,
.edit-selected-state {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
  padding: 24px;
  border: 1px dashed var(--itp-border-strong);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.edit-empty-state .el-icon,
.edit-selected-state .el-icon {
  width: 40px;
  height: 40px;
  color: var(--itp-primary);
}

.edit-empty-state h3,
.edit-selected-state h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.edit-empty-state p,
.edit-selected-state p {
  margin: 0;
  color: var(--itp-text-muted);
}

.edit-form-shell {
  display: grid;
  gap: 14px;
}

.edit-form {
  padding: 18px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
