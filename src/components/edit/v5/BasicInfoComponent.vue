<script lang="ts" setup>

import {inject} from "vue";
import {StoreGeneric} from "pinia";
import {useSettingStore} from "@/stores/UseSettingStore";
import {useI18n} from "vue-i18n";

const data = inject("currentData") as StoreGeneric;

const settings = useSettingStore();

const {t} = useI18n()

</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ t('ui.basicinfo.title') }}</h3>
      </div>
    </template>
    <template v-if="settings.isDebug">
      <div class="entry">
        <el-text>{{ t('ui.debug.app_version') }}</el-text>
        <el-input v-model="data.DEBUG.app_version" placeholder="name" type="text"></el-input>
      </div>
      <div class="entry">
        <el-text>{{ t('ui.debug.build_date') }}</el-text>
        <el-input v-model="data.DEBUG.build_date" placeholder="name" type="text"></el-input>
      </div>
    </template>

    <div class="entry">
      <el-text>{{ t('ui.basicinfo.version') }}</el-text>
      <el-input v-model="data.version" placeholder="unknown" type="text"></el-input>
    </div>
    <div class="entry">
      <el-text>{{ t('ui.basicinfo.name') }}</el-text>
      <el-input v-model="data.name" placeholder="name" type="text"></el-input>
    </div>
    <div class="entry">
      <el-text>{{ t('ui.basicinfo.isDisabled') }}</el-text>
      <el-switch v-model="data.isDisabled" placeholder="name" style="--el-switch-on-color: red;"></el-switch>
    </div>
    <div class="entry">
      <el-text>{{ t('ui.basicinfo.lastupdateat') }}</el-text>
      <el-text>{{ new Date(data.lastUpdateAt).toLocaleDateString() }}</el-text>
      <el-input v-model="data.lastUpdateAt" :disabled="!settings.isDebug" placeholder="unknown" type="text"></el-input>
    </div>


  </el-card>
</template>

<style scoped>


</style>