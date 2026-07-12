<script lang="ts" setup>
import {computed, ref} from "vue";
import {type MapStyle, useSettingStore} from "@/stores/settingsStore";
import {notifySuccess} from "@/Utils/Notify";

const setting = useSettingStore();
const activeTab = ref("general");

const isDebug = computed({
      get: () => setting.isDebug,
      set: (value: boolean) => {
        if (setting.isDebug == value) return;
        setting.updateDebugMode(value)
        notifySuccess(`已${value ? "启用" : "禁用"}Debug 模式`)
      }
    }
)

const autoReviewOnEdit = computed({
  get: () => setting.autoReviewOnEdit,
  set: (value: boolean) => {
    if (setting.autoReviewOnEdit === value) return;
    setting.updateAutoReviewOnEdit(value);
    notifySuccess(value ? "编辑记录将自动标记为已人工核验" : "编辑记录将保留手动核验状态");
  }
});

const autoUpdatePwa = computed({
  get: () => setting.autoUpdatePwa,
  set: (value: boolean) => {
    if (setting.autoUpdatePwa === value) return;
    setting.updateAutoUpdatePwa(value);
    notifySuccess(value ? "检测到应用更新后将自动更新" : "检测到应用更新后将询问是否更新");
  }
});

const autoRefreshGps = computed({
  get: () => setting.autoRefreshGps,
  set: (value: boolean) => {
    if (setting.autoRefreshGps === value) return;
    setting.updateAutoRefreshGps(value);
    notifySuccess(value ? "GPS 位置将自动刷新" : "GPS 位置将仅在手动操作时刷新");
  }
});

const mapStyle = computed({
  get: () => setting.mapStyle,
  set: (value: MapStyle) => {
    if (setting.mapStyle === value) return;
    setting.updateMapStyle(value);
    notifySuccess(value === "mono" ? "地图已切换为单色样式" : "地图将随日间与夜间主题切换样式");
  }
});


</script>

<template>
  <div class="settings-page">
    <h1>设置页</h1>
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="常规" name="general">
        <div class="settingsPanel">
          <el-text class="label">语言</el-text>
          <switch-lang class="language-selector"/>

          <el-text class="label">启用调试（Debug）模式</el-text>
          <el-switch v-model="isDebug" size="large"></el-switch>

          <el-text class="label">自动更新离线应用（PWA）</el-text>
          <el-switch v-model="autoUpdatePwa" active-text="自动更新" inactive-text="询问后更新"/>

          <el-text class="label">自动刷新 GPS 位置</el-text>
          <el-switch v-model="autoRefreshGps" active-text="每 15 秒刷新" inactive-text="仅手动刷新"/>

          <template v-if="isDebug">
            <el-text class="label">当前语言</el-text>
            <el-text>{{ setting.language }}</el-text>
            <el-text class="label">当前主题</el-text>
            <el-text>{{ setting.theme === 'dark' ? '夜间模式' : '日间模式' }}</el-text>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane label="界面" name="appearance">
        <section class="appearance-settings">
          <h2>地图样式</h2>
          <el-segmented v-model="mapStyle" :options="[
            {label: '单色', value: 'mono'},
            {label: '浅色', value: 'light'},
            {label: '深色', value: 'dark'}
          ]"/>
        </section>
      </el-tab-pane>

      <el-tab-pane label="编辑" name="editing">
        <section class="editing-settings">
          <div>
            <h2>编辑行为</h2>
            <p>控制编辑现有卫生间记录时的默认数据质量状态。</p>
          </div>
          <div class="editing-setting-row">
            <div>
              <h3>编辑时默认人工核验</h3>
              <p>开启后，每次保存编辑都会自动将记录标记为已人工核验。</p>
            </div>
            <el-switch v-model="autoReviewOnEdit" active-text="启用" inactive-text="关闭"/>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.label {
  justify-self: end;
  font-size: 1.1em;
}

.settings-page {
  max-width: 860px;
}

.settings-tabs {
  margin-top: 16px;
}

.language-selector {
  max-width: 20rem;
}

.settingsPanel {
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 1rem;
}

.editing-settings {
  padding: 18px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.appearance-settings {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.appearance-settings h2 {
  margin: 0;
}

.editing-settings h2,
.editing-setting-row h3 {
  margin: 0;
}

.editing-settings > p,
.editing-setting-row p {
  margin: 8px 0 0;
  color: var(--itp-text-muted);
}

.editing-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--itp-border);
}

@media (max-width: 640px) {
  .settingsPanel {
    grid-template-columns: 1fr;
  }

  .label {
    justify-self: start;
  }

  .editing-setting-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .appearance-settings {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
