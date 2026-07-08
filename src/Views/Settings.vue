<script lang="ts" setup>
import {computed} from "vue";
import {useSettingStore} from "@/stores/settingsStore";
import {notifySuccess} from "@/Utils/Notify";

const setting = useSettingStore();

const isDebug = computed({
      get: () => setting.isDebug,
      set: (value: boolean) => {
        if (setting.isDebug == value) return;
        setting.updateDebugMode(value)
        notifySuccess(`已${value ? "启用" : "禁用"}Debug 模式`)
      }
    }
)


</script>

<template>
  <div class="">
    <h1>设置页</h1>
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
  </div>
</template>

<style scoped>
.label {
  justify-self: end;
  font-size: 1.1em;
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
</style>
