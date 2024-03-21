<script setup lang="ts">

import DownloadBtnComponent from "@/components/DownloadBtnComponent.vue";
import TimeSelectorComponent from "@/components/TimeSelectorComponent.vue";
import ToiletTypeSelectorComponent from "@/components/ToiletTypeSelectorComponent.vue";
import GpsLocation from "@/components/GpsLocationComponent.vue";
import AccessibleMetaComponent from "@/components/AccessibleMetaComponent.vue";
import ToiletMetadata from "@/components/ToiletMetadata.vue";
import ImageUploadComponent from "@/components/ImageUploadComponent.vue";
import CommentComponent from "@/components/CommentComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";
import {useCurrentData} from "@/stores/currentData.js";
import {ref} from "vue";

const data = useCurrentData()
let DEBUG = ref(localStorage.getItem("isDebug") === "true" || false); // 这里使用了===来判断是否是字符串"true"，并且使用了.value来访问ref的值

const handleDebugSwitch = (val: string) => {
  localStorage.setItem("isDebug", val);
};

const isAccessbleSelected = (): boolean => {
  return data.toiletType.includes(2)
}
</script>

<template>

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

  <el-switch
      v-model="DEBUG"
      size="large"
      active-text="On"
      inactive-text="Debug Off"
      @change="handleDebugSwitch"
  />


  <debug-json-component v-show="DEBUG"/>

</template>

<style scoped>
.card {
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
}
</style>