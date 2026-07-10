<script lang="ts" setup>
import {computed, ref} from "vue";
import {useSettingStore} from "@/stores/settingsStore";
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

          <template v-if="isDebug">
            <el-text class="label">当前语言</el-text>
            <el-text>{{ setting.language }}</el-text>
            <el-text class="label">当前主题</el-text>
            <el-text>{{ setting.theme === 'dark' ? '夜间模式' : '日间模式' }}</el-text>
          </template>
        </div>
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
}
</style>
