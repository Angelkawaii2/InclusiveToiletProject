<script setup lang="ts">
import {computed, inject} from "vue";
import {StoreGeneric, storeToRefs} from "pinia";
import {useCurrentData} from "@/stores/currentData";

const data = inject<ReturnType<typeof useCurrentData>>("currentData")
const accessibleMetadata = storeToRefs(data).accessible


</script>

<template>

  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ $t('ui.accessible.metadata.title') }}</h3>
      </div>
    </template>

    <template v-if="data.accessible.hasOwnProperty('isLocked')">
      <div class="selector">
        <h4>{{ $t("ui.accessible.metadata.islocked") }}</h4>
        <el-radio-group v-model="data.accessible.isLocked">
          <el-radio-button size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="accessibleMetadata">
      <div class="selector">
        <h4>{{ $t("ui.accessible.metadata.comments") }}</h4>
        <el-input v-model="data.accessible.comments"></el-input>
      </div>
    </template>
  </el-card>
</template>

<style scoped>

</style>