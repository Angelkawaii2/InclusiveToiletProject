<script setup>

import {computed, ref, watch, watchEffect} from "vue";
import SwitchLang from "@/components/SwitchLang.vue";
import {useI18n} from "vue-i18n";
import {Plus} from '@element-plus/icons-vue'
import UpgradeNotification from "@/components/UpgradeNotification.vue";
import GpsLocation from "@/components/GpsLocationComponent.vue";
import ToiletTypeSelectorComponent from "@/components/ToiletTypeSelectorComponent.vue";
import {useCurrentData} from "@/stores/currentData.js"
import {storeToRefs} from "pinia";

const {t} = useI18n()

let DEBUG = ref(localStorage.getItem("isDebug") === "true" || false); // 这里使用了===来判断是否是字符串"true"，并且使用了.value来访问ref的值


const handleDebugSwitch = (val) => { // 这里使用了一个普通的函数，而不是ref
  //console.log(val)
  localStorage.setItem("isDebug", val); // 这里没有问题
};


//const data = ref(initData())

const store = useCurrentData()
const data = storeToRefs(store)


const renderedJsonData = computed(() => {
      return JSON.stringify(data, null, 2)
    }
)


const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

const beforeUpload = async (uploadFile) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.src = e.target.result;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 计算新的尺寸
    const maxSize = 1200;
    let {width, height} = img;
    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
    }

    // 调整canvas的大小并绘制图片
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // 获取压缩后的图片
    const base64Url = canvas.toDataURL('image/jpeg', 0.8);
    data.value.img.push({
      name: uploadFile.name,
      url: base64Url,
      status: 'success',
    });
  };
  reader.readAsDataURL(uploadFile);
  return false; // 阻止默认的上传行为
}

function downloadData() {
  const blob = new Blob([JSON.stringify(data.value, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = data.value.timestamp + '.json';
  link.click();

  // 释放URL对象
  URL.revokeObjectURL(url);
}


</script>

<template>
  <div class="blur-background"></div>
  <div class="content">

    <upgrade-notification></upgrade-notification>

    <div v-if="false">
      <img alt="Trans logo" class="logo" src="./assets/logo.svg" width="10%" height="10%"/>
    </div>

    <switch-lang></switch-lang>

    <div style="margin-bottom: 10px">
      <h2>{{ $t("ui.title") }}</h2>
      <el-link style="margin: auto" href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub
        Project | Version:
        {{ APP_VERSION }} | Build: {{ buildTime }}
      </el-link>
    </div>

    <el-backtop :right="40" :bottom="100"/>

    <el-button type="danger" @click="handleReset">{{ $t("ui.general.resetAll") }}</el-button>

    <!--    位置定位-->
    <gps-location @update:gps-coord="handleGpsUpdate" :gps-data=data.gpsCoord :timestamp=undefined></gps-location>

    <!--类型选择-->
    <toilet-type-selector-component></toilet-type-selector-component>






    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ $t('ui.photo.title') }}</h3>
        </div>
      </template>
      <el-upload
          v-model:file-list="data.img"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
      >
        <el-icon>
          <Plus/>
        </el-icon>
      </el-upload>

      <el-dialog v-model="dialogVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image"/>
      </el-dialog>
    </el-card>

    <div>
      <el-input type="textarea" rows="3" placeholder="备注" v-model="data.comments"/>
    </div>

    <div>
      <el-button type="success" @click="downloadData" :disabled="data.timestamp===0||data.gpsCoord.lon==null">SAVE
      </el-button>
      <el-text type="danger" v-show="data.timestamp===0||data.gpsCoord.lon==null">{{
          $t("ui.gps.acquire.gps_no_data")
        }}
      </el-text>
      <el-text type="warning" v-show="deltaSec>60">{{ $t("ui.gps.acquire.gps_expired") }}</el-text>
    </div>


    <el-switch
        v-model="DEBUG"
        size="large"
        active-text="On"
        inactive-text="Debug Off"
        @change="handleDebugSwitch"
    />

    <div style="margin-top: 50px" v-if="DEBUG">
      <h1>DEBUG PAGE</h1>
      <el-text> 版本: {{ APP_VERSION }}</el-text>
      <hr>
      <el-text> 编译时间: {{ buildTime }}</el-text>
      <h3>Output</h3>
      <el-button v-if="false" @click="navigator.clipboard.writeText(renderedJsonData)">COPY</el-button>

      <!--      <pre>-->
      <!--        {{ JSON.stringify(data, null, 2) }}-->
      <!--      </pre>-->
      <el-input
          v-model=renderedJsonData
          :autosize="{ minRows: 2 }"
          type="textarea"
          show-word-limit
          readonly
      />
      <span v-if="false">预计文件大小: </span>

      <div v-if="false">
        <h3>当前数据条数: </h3>
      </div>

      <div v-if="false">
        <el-button :type="'success'" disabled> 点击导出所有数据</el-button>
        <el-button :type="'danger'" disabled> 点击删除所有数据</el-button>
      </div>
    </div>

  </div>

</template>

<style scoped>
div {
  margin-top: 10px;
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
      30deg,
      rgba(86, 205, 252, 0.1) 0%, /* 蓝色，透明度60% */ rgba(86, 205, 252, 0.1) 10%,
      rgba(255, 255, 255, 0.1) 10%, /* 白色，透明度60% */ rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 105, 180, 0.1) 20%, /* 粉色，透明度60% */ rgba(255, 105, 180, 0.1) 30%,
      rgba(86, 205, 252, 0.1) 30% /* 蓝色，透明度60% */
  );

}

.content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
