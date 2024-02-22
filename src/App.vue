<script setup>

import {computed, ref, watch, watchEffect} from "vue";
import SwitchLang from "@/components/SwitchLang.vue";
import {useI18n} from "vue-i18n";
import {Plus} from '@element-plus/icons-vue'

const {t} = useI18n()

let DEBUG = ref(localStorage.getItem("isDebug") === "true" || false); // 这里使用了===来判断是否是字符串"true"，并且使用了.value来访问ref的值


const APP_VERSION = __APP_VERSION__

const handleDebugSwitch = (val) => { // 这里使用了一个普通的函数，而不是ref
                                     //console.log(val)
  localStorage.setItem("isDebug", val); // 这里没有问题
};

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
  toiletType: [1],
  toiletMetadata: {
    isPrivate: false,//是否位于私人资产中（酒店、公司等）
    accessible: {//无障碍卫生间相关
      isInBinary: false,//是否位于二元性别的卫生间内（有些奇葩厕所是这样）
      isLocked: false,// 第三卫生间是否被锁上，取值true/false/null?
    },
    extra: {
      hasHook: undefined,//是否存在衣服挂钩
      isFree: true,//是否免费
      hasDryer: undefined,//是否存在烘干机
      hasMirror: undefined,//是否有镜子
    },
    score: {
      recommendation: 0
    }
  },
  time: {
    unknown: false,
    allDay: false,
    startTime: "08:00",
    endTime: "22:00",
  },
  img: [],
  comments: null
})

const handleReset = ref(() => {
  deltaSec = null
  data.value = {
    version: 20240210,
    timestamp: 0,
    gpsCoord: {
      "lat": null,
      "lon": null,
      "alt": null,
      "accuracy": null,
      "type": "wgs84"
    },
    toiletType: [1],
    toiletMetadata: {
      isPrivate: false,//是否位于私人资产中（酒店、公司等）
      accessible: {//无障碍卫生间相关
        isInBinary: false,//是否位于二元性别的卫生间内（有些奇葩厕所是这样）
        isLocked: false,// 第三卫生间是否被锁上，取值true/false/null?
      },
      extra: {
        hasHook: undefined,//是否存在衣服挂钩
        isFree: true,//是否免费
        hasDryer: undefined,//是否存在烘干机
        hasMirror: undefined,//是否有镜子
      },
      score: {
        recommendation: 0
      }
    },
    time: {
      unknown: false,
      allDay: false,
      startTime: "08:00",
      endTime: "22:00",
    },
    img: [],
    comments: null
  }
})

const renderedJsonData = computed(() => {
      return JSON.stringify(data.value, null, 2)
    }
)

/*const calcIsPrivate = computed(()=>{
  if (data.value.toiletMetadata.isPrivate === null) {
    return 1
  }else if (data.value.toiletMetadata.isPrivate){
    return 0
  }
  return 2
})*/

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
        alert(t('ui.gps.check_permission'))
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
      timeDifference.value = `${Math.floor(diff / 1000)} ${t('ui.time.seconds_ago')}`; // "秒前"
    } else if (diff < 3600000) {
      let min = `${Math.floor(diff / 60000)}`;
      timeDifference.value = `${min}${t('ui.time.minutes_ago')} (${Math.floor(diff / 1000)})${t('ui.time.seconds')}`; // "分钟前" "秒"
    } else {
      timeDifference.value = `${Math.floor(diff / 3600000)}${t('ui.time.hours_ago')}`; // "小时前"
    }
  }, 500);
});


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

const handleChange = (val) => {
  // 这里是你的点击事件处理函数，你可以根据你的需求来修改
  console.log("selected value:", val);
};

</script>

<template>
  <div class="blur-background"></div>
  <div class="content">

    <div v-if="false">
      <img alt="Trans logo" class="logo" src="./assets/logo.svg" width="10%" height="10%"/>
    </div>

    <switch-lang></switch-lang>

    <div style="margin-bottom: 10px">
      <h2>{{ $t("ui.title") }}</h2>
      <el-link style="margin: auto" href="https://github.com/Angelkawaii2/InclusiveToiletProject" type="primary">GitHub Project | Deploy Version:
        {{ APP_VERSION}}</el-link>
    </div>

    <el-backtop :right="40" :bottom="100"/>

    <el-button type="danger" @click="handleReset">{{ $t("ui.general.resetAll") }}</el-button>

    <!--    位置定位-->
    <el-card>
      <template #header>
        <div class="card-header">
          <h3> {{ $t("ui.gps.title") }}</h3>
          <el-button @click="getGpsLocation">{{ $t('ui.gps.location.access_gps_location_btn') }}</el-button>
        </div>
        <div>
          <!--  超时mark  -->
          <el-text v-if="deltaSec==null">
            {{ $t("ui.gps.status.failed") }}
          </el-text>
          <el-text v-else-if="deltaSec<60 && data.gpsCoord.accuracy>50">
            {{ $t("ui.gps.status.low_accuracy") }}
          </el-text>
          <el-text v-else-if="deltaSec<60">
            {{ $t("ui.gps.status.success") }}
          </el-text>
          <el-text v-else>{{ $t("ui.gps.status.outdated") }}</el-text>
        </div>
      </template>

      <div>
        <el-input v-model="data.gpsCoord.lon" placeholder="waiting" disabled>
          <template #prepend>{{ $t('ui.gps.location.longitude') }}</template>
        </el-input>
        <el-input v-model="data.gpsCoord.lat" placeholder="waiting" disabled>
          <template #prepend>{{ $t('ui.gps.location.latitude') }}</template>
        </el-input>

        <el-input v-model="data.gpsCoord.accuracy" placeholder="waiting" disabled>
          <template #prepend>{{ $t('ui.gps.location.accuracy') }}</template>
          <template #append>{{ $t('ui.gps.location.meter') }}</template>
        </el-input>
        <el-input v-model="timeDifference" placeholder="delta" disabled>
          <template #prepend>{{ $t('ui.gps.location.delta') }}</template>
        </el-input>

      </div>
    </el-card>

    <!--类型选择-->
    <el-card>
      <template #header>
        <h3>{{ $t('ui.toilet_type.title') }}</h3>
      </template>
      <el-checkbox-group v-model="data.toiletType">
        <el-checkbox style="margin: 5px" size="large" border v-for="(v,k) in toiletTypeMap" :key="k" :label="v">
          {{ $t(k) }}
        </el-checkbox>
      </el-checkbox-group>
    </el-card>

    <!--    第三卫生间拓展-->
    <el-card v-show="data.toiletType.includes(2)">
      <template #header>
        <h3>{{ $t("ui.accessible_extend.title") }}</h3>

        <div class="selector">
          <h4>{{ $t("ui.accessible_extend.isLocked") }}</h4>
          <el-radio-group v-model="data.toiletMetadata.accessible.isLocked">
            <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
            <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
            <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
          </el-radio-group>
        </div>

        <div class="selector">
          <h4>{{ $t("ui.accessible_extend.isInBinary") }}</h4>
          <el-radio-group v-model="data.toiletMetadata.accessible.isInBinary">
            <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
            <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
            <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
          </el-radio-group>
        </div>
      </template>


    </el-card>

    <!--    卫生间信息拓展-->
    <el-card>
      <template #header>
        <h3>{{ $t("ui.metadata.title") }}</h3>
      </template>

      <div class="selector">
        <h4>{{ $t("ui.metadata.isPrivateProperty") }}</h4>
        <el-radio-group v-model="data.toiletMetadata.isPrivate">
          <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>
      <div class="selector">
        <h4>{{ $t("ui.metadata.isFree") }}</h4>
        <el-radio-group v-model="data.toiletMetadata.extra.isFree">
          <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>
      <div class="selector">
        <h4>{{ $t("ui.metadata.hasHook") }}</h4>
        <el-radio-group v-model="data.toiletMetadata.extra.hasHook">
          <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>

      <div class="selector">
        <h4>{{ $t("ui.metadata.hasMirror") }}</h4>
        <el-radio-group v-model="data.toiletMetadata.extra.hasMirror">
          <el-radio :label=true>{{ $t("ui.general.select.yes") }}</el-radio>
          <el-radio :label=false>{{ $t("ui.general.select.no") }}</el-radio>
          <el-radio :label=undefined>{{ $t("ui.general.select.unknown") }}</el-radio>
        </el-radio-group>
      </div>
      <div class="selector">
        <h4>{{ $t("ui.metadata.recommendation_title") }}</h4>
        <el-rate v-model="data.toiletMetadata.score" clearable/>
      </div>
    </el-card>


    <!--时间选择-->
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ $t('ui.time.title') }}</h3>
          <el-button @click="data.time.unknown=!data.time.unknown">
            {{ data.time.unknown ? $t("ui.time.create") : $t("ui.time.remove") }}
          </el-button>
        </div>
      </template>


      <div v-if="!data.time.unknown">
        <!--        <el-button @click="data.time.allDay = !data.time.allDay"> {{
                    $t(data.time.allDay ? 'ui.time.is24Hour.true' : 'ui.time.is24Hour.false')
                  }}
                </el-button>-->
        <el-switch
            v-model="data.time.allDay"
            class="mb-2"
            :active-text="$t('ui.time.is24Hour.true')"
            :inactive-text="$t('ui.time.is24Hour.false')"
        />
        <!--        时间选择器-->
        <div v-if="!data.time.allDay">
          <el-time-select
              v-model="data.time.startTime"
              start="00:00"
              step="00:30"
              end="24:00"
          />
          <div>
          </div>
          <el-time-select
              v-model="data.time.endTime"
              start="00:00"
              step="00:30"
              end="24:00"
          />
        </div>
      </div>
    </el-card>

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
      <el-input type="textarea" rows="3" placeholder="备注" v-model="data.comments">

      </el-input>
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
      <span>预计文件大小: </span>

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
