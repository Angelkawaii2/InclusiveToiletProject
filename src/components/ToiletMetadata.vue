<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";

const data = useCurrentData()
const toiletMetadata = storeToRefs(data).toiletMetadata
</script>

<template>

  <!--    卫生间信息拓展-->
  <el-card>
    <template #header>
      <h3>{{ $t("ui.metadata.title") }}</h3>
    </template>

    <div class="selector">
      <h4>{{ $t("ui.metadata.isPrivateProperty") }}</h4>
      <el-radio-group v-model="toiletMetadata.isPrivate">
        <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
        <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
        <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.isFree") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.isFree">
        <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
        <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
        <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.hasHook") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasHook">
        <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
        <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
        <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
      </el-radio-group>
    </div>

    <div class="selector">
      <h4>{{ $t("ui.metadata.hasMirror") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasMirror">
        <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
        <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
        <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.hasDryer") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasDryer">
        <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
        <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
        <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.recommendation_title") }}</h4>
      <el-rate v-model="toiletMetadata.score.recommendation" clearable/>
    </div>

  </el-card>
</template>

<style scoped>

</style>