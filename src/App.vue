<script setup>

import {useI18n} from "vue-i18n";
import {computed, ref, watchEffect} from "vue";
import Settings from "@/Views/Settings.vue";
import LookupPage from "@/Views/LookupPage.vue";
import DataMaintenancePage from "@/Views/DataMaintenancePage.vue";
import {Moon, Sunny} from "@element-plus/icons-vue";
import {useSettingStore} from "@/stores/settingsStore";
import {useWorkspaceStore} from "@/stores/workspaceStore";

const {t} = useI18n()
const settings = useSettingStore()
const workspace = useWorkspaceStore()

const v = VITE_APP_VERSION
const b = VITE_BUILD_TIME
const isDevVersion = import.meta.env.VITE_IS_DEV_VERSION === "true"

const font = computed(() => ({
  color: settings.theme === 'dark' ? 'rgba(255, 255, 255, .08)' : 'rgba(0, 0, 0, .08)',
}))

const watermark = () => {
  if (isDevVersion) {
    return ['DevVer', v];
  } else {
    return [v]
  }
}
const tab = computed({
  get: () => workspace.activeTab,
  set: (value) => {
    workspace.activeTab = value
  }
})

const isDarkTheme = computed(() => settings.theme === 'dark')

watchEffect(() => {
  const root = document.documentElement;
  root.classList.toggle('dark', isDarkTheme.value);
  root.dataset.theme = settings.theme;
})
</script>


<template>
  <div class="app-shell">
    <el-watermark :content=watermark() :font="font">
      <div class="app-header">
        <div class="brand-block">
          <h1>{{ t("ui.title") }}</h1>
          <p>"{{ t('ui.slogan') }}"</p>
        </div>
        <div class="build-card">
          <el-button circle :title="isDarkTheme ? '切换到日间模式' : '切换到夜间模式'" @click="settings.toggleTheme()">
            <el-icon>
              <Moon v-if="!isDarkTheme"/>
              <Sunny v-else/>
            </el-icon>
          </el-button>
          <el-link href="https://github.com/Angelkawaii2/InclusiveToiletProject" target="_blank" type="primary">
            GitHub Project
          </el-link>
          <span>Version: {{ v }}</span>
          <span>Build: {{ b }}</span>
          <el-text v-if="isDevVersion" type="danger">Dev 测试版本</el-text>
        </div>
      </div>

      <el-backtop :bottom="100" :right="40"/>

      <el-tabs v-model=tab class="workspace-tabs">
        <el-tab-pane label="搜索浏览" name="search">
          <lookup-page/>
        </el-tab-pane>

        <el-tab-pane label="数据维护" name="maintenance">
          <data-maintenance-page/>
        </el-tab-pane>

        <el-tab-pane label="设置" name="settings">
          <Settings></Settings>
        </el-tab-pane>

      </el-tabs>

    </el-watermark>
  </div>

</template>

<style scoped>

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.app-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  padding: 22px 24px;
  border: 1px solid rgba(111, 139, 153, 0.22);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
  box-shadow: var(--itp-shadow);
}

.brand-block h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: 0;
}

.brand-block p {
  margin: 8px 0 0;
  color: var(--itp-text-muted);
}

.build-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: var(--itp-text-muted);
  font-size: 13px;
}

.workspace-tabs {
  border: 1px solid rgba(111, 139, 153, 0.22);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
  padding: 14px 16px 18px;
}

@media (max-width: 720px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .build-card {
    align-items: flex-start;
  }
}


</style>
