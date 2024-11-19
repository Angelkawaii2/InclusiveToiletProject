<script setup lang="ts">
import {computed} from "vue";
import {SETTINGS_KEYS, useSettingStore} from "@/stores/UseSettingStore";
import {notifyError, notifySuccess} from "@/Utils/Notify";

const setting = useSettingStore();

const isDebug = computed({
      get: () => setting.isDebug,
      set: (value: boolean) => {
        if (setting.isDebug == value) return;
        setting.updateSettings(SETTINGS_KEYS.IS_DEBUG, value)
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

    </div>
  </div>
</template>

<style scoped>
.label {
  justify-self: end;
  font-size: 1.1em;
}
.language-selector{
  max-width: 20rem;
}
.settingsPanel {
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 1rem;
}
</style>