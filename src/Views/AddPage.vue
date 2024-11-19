<script setup lang="ts">

import DownloadBtnComponent from "@/components/edit/DownloadBtnComponent.vue";
import TimeSelectorComponent from "@/components/edit/TimeSelectorComponent.vue";
import ToiletTypeSelectorComponent from "@/components/edit/ToiletTypeSelectorComponent.vue";
import GpsLocation from "@/components/edit/GpsLocationComponent.vue";
import AccessibleMetaComponent from "@/components/edit/AccessibleMetaComponent.vue";
import ToiletMetadata from "@/components/edit/ToiletMetadata.vue";
import ImageUploadComponent from "@/components/edit/ImageUploadComponent.vue";
import CommentComponent from "@/components/edit/CommentComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";
import {useCurrentData} from "@/stores/currentData";
import MapComponent from "@/components/edit/MapComponent.vue";
import {useCurrentGpsStatus} from "@/stores/currentGpsStatus";
import {useSettingStore} from "@/stores/UseSettingStore";

const data = useCurrentData()
const settings = useSettingStore();

const isAccessbleSelected = (): boolean => {
  return data.toiletType.includes(2)
}
const resetData = () => {
  data.reset()
  useCurrentGpsStatus().reset()
}
</script>

<template>
  <div>
    <el-button type="danger" @click="resetData()">{{ $t("ui.general.resetAll") }}</el-button>
    <MapComponent class="card"/>
    <!--part 2 gps-->
    <el-row :gutter="10">

      <el-col :xs="24" :sm="12" :md="isAccessbleSelected()?8:12" :lg="isAccessbleSelected()?8:12"
              :xl="isAccessbleSelected()?8:9">
        <!--    位置定位-->
        <gps-location class="card"/>
        <!--类型选择-->
        <toilet-type-selector-component class="card"/>
        <accessible-meta-component class="card" v-show="isAccessbleSelected() "/>
        <toilet-metadata v-show="!isAccessbleSelected() " class="card"/>
      </el-col>


      <el-col :xs="24" :sm="12" :md="isAccessbleSelected()?8:12" :lg="isAccessbleSelected()?8:12"
              :xl="isAccessbleSelected()?8:8">
        <toilet-metadata v-show="isAccessbleSelected() " class="card"/>
        <time-selector-component class="card"/>
        <div v-show="!isAccessbleSelected() ">
          <image-upload-component class="card"/>
          <comment-component class="card"/>
        </div>
      </el-col>


      <el-col :xs="24" :sm="24" :md="8" :lg="isAccessbleSelected()?8:0" :xl="isAccessbleSelected()?8:0"
              v-show="isAccessbleSelected() ">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12" :md="24" :lg="24" :xl="24">
            <image-upload-component class="card"/>
          </el-col>
          <el-col :xs="24" :sm="12" :md="24" :lg="24" :xl="24">
            <comment-component class="card"/>
          </el-col>
        </el-row>
      </el-col>

    </el-row>


    <download-btn-component/>

    <debug-json-component v-show="settings.isDebug"/>

  </div>
</template>

<style scoped>
.card {
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
}
</style>