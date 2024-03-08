<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";
import {ref} from "vue";


const {toiletMetadata} = storeToRefs(useCurrentData())

/*
const metadataProperties = ref([
  {ui: 'ui.metadata.isPrivateProperty', modelRef: toiletMetadata.isPrivate},
  {ui: 'ui.metadata.isFree', modelRef: toiletMetadata.isFree},
  {ui: 'ui.metadata.hasHook', modelRef: toiletMetadata.hasHook},
  {ui: 'ui.metadata.hasMirror', modelRef: toiletMetadata.hasMirror},
  {ui: 'ui.metadata.hasDryer', modelRef: toiletMetadata.hasDryer},
]);
*/


</script>

<template>

  <!--    卫生间信息拓展-->
  <el-card>
    <template #header>
      <h3>{{ $t("ui.metadata.title") }}</h3>
    </template>


    <!--    <div class="selector" v-for="prop in metadataProperties" :key="prop.ui">
          <h4>{{ $t(prop.ui) }}</h4>
          <el-radio-group v-model="prop.modelRef">
            <el-radio size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio>
            <el-radio size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio>
            <el-radio size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
          </el-radio-group>
        </div>

        <hr>-->

    <div class="selector">
      <h4>{{ $t("ui.metadata.isPrivateProperty") }}</h4>
      <el-radio-group v-model="toiletMetadata.isPrivate">
        <el-radio-button size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.isFree") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.isFree">
        <el-radio-button size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.hasHook") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasHook">
        <el-radio-button   size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="selector">
      <h4>{{ $t("ui.metadata.hasMirror") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasMirror">
        <el-radio-button size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4>{{ $t("ui.metadata.hasDryer") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasDryer">
        <el-radio-button size="large" :value=true>{{ $t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button size="large" :value=false>{{ $t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button size="large" :value=undefined>{{ $t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="selector">
      <h4 >{{ $t("ui.metadata.recommendation_title") }}</h4>
      <el-rate size="large" v-model="toiletMetadata.score.recommendation" clearable/>
    </div>

  </el-card>
</template>

<style scoped>
h4{
  margin-bottom: 5px;
}
.selector{
  margin-bottom: 10px;
}
</style>