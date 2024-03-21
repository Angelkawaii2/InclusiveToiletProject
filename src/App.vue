<script setup>

import {useI18n} from "vue-i18n";
import {useCurrentData} from "@/stores/currentData.ts"
import {ref} from "vue";
import {useCurrentGpsStatus} from "@/stores/currentGpsStatus.ts";

const {t} = useI18n()

const v = VITE_APP_VERSION
const b = VITE_BUILD_TIME
const isDevVersion = import.meta.env.VITE_IS_DEV_VERSION === "true"

const data = useCurrentData()

const resetData = () => {
  data.reset()
  useCurrentGpsStatus().reset()
}

const font = ref({
  color: 'rgba(0, 0, 0, .08)',
})

const watermark = () => {
  if (isDevVersion) {
    return ['DevVer', v];
  } else {
    return [v]
  }
}

</script>

<template>

  <div>
    <el-watermark :font="font" :content=watermark()>
      <div class="title">
        <div>
          <h2 class="main-title-text">{{ $t("ui.title") }}</h2>
          <el-link target="_blank" href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub
            Project | Version:
            {{ v }} | Build: {{ b }}
          </el-link>
        </div>
        <el-text class="no-warp-text slogan">"{{ $t('ui.slogan') }}"</el-text>
        <el-text v-if="isDevVersion" type="danger">当前分支为 Dev 测试版本</el-text>
        <el-text size="small">Language:</el-text>
        <switch-lang class="language-selector"/>
        <hr>
        <el-button type="danger" @click="resetData()">{{ $t("ui.general.resetAll") }}</el-button>
      </div>


      <el-backtop :right="40" :bottom="100"/>


      <router-view></router-view>
    </el-watermark>
  </div>

</template>

<style scoped>


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
  width: 200px;
  min-width: 100px;
  max-width: 800px;
  //width: auto;
}

.main-title-text {
  font-size: calc(16px + 2vw);
  white-space: nowrap;
}

.no-warp-text {
  width: 100%;
  font-size: 3vw; /* 根据视口宽度动态调整字体大小 */
}
.slogan{
  font-style: italic;
}
@media (min-width: 350px) {
  .no-warp-text {
    font-size: 12px;
  }
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


</style>
