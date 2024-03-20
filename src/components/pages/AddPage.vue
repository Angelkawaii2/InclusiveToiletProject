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
</script>

<template>

  <!--part 2 gps-->
  <el-row :gutter="10">

    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="9">
      <!--    位置定位-->
      <gps-location class="card"/>
      <!--类型选择-->
      <toilet-type-selector-component class="card"/>
      <accessible-meta-component class="card" v-show="data.toiletType.includes(2) "/>
    </el-col>


    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="10">
      <toilet-metadata class="card"/>
      <time-selector-component class="card"/>
    </el-col>


    <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="10">
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
}
</style>