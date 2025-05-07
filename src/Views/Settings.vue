<script lang="ts" setup>
import {computed} from "vue";
import {SETTINGS_KEYS, useSettingStore} from "@/stores/UseSettingStore";
import {notifySuccess} from "@/Utils/Notify";

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

      <template v-if="isDebug">

        <el-text class="label">速记模式</el-text>
        <el-switch v-model="setting.test" disabled size="large"></el-switch>

        <el-text class="label">自动刷新GPS</el-text>
        <el-switch v-model="setting.test" disabled size="large"></el-switch>

        <el-text class="label">自动更新 LastUpdateAt 字段</el-text>
        <el-switch v-model="setting.test" disabled size="large"></el-switch>

        <el-text class="label">⚠️允许修改内部数据</el-text>
        <el-switch v-model="setting.test" disabled size="large"></el-switch>


        <el-text class="label">启用评论签名</el-text>
        <el-switch v-model="setting.test" disabled size="large"></el-switch>

        <el-text class="label">用户名</el-text>
        <el-input disabled size="large"></el-input>

        <el-text class="label">UUID</el-text>
        <div>
          <el-input disabled size="large"></el-input>
          <el-button>重新生成</el-button>
        </div>

        <el-text class="label">签名算法</el-text>
        <el-select></el-select>

        <el-text class="label">评论签名私钥</el-text>
        <el-input disabled size="large"></el-input>


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