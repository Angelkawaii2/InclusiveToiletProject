<script setup lang="ts">

import {inject} from "vue";
import {StoreGeneric} from "pinia";
import {useSettingStore} from "@/stores/UseSettingStore";

const data = inject("currentData") as StoreGeneric;

const settings = useSettingStore();


</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ $t('ui.basicinfo.title') }}</h3>
      </div>
    </template>
    <template v-if="settings.isDebug">
      <div class="entry">
        <el-text>{{ $t('ui.debug.app_version') }}</el-text>
        <el-input type="text" placeholder="name" v-model="data.DEBUG.app_version"></el-input>
      </div>
      <div class="entry">
        <el-text>{{ $t('ui.debug.build_date') }}</el-text>
        <el-input type="text" placeholder="name" v-model="data.DEBUG.build_date"></el-input>
      </div>
    </template>

    <div class="entry">
      <el-text>{{ $t('ui.basicinfo.version') }}</el-text>
      <el-input type="text" placeholder="unknown" v-model="data.version"></el-input>
    </div>
    <div class="entry">
      <el-text>{{ $t('ui.basicinfo.name') }}</el-text>
      <el-input type="text" placeholder="name" v-model="data.name"></el-input>
    </div>
    <div class="entry">
      <el-text>{{ $t('ui.basicinfo.isDisabled') }}</el-text>
      <el-switch style="--el-switch-on-color: red;" placeholder="name" v-model="data.isDisabled"></el-switch>
    </div>
    <div class="entry">
      <el-text>{{ $t('ui.basicinfo.lastupdateat') }}</el-text>
      <el-text>{{ new Date(data.lastUpdateAt).toLocaleDateString()}}</el-text>
      <el-input type="text" :disabled="!settings.isDebug" placeholder="unknown" v-model="data.lastUpdateAt"></el-input>
    </div>


  </el-card>
</template>

<style scoped>


</style>