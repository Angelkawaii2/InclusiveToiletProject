<script lang="ts" setup>

import {computed, onBeforeUnmount, onMounted, ref, watch, watchEffect} from "vue";
import Settings from "@/Views/Settings.vue";
import LookupPage from "@/Views/LookupPage.vue";
import DataMaintenancePage from "@/Views/DataMaintenancePage.vue";
import DataTransferPage from "@/Views/DataTransferPage.vue";
import AddPage from "@/Views/AddPage.vue";
import EditPage from "@/Views/EditPage.vue";
import {Moon, Plus, Sunny} from "@element-plus/icons-vue";
import {useSettingStore} from "@/stores/settingsStore";
import {useWorkspaceStore} from "@/stores/workspaceStore";
import {CURRENT_LOCATION_CACHE_MS, onCurrentLocationSuccess, requestCurrentLocation} from "@/domain/geo/currentLocation";
import {debugLog} from "@/Utils/Debug";

const settings = useSettingStore()
const workspace = useWorkspaceStore()
const isMobile = ref(false)
let mobileMedia: MediaQueryList | null = null
let gpsRefreshTimer: number | null = null
let removeLocationSuccessListener: (() => void) | null = null

function refreshGpsLocation(reason: "定时刷新" | "窗口重新聚焦" | "页面重新显示" | "启用自动刷新") {
  if (!settings.autoRefreshGps || document.visibilityState !== "visible") return
  void requestCurrentLocation({forceRefresh: true, reason: `自动刷新 GPS（${reason}）`})
}

function syncGpsRefreshTimer(enabled = settings.autoRefreshGps) {
  if (gpsRefreshTimer !== null) {
    window.clearInterval(gpsRefreshTimer)
    gpsRefreshTimer = null
  }
  if (!enabled) return
  gpsRefreshTimer = window.setInterval(() => refreshGpsLocation("定时刷新"), CURRENT_LOCATION_CACHE_MS)
  refreshGpsLocation("启用自动刷新")
}

function resetGpsRefreshTimer() {
  if (!settings.autoRefreshGps || gpsRefreshTimer === null) return
  window.clearInterval(gpsRefreshTimer)
  gpsRefreshTimer = window.setInterval(() => refreshGpsLocation("定时刷新"), CURRENT_LOCATION_CACHE_MS)
  debugLog("GPS 自动刷新", `定位成功，已从现在起重新计时 ${CURRENT_LOCATION_CACHE_MS / 1000} 秒`)
}

function handlePageFocus() {
  refreshGpsLocation("窗口重新聚焦")
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") refreshGpsLocation("页面重新显示")
}

function updateMobileLayout(event?: MediaQueryListEvent) {
  isMobile.value = event?.matches ?? mobileMedia?.matches ?? false
}

onMounted(() => {
  mobileMedia = window.matchMedia('(max-width: 760px)')
  updateMobileLayout()
  mobileMedia.addEventListener('change', updateMobileLayout)
  window.addEventListener("focus", handlePageFocus)
  document.addEventListener("visibilitychange", handleVisibilityChange)
  removeLocationSuccessListener = onCurrentLocationSuccess(resetGpsRefreshTimer)
  syncGpsRefreshTimer()
})

onBeforeUnmount(() => {
  mobileMedia?.removeEventListener('change', updateMobileLayout)
  window.removeEventListener("focus", handlePageFocus)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
  removeLocationSuccessListener?.()
  removeLocationSuccessListener = null
  syncGpsRefreshTimer(false)
})

watch(() => settings.autoRefreshGps, (enabled) => syncGpsRefreshTimer(enabled))

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
          <h1>卫生间数据采集工具</h1>
        </div>
        <div class="header-actions">
          <el-button circle :title="isDarkTheme ? '切换到日间模式' : '切换到夜间模式'" @click="settings.toggleTheme()">
            <el-icon>
              <Moon v-if="!isDarkTheme"/>
              <Sunny v-else/>
            </el-icon>
          </el-button>
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

        <el-tab-pane label="数据导入导出" name="data-transfer">
          <data-transfer-page/>
        </el-tab-pane>

        <el-tab-pane label="设置" name="settings">
          <Settings></Settings>
        </el-tab-pane>

      </el-tabs>

      <el-button
          class="global-capture-button"
          type="success"
          size="large"
          aria-label="新增点位"
          title="新增点位"
          @click="workspace.openCapture()"
      >
        <el-icon><Plus /></el-icon>
        <span>新增点位</span>
      </el-button>

      <el-dialog
          v-model="workspace.captureOpen"
          class="workspace-dialog capture-dialog"
          title="新增点位"
          width="min(1100px, 94vw)"
          align-center
          :fullscreen="isMobile"
          destroy-on-close
      >
        <add-page/>
      </el-dialog>

      <el-dialog
          v-model="workspace.editOpen"
          class="workspace-dialog edit-dialog"
          title="编辑卫生间记录"
          width="min(1180px, 94vw)"
          align-center
          :fullscreen="isMobile"
          destroy-on-close
      >
        <edit-page embedded @saved="workspace.closeEditor()" @cancel="workspace.closeEditor()"/>
      </el-dialog>

      <footer class="app-footer">
        <el-link href="https://github.com/Angelkawaii2/InclusiveToiletProject" target="_blank" type="primary">GitHub Project</el-link>
        <span>版本 {{ v }}</span>
        <span>构建 {{ b }}</span>
        <el-text v-if="isDevVersion" type="danger">Dev 测试版本</el-text>
      </footer>

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
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(111, 139, 153, 0.22);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
  box-shadow: var(--itp-shadow);
}

.brand-block h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: 0;
}

.header-actions,
.app-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-footer {
  justify-content: flex-end;
  min-height: 34px;
  padding: 10px 4px 0;
  color: var(--itp-text-muted);
  font-size: 12px;
}

.workspace-tabs {
  border: 1px solid rgba(111, 139, 153, 0.22);
  border-color: var(--itp-border);
  border-radius: 8px;
  background: var(--itp-surface);
  padding: 14px 16px 18px;
}

.global-capture-button {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 1200;
  min-height: 48px;
  box-shadow: 0 10px 28px rgba(21, 128, 61, 0.3);
}

:global(.workspace-dialog .el-dialog__body) {
  max-height: calc(92vh - 70px);
  padding-top: 8px;
  overflow-y: auto;
}

@media (max-width: 720px) {
  .app-shell {
    width: 100%;
    max-width: none;
  }

  .app-header {
    margin-bottom: 0;
    padding: 8px 12px;
    border-right: 0;
    border-left: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .workspace-tabs {
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 8px 0 0;
  }

  .workspace-tabs :deep(.el-tabs__header) {
    margin: 0 12px 8px;
  }

  .global-capture-button {
    right: 16px;
    bottom: 18px;
    width: 54px;
    min-width: 54px;
    height: 54px;
    padding: 0;
    border-radius: 50%;
  }

  .global-capture-button span:not(.el-icon) {
    display: none;
  }

  :global(.workspace-dialog .el-dialog__header) {
    margin-right: 0;
    padding: 14px 16px;
    border-bottom: 1px solid var(--itp-border);
  }

  :global(.workspace-dialog .el-dialog__body) {
    max-height: calc(100dvh - 56px);
    padding: 12px;
  }

  .app-footer {
    padding: 10px 12px 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}


</style>
