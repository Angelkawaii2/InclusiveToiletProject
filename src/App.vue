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

const handleDebugSwitch = (val) => { // 这里使用了一个普通的函数，而不是ref
  localStorage.setItem("isDebug", val); // 这里没有问题
};

const v = VITE_APP_VERSION
const b = VITE_BUILD_TIME

//const store = useCurrentData()
const data = useCurrentData()


</script>

<template>

  <div id="app">

    <switch-lang/>

    <div >
      <h2>{{ $t("ui.title") }}</h2>
      <el-link  href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub
        Project | Version:
        {{ v }} | Build: {{ buildTime }}
      </el-link>
    </div>

    <!--    todo 什么玩意？-->
    <el-backtop :right="40" :bottom="100"/>

    <!--    位置定位-->
    <gps-location/>

    <!--类型选择-->
    <toilet-type-selector-component/>

    <accessible-meta-component v-show="data.toiletType.includes(2)"/>

    <!--    todo 从这里开始横屏-->

    <toilet-metadata/>

    <time-selector-component/>

    <image-upload-component/>

    <comment-component/>

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
div {
  margin-top: 10px;
}

#app::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
      30deg,
      rgba(86, 205, 252, 0.1) 0%,
      rgba(86, 205, 252, 0.1) 10%,
      rgba(255, 255, 255, 0.1) 10%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 105, 180, 0.1) 20%,
      rgba(255, 105, 180, 0.1) 30%,
      rgba(86, 205, 252, 0.1) 30%
  );
  z-index: -1;
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
