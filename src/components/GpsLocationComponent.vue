<script setup lang="ts">
import {onUnmounted, ref, watch, watchEffect} from 'vue';
import {useI18n} from "vue-i18n";

const {t} = useI18n();

const emit = defineEmits(['update:gpsCoord'])

interface GpsCoord {
  lat?: number;
  lon?: number;
  alt?: number;
  accuracy?: number;
  type: string;
}

const props = withDefaults(defineProps<{
  gpsData?: GpsCoord;
  timestamp?: number;
}>(), {
  gpsData: () => ({
    lat: null,
    lon: null,
    alt: null,
    accuracy: null,
    type: "wgs84"
  }),
  timestamp: 0
})

const gpsData = ref(props.gpsData);
const timeStamp = ref(props.timestamp)

//todo 这里watch逻辑有点问题
watch(() => props.gpsData, (newVal) => {
  if (deltaSec.value > 0) {
    clearInterval(timer)
  }
  gpsData.value = newVal;
  deltaSec.value = -1
  //clearInterval(timer)
}, {deep: true});

watch(() => props.timestamp, (newVal) => {
  timeStamp.value = newVal;
  deltaSec.value = -1
  //clearInterval(timer)
}, {deep: true});

let isAcquiring = ref(false)

let deltaSec = ref(-1);
let timer = null;

const getGpsLocation = () => {
  console.log("acquiring gps...")
  isAcquiring.value = true
  if (!navigator.geolocation) {
    alert(t('ui.unsupported_browser'));
    return
  }
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position)
    Object.assign(gpsData.value, {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      alt: position.coords.altitude,
      accuracy: position.coords.accuracy,
    })
    timeStamp.value = position.timestamp;
    //console.log(position.coords);


    deltaSec.value = 0
    // 成功获取位置后开始计时
    timer = setInterval(() => {
      deltaSec.value += 1;
    }, 1000); // 每秒递增

    isAcquiring.value = false
    emit('update:gpsCoord', {"GpsCoord": gpsData.value, "timestamp": timeStamp.value});
  }, () => {
    alert(t('ui.gps.check_permission'))
    isAcquiring.value = false
  });

};


onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3> {{ $t("ui.gps.title") }}</h3>
        <el-button @click="getGpsLocation" :disabled=isAcquiring>{{
            $t('ui.gps.location.access_gps_location_btn')
          }}
        </el-button>
      </div>
      <div>
        <!--  超时mark  -->
        <el-text v-if="deltaSec==-1">
          {{ $t("ui.gps.status.failed") }}
        </el-text>
        <el-text v-else-if="deltaSec<60 && gpsData.accuracy>50">
          {{ $t("ui.gps.status.low_accuracy") }}
        </el-text>
        <el-text v-else-if="deltaSec<60">
          {{ $t("ui.gps.status.success") }}
        </el-text>
        <el-text v-else>{{ $t("ui.gps.status.outdated") }}</el-text>
      </div>
    </template>

    <div>
      <el-input v-model="gpsData.lon" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.location.longitude') }}</template>
      </el-input>
      <el-input v-model="gpsData.lat" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.location.latitude') }}</template>
      </el-input>

      <el-input style="width: 200px" v-model="gpsData.accuracy" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.location.accuracy') }}</template>
        <template #append>{{ $t('ui.gps.location.meter') }}</template>
      </el-input>
      <br>
      <el-text>
        {{ $t('ui.gps.location.delta') }}: {{ deltaSec }} {{ $t('ui.time.seconds') }}
      </el-text>

    </div>
  </el-card>
</template>

<style scoped>
.el-input {
  margin: 5px;
}
</style>