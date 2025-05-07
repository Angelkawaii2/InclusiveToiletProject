<script lang="ts" setup>

import DownloadBtnComponent from "@/components/edit/v5/DownloadBtnComponent.vue";
import GpsLocationComponent from "@/components/edit/v5/GpsLocationComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";
import {useCurrentData} from "@/stores/currentData";
import MapComponent from "@/components/edit/v4/MapComponent.vue";
import {useSettingStore} from "@/stores/UseSettingStore";
import {computed, provide} from "vue";
import BasicInfoComponent from "@/components/edit/v5/BasicInfoComponent.vue";
import ToiletTypeSelectorComponent from "@/components/edit/v5/ToiletTypeSelectorComponent.vue";
import ToiletMetadata from "@/components/edit/v5/ToiletProperties.vue";
import CommentComponent from "@/components/edit/v5/CommentComponent.vue";
import ImageUploadComponent from "@/components/edit/v5/ImageUploadComponent.vue";
import TimeSelectorComponent from "@/components/edit/v5/TimeSelectorComponent.vue";
import AccessibleMetadataComponent from "@/components/edit/v5/AccessibleMetadataComponent.vue";
import {useI18n} from "vue-i18n";

const data = useCurrentData()
const settings = useSettingStore();
const {t} = useI18n()

provide("currentData", data)

const isAccessibleSelected = (): boolean => {
  return data.types.includes('accessible')
}

const resetData = () => {
  data.reset()
}

//const clazz = "grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2  p-3"

const clz2 = "auto-rows-auto transition-transform  hover:scale-105 duration-300 hover:shadow-lg  h-auto min-h-0 "

const comp = computed(() => {
  return [
    {comp: GpsLocationComponent, cond: true}, // 已有格式
    {comp: BasicInfoComponent, cond: true}, // 修改后的格式
    {comp: ToiletTypeSelectorComponent, cond: true},
    {comp: AccessibleMetadataComponent, cond: isAccessibleSelected()},
    {comp: ToiletMetadata, cond: true},
    {comp: TimeSelectorComponent, cond: true},
    {comp: ImageUploadComponent, cond: true},
    {comp: CommentComponent, cond: true},
    {comp: DebugJsonComponent, cond: settings.isDebug}
  ];
})

</script>

<template>

  <div>
    <MapComponent class="card"/>

    <div class="flex justify-evenly items-stretch">
      <span class="">
        <el-button type="danger" @click="resetData()">{{ t("ui.general.resetAll") }}</el-button>
      </span>
      <span>
        <download-btn-component/>
      </span>
    </div>

    <div
        class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 p-4">


      <div v-for="item in comp"
           class="row-auto mb-2 transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <component :is="item.comp" v-show="item.cond"/>
      </div>

    </div>


  </div>
</template>

<style scoped>
.card {
  height: auto;
  min-height: 0; /* 防止强制拉伸 */
}
</style>