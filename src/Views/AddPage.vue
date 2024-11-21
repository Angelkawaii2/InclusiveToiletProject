<script setup lang="ts">

import DownloadBtnComponent from "@/components/edit/v5/DownloadBtnComponent.vue";
import GpsLocation from "@/components/edit/v5/GpsLocationComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";
import {useCurrentData} from "@/stores/currentData";
import MapComponent from "@/components/edit/v4/MapComponent.vue";
import {useSettingStore} from "@/stores/UseSettingStore";
import {provide} from "vue";
import BasicInfoComponent from "@/components/edit/v5/BasicInfoComponent.vue";
import ToiletTypeSelectorComponent from "@/components/edit/v5/ToiletTypeSelectorComponent.vue";
import ToiletMetadata from "@/components/edit/v5/ToiletProperties.vue";
import CommentComponent from "@/components/edit/v5/CommentComponent.vue";
import ImageUploadComponent from "@/components/edit/v5/ImageUploadComponent.vue";
import TimeSelectorComponent from "@/components/edit/v5/TimeSelectorComponent.vue";
import AccessibleMetadataComponent from "@/components/edit/v5/AccessibleMetadataComponent.vue";

const data = useCurrentData()
const settings = useSettingStore();

provide("currentData", data)

const isAccessibleSelected = (): boolean => {
  return data.types.includes('accessible')
}

const resetData = () => {
  data.reset()
}
</script>

<template>

  <div>
    <MapComponent class="card"/>
    <div class="mx-auto max-w-full">
      <el-button type="danger" @click="resetData()">{{ $t("ui.general.resetAll") }}</el-button>
      <download-btn-component/>
    </div>

    <!--    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">-->

    <!--      <gps-location class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <basic-info-component class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <ToiletTypeSelectorComponent class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <AccessibleMetadataComponent v-if="isAccessibleSelected()"-->
    <!--                                   class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <ToiletMetadata class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <time-selector-component class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <image-upload-component class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <comment-component class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--      <debug-json-component v-show="settings.isDebug" class="flex flex-col justify-start items-stretch h-auto"/>-->
    <!--    </div>-->


    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-auto auto-cols-min p-3">
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg  h-auto min-h-0">
        <gps-location/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg  h-auto min-h-0">
        <basic-info-component/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <ToiletTypeSelectorComponent/>
      </div>
      <div v-if="isAccessibleSelected()"
           class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <AccessibleMetadataComponent/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <ToiletMetadata/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <TimeSelectorComponent/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <ImageUploadComponent/>
      </div>
      <div class="flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <CommentComponent/>
      </div>
      <div v-show="settings.isDebug"
           class=" flex flex-col transition-transform  hover:scale-105 duration-300 hover:shadow-lg">
        <DebugJsonComponent/>
      </div>

    </div>


  </div>
</template>

<style scoped>
.card {
  height: auto;
  min-height: 0; /* 防止强制拉伸 */
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); /* 设置每张卡片宽度范围 */
  gap: 1.5rem; /* 卡片之间的间距 */
  justify-content: center; /* 内容居中 */
  align-content: start; /* 内容从顶部对齐 */
  max-width: 90rem; /* 最大宽度限制，避免过宽 */
  margin: 0 auto; /* 居中页面 */
  padding: 1rem; /* 容器内边距 */
}


.grid-item:hover {
  transform: scale(1.05); /* 放大效果 */
}
</style>