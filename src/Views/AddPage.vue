<script lang="ts" setup>

import DownloadBtnComponent from "@/components/edit/v5/DownloadBtnComponent.vue";
import GpsLocationComponent from "@/components/edit/v5/GpsLocationComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";
import {useCurrentData} from "@/stores/currentData";
import MapComponent from "@/components/edit/v4/MapComponent.vue";
import {useSettingStore} from "@/stores/UseSettingStore";
import {computed, provide} from "vue";
import BasicInfoComponent from "@/components/edit/v5/BasicInfoComponent.vue";
import ToiletTypeSelectorComponent from "@/components/edit/v5/ToiletTypeSelectorComponent.vue";
import ToiletMetadata from "@/components/edit/v5/ToiletProperties.vue";
import CommentComponent from "@/components/edit/v5/CommentComponent.vue";
import ImageUploadComponent from "@/components/edit/v5/ImageUploadComponent.vue";
import TimeSelectorComponent from "@/components/edit/v5/TimeSelectorComponent.vue";
import AccessibleMetadataComponent from "@/components/edit/v5/AccessibleMetadataComponent.vue";
import {useI18n} from "vue-i18n";
import {Download, RefreshLeft} from "@element-plus/icons-vue";

defineProps<{
  embedded?: boolean
}>()

const data = useCurrentData()
const settings = useSettingStore();
const {t} = useI18n()

provide("currentData", data)

const isAccessibleSelected = (): boolean => {
  return data.types.includes('accessible')
}

const resetData = () => {
  data.reset()
}

const comp = computed(() => {
  return [
    {comp: GpsLocationComponent, cond: true}, // 已有格式
    {comp: BasicInfoComponent, cond: true}, // 修改后的格式
    {comp: ToiletTypeSelectorComponent, cond: true},
    {comp: AccessibleMetadataComponent, cond: isAccessibleSelected()},
    {comp: ToiletMetadata, cond: true},
    {comp: TimeSelectorComponent, cond: true},
    {comp: ImageUploadComponent, cond: true},
    {comp: CommentComponent, cond: true},
    {comp: DebugJsonComponent, cond: settings.isDebug}
  ];
})

</script>

<template>

  <section class="workspace-page">
    <div v-if="!embedded" class="workspace-hero create-hero">
      <div>
        <p class="workspace-eyebrow">新增采集</p>
        <h2>记录一个新的卫生间点位</h2>
        <p>适合现场采集或事后补录。填写位置、类型、设施、开放时间和照片后导出单条 JSON 数据。</p>
      </div>
      <div class="hero-actions">
        <el-button type="danger" @click="resetData()">
          <el-icon><RefreshLeft /></el-icon>
          {{ t("ui.general.resetAll") }}
        </el-button>
        <download-btn-component>
          <el-icon><Download /></el-icon>
        </download-btn-component>
      </div>
    </div>

    <div v-else class="embedded-toolbar">
      <div>
        <h3>新增点位</h3>
        <p>填写位置、类型、设施、开放时间和照片后导出单条 JSON 数据。</p>
      </div>
      <div class="hero-actions">
        <el-button type="danger" @click="resetData()">
          <el-icon><RefreshLeft /></el-icon>
          {{ t("ui.general.resetAll") }}
        </el-button>
        <download-btn-component>
          <el-icon><Download /></el-icon>
        </download-btn-component>
      </div>
    </div>

    <MapComponent class="map-panel"/>

    <div class="form-masonry">
      <div v-for="item in comp" class="form-panel">
        <component :is="item.comp" v-show="item.cond"/>
      </div>
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

.map-panel {
  display: block;
  margin-top: 16px;
}

.form-masonry {
  columns: 1;
  column-gap: 14px;
  padding-top: 14px;
}

.form-panel {
  break-inside: avoid;
  margin-bottom: 14px;
}

@media (min-width: 760px) {
  .form-masonry {
    columns: 2;
  }
}

@media (min-width: 1120px) {
  .form-masonry {
    columns: 3;
  }
}
</style>
