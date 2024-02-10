<script setup>

import {ref, watchEffect} from "vue";
import SwitchLang from "@/components/SwitchLang.vue";
import {useI18n} from "vue-i18n";
import {Plus} from '@element-plus/icons-vue'

const {t} = useI18n()

let DEBUG = ref(false)

const toiletTypeMap = {
  'ui.toilet_type.binary': 1,
  'ui.toilet_type.accessible': 2,
  'ui.toilet_type.unisex': 3,
  'ui.toilet_type.undefined': -1
}


const data = ref({
  version: 20240210,
  timestamp: 0,
  gpsCoord: {
    "lat": null,
    "lon": null,
    "alt": null,
    "accuracy": null,
    "type": "wgs84"
  },
  toiletType: [],
  time: {
    allDay: false,
    time: [
      new Date(0, 0, 0, 8, 0),
      new Date(0, 0, 0, 21, 0),
    ],
  },
  img: [],
  comments: null
})

const databaseStatus = ref({
  "access": false
})

let deltaSec = ref(null);


const getGpsLocation = ref(() => {
      if (!navigator.geolocation) {
        alert(t('ui.unsupported_browser'));
        return
      }
      navigator.geolocation.getCurrentPosition((position) => {
        Object.assign(data.value.gpsCoord, {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          alt: position.coords.altitude,
          accuracy: position.coords.accuracy,
        })
        data.value.timestamp = position.timestamp
        console.log(position.coords)
      }, () => {
        alert(t('ui.gps_acquire_failed_check_permission'))
      });
    }
)

let timeDifference = ref('');

watchEffect(() => {
  setInterval(() => {
    const diff = Date.now() - data.value.timestamp;
    if (data.value.timestamp === 0) {
      timeDifference.value = t('ui.time.waiting'); // "Waiting..."
      return
    }
    deltaSec = Math.floor(diff / 1000)

    if (diff < 60000) {
      timeDifference.value = `${Math.floor(diff / 1000)}${t('ui.time.seconds_ago')}`; // "秒前"
    } else if (diff < 3600000) {
      let min = `${Math.floor(diff / 60000)}`;
      timeDifference.value = `${min}${t('ui.time.minutes_ago')} (${Math.floor(diff / 1000)})${t('ui.time.seconds')}`; // "分钟前" "秒"
    } else {
      timeDifference.value = `${Math.floor(diff / 3600000)}${t('ui.time.hours_ago')}`; // "小时前"
    }
  }, 1000);
});
/*const requestsDb = window.indexedDB.open("data", 1)
requestsDb.onerror = (e) => {
  alert("无法使用indexedDb" + e)
}

let db;
requestsDb.onsuccess = (e) => {
  //alert("success")
  databaseStatus.value.access = true
  db = e.target.result
}

db.onerror = (event) => {
  // 针对此数据库请求的所有错误的通用错误处理器！
  console.error(`数据库错误：${event.target.errorCode}`);
};*/

// import type {UploadProps, UploadUserFile} from 'element-plus'

//

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


    <img alt="Trans logo" class="logo" src="./assets/logo.svg" width="125" height="125"/>
    <switch-lang></switch-lang>

    <h2>{{ $t("ui.title") }}</h2>

    <div>
      <el-button @click="getGpsLocation">{{ $t('ui.gps.access_gps_location_btn') }}</el-button>
      <!--  超时mark  -->
      <el-text v-if="deltaSec==null">
        ❌
      </el-text>
      <el-text v-else-if="deltaSec<60">
        ✅
      </el-text>
      <el-text v-else>⚠️</el-text>
    </div>


    <div>
      <el-input v-model="data.gpsCoord.lon" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.longitude') }}</template>
      </el-input>
      <el-input v-model="data.gpsCoord.lat" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.latitude') }}</template>
      </el-input>

      <el-input v-model="data.gpsCoord.accuracy" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.accuracy') }}</template>
        <template #append>{{ $t('ui.gps.meter') }}</template>
      </el-input>
      <el-input v-model="timeDifference" placeholder="delta" disabled>
        <template #prepend>{{ $t('ui.gps.delta') }}</template>
      </el-input>

    </div>

    <div>
      <p>{{ $t('ui.toilet_type.title') }}</p>
      <el-checkbox-group v-model="data.toiletType">
        <el-checkbox-button v-for="(v,k) in toiletTypeMap" :key="k" :label="v">
          {{ $t(k) }} -- {{ v }}
        </el-checkbox-button>
      </el-checkbox-group>
    </div>


    <div>
      <p>{{ $t('ui.time.selector_title') }}</p>
      <el-button @click="data.time.allDay = !data.time.allDay"> {{
          $t(data.time.allDay ? 'ui.time.allday.true' : 'ui.time.allday.false')
        }}
      </el-button>
      <el-time-picker
          v-if="!data.time.allDay"
          v-model="data.time.time"
          is-range
          :disabled-seconds="()=>Array.from({length: 59}, (_, i) => i + 1)"
          range-separator="To"
          start-placeholder="Start time"
          end-placeholder="End time"
      />
    </div>

    <div>
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
    </div>

    <div>
      <el-input type="textarea" rows="3" placeholder="备注" v-model="data.comments">

      </el-input>
    </div>

    <div>
      <el-button type="success" @click="downloadData" :disabled="data.timestamp===0||data.gpsCoord.lon==null">SAVE
      </el-button>
      <el-text type="danger" v-show="data.timestamp===0||data.gpsCoord.lon==null">{{ $t("ui.gps_acquire.gps_no_data") }}</el-text>
      <el-text type="warning" v-show="deltaSec>60">{{ $t("ui.gps_acquire.gps_expired") }}</el-text>
    </div>


    <el-button style="margin-top: 50px" @click="DEBUG=!DEBUG">Debug</el-button>

    <div style="margin-top: 50px" v-show="DEBUG">
      <h1>测试</h1>
      <h3>输出数据</h3>
      <pre>
        {{ JSON.stringify(data, null, 2) }}
      </pre>

      <div>
        <h3>当前数据条数: </h3>

      </div>
      <div>
        <el-button :type="'success'"> 点击导出所有数据</el-button>
        <el-button :type="'danger'"> 点击删除所有数据</el-button>
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
</style>
