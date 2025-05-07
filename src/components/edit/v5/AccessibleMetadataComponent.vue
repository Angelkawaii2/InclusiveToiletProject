<script lang="ts" setup>
import {inject} from "vue";
import {storeToRefs} from "pinia";
import {useCurrentData} from "@/stores/currentData";
import {useI18n} from "vue-i18n";

const data = inject<ReturnType<typeof useCurrentData>>("currentData")
const accessibleMetadata = storeToRefs(data).accessible
const {t} = useI18n()


</script>

<template>

  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ t('ui.accessible.metadata.title') }}</h3>
      </div>
    </template>

    <template v-if="data.accessible.hasOwnProperty('isLocked')">
      <div class="selector">
        <h4>{{ t("ui.accessible.metadata.islocked") }}</h4>
        <el-radio-group v-model="data.accessible.isLocked">
          <el-radio-button label="yes" :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button label=no :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button label="unknown" :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="accessibleMetadata">
      <div class="selector">
        <h4>{{ t("ui.accessible.metadata.comments") }}</h4>
        <el-input v-model="data.accessible.comments"></el-input>
      </div>
    </template>
  </el-card>
</template>

<style scoped>

</style>