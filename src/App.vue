<script setup>

import {ref} from "vue";
import {useI18n} from "vue-i18n";
import GpsLocation from "@/components/GpsLocationComponent.vue";
import ToiletTypeSelectorComponent from "@/components/ToiletTypeSelectorComponent.vue";
import {useCurrentData} from "@/stores/currentData.ts"
import AccessibleMetaComponent from "@/components/AccessibleMetaComponent.vue";
import ToiletMetadata from "@/components/ToiletMetadata.vue";
import TimeSelectorComponent from "@/components/TimeSelectorComponent.vue";
import ImageUploadComponent from "@/components/ImageUploadComponent.vue";
import CommentComponent from "@/components/CommentComponent.vue";
import DownloadBtnComponent from "@/components/DownloadBtnComponent.vue";
import DebugJsonComponent from "@/components/debug/DebugJsonComponent.vue";

const {t} = useI18n()

let DEBUG = ref(localStorage.getItem("isDebug") === "true" || false); // 这里使用了===来判断是否是字符串"true"，并且使用了.value来访问ref的值

const handleDebugSwitch = (val) => {
  localStorage.setItem("isDebug", val);
};

const v = VITE_APP_VERSION
const b = VITE_BUILD_TIME
const isDevVersion = import.meta.env.VITE_IS_DEV_VERSION==="true"

const data = useCurrentData()

</script>

<template>

  <div>

    <div class="title">
      <div>
        <h2 class="main-title-text">{{ $t("ui.title") }}</h2>
        <el-link target="_blank" href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub
          Project | Version:
          {{ v }} | Build: {{ b }}
        </el-link>
      </div>
      <el-text v-if="isDevVersion" type="danger">当前分支为 Dev 测试版本</el-text>
      <el-text size="small">Language:</el-text>
      <switch-lang class="language-selector"/>
      <hr>
      <el-button type="danger" @click="data.reset()">{{ $t("ui.general.resetAll") }}</el-button>
    </div>


    <el-backtop :right="40" :bottom="100"/>

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
  </div>

</template>

<style scoped>
.card {
  margin-bottom: 10px;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 10px;
}

.language-selector {
  min-width: 100px;
  max-width: 800px;
  width: auto;
}

.main-title-text {
  font-size: calc(16px + 2vw);
  white-space: nowrap;
}

@media (min-width: 800px) {
  .main-title-text {
    font-size: calc(16px + 1vw);
  }
}

@media (min-width: 1500px) {
  .main-title-text {
    font-size: calc(30px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
