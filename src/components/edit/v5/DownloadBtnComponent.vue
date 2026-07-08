<script lang="ts" setup>
import {computed, inject} from "vue";
import {StoreGeneric} from "pinia";
import {useI18n} from "vue-i18n";

const data = inject("currentData") as StoreGeneric
const {t} = useI18n()

function downloadData() {
  const blob = new Blob([JSON.stringify(data.$state, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = data.timestamp + '.json';
  link.click();

  // 释放URL对象
  URL.revokeObjectURL(url);
}

const isGPSDataAvailable = computed(() => {
  const requiredField = ['lat', 'lon']
  return data.loc != null && requiredField.every((f) => data.loc.hasOwnProperty(f) && data.loc[f] !== undefined);
})

</script>

<template>
  <el-button :disabled="!isGPSDataAvailable" size="large" type="success"
             @click="downloadData">
    <slot/>
    {{ t("ui.general.save") }}
  </el-button>
</template>

<style scoped>

</style>
