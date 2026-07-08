<script lang="ts" setup>
import {computed, reactive, watch} from "vue";
import {Check, Edit, UploadFilled} from "@element-plus/icons-vue";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {ElMessage} from "element-plus";
import {AccessRestriction, ToiletKind} from "@/types/ToiletData-V6";

defineProps<{
  embedded?: boolean
}>()

const workspace = useWorkspaceStore();

const kindOptions: Array<{ label: string; value: ToiletKind }> = [
  {label: "无性别/包容", value: "allGender"},
  {label: "男厕", value: "male"},
  {label: "女厕", value: "female"},
  {label: "家庭卫生间", value: "family"},
  {label: "无障碍", value: "accessible"},
  {label: "其他", value: "other"},
];

const restrictionOptions: Array<{ label: string; value: AccessRestriction }> = [
  {label: "公共开放", value: "public"},
  {label: "仅顾客", value: "customersOnly"},
  {label: "票区内", value: "ticketedArea"},
  {label: "仅员工", value: "staffOnly"},
  {label: "私人区域", value: "private"},
  {label: "未知", value: "unknown"},
];

const draft = reactive({
  name: "",
  isActive: true,
  lat: 0,
  lon: 0,
  country: "",
  province: "",
  city: "",
  description: "",
  kinds: [] as ToiletKind[],
  restriction: "public" as AccessRestriction,
  accessNotes: "",
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
  draft.lat = item.location.lat;
  draft.lon = item.location.lon;
  draft.country = item.address?.country || "";
  draft.province = item.address?.province || "";
  draft.city = item.address?.city || "";
  draft.description = item.address?.description || "";
  draft.kinds = [...item.kinds];
  draft.restriction = item.access.restriction;
  draft.accessNotes = item.access.notes || "";
  draft.hasAccessibleToilet = item.accessibility.hasAccessibleToilet;
  draft.isSeparateStall = item.accessibility.isSeparateStall;
  draft.isLocked = item.accessibility.isLocked;
  draft.accessibilityNotes = item.accessibility.notes || "";
  draft.openingText = item.openingHours?.text || "";
}

function saveDraft() {
  const item = workspace.selectedToilet;
  if (!item) return;
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
  workspace.selectToilet(item);
  ElMessage.success("记录已更新到当前会话数据中");
}

watch(() => workspace.selectedToilet?.id, loadDraft, {immediate: true});
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

      <el-form class="edit-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="名称">
            <el-input v-model="draft.name"/>
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
            <el-option v-for="item in kindOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="进入限制">
            <el-select v-model="draft.restriction">
              <el-option v-for="item in restrictionOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="无障碍卫生间">
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
