<script setup>

import {useI18n} from "vue-i18n";
import {useCurrentData} from "@/stores/currentData.ts"

const {t} = useI18n()

const v = VITE_APP_VERSION
const b = VITE_BUILD_TIME
const isDevVersion = import.meta.env.VITE_IS_DEV_VERSION === "true"

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
      <el-text>"不向焦虑与抑郁投降，这个世界终会有我们存在的地方。"</el-text>
      <el-text v-if="isDevVersion" type="danger">当前分支为 Dev 测试版本</el-text>
      <el-text size="small">Language:</el-text>
      <switch-lang class="language-selector"/>
      <hr>
      <el-button type="danger" @click="data.reset()">{{ $t("ui.general.resetAll") }}</el-button>
    </div>


    <el-backtop :right="40" :bottom="100"/>


    <router-view></router-view>
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
