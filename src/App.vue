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

  <div>

    <!--part 1 title-->
    <el-row :gutter="10">

      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <switch-lang/>
      </el-col>

      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div>
          <h2>{{ $t("ui.title") }}</h2>
          <el-link href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub
            Project | Version:
            {{ v }} | Build: {{ buildTime }}
          </el-link>
        </div>
      </el-col>
    </el-row>


    <el-backtop :right="40" :bottom="100"/>


    <!--part 2 gps-->
    <el-row :gutter="10">

      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="9">
        <!--    位置定位-->
        <gps-location/>
        <!--类型选择-->
        <toilet-type-selector-component/>
        <accessible-meta-component v-show="data.toiletType.includes(2)"/>
      </el-col>


      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="10">
        <toilet-metadata/>
        <time-selector-component/>
      </el-col>


      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="10">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12" :md="24" :lg="24" :xl="24">
            <image-upload-component/>
          </el-col>
          <el-col :xs="24" :sm="12" :md="24" :lg="24" :xl="24">
            <comment-component/>
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
div {
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
