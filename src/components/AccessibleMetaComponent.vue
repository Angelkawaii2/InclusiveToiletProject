<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";

const data = useCurrentData()
const toiletMeta = storeToRefs(data).toiletMetadata

</script>

<template>

  <!--    第三卫生间拓展-->
  <el-card>
    <template #header>
      <h3>{{ $t("ui.accessible_extend.title") }}</h3>

      <div class="selector">
        <h4>{{ $t("ui.accessible_extend.isLocked") }}</h4>
        <el-radio-group v-model="toiletMeta.accessible.isLocked">
          <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>

      <div class="selector">
        <h4>{{ $t("ui.accessible_extend.isInBinary") }}</h4>
        <el-radio-group v-model="toiletMeta.accessible.isInBinary">
          <el-radio :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :value=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>
    </template>


  </el-card>
</template>

<style scoped>

</style>