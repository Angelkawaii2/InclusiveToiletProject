<script setup lang="ts">
import {onUnmounted} from 'vue';
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCurrentData} from "@/stores/currentData"
import {useCurrentGpsStatus} from "@/stores/currentGpsStatus"

const {t} = useI18n();


const data = useCurrentData()
const gpsData = storeToRefs(data).gpsCoord
const timestamp = storeToRefs(data).timestamp

const gpsStatus = useCurrentGpsStatus()

let timer: number | null;

const getGpsLocation = () => {
  console.log("acquiring gps...")
  gpsStatus.isAcquiring = true
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

    gpsStatus.gpsCoords = position.coords
    gpsStatus.gpsTimestamp = position.timestamp
    data.timestamp = position.timestamp

    gpsStatus.deltaSec = 0
    // 成功获取位置后开始计时
    timer = setInterval(() => {
      gpsStatus.deltaSec = Math.round((new Date().getTime() - gpsStatus.gpsTimestamp) / 1000);
    }, 1000); // 每秒递增

    gpsStatus.isAcquiring = false
  }, () => {
    alert(t('ui.gps.check_permission'))
    gpsStatus.isAcquiring = false
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
        <el-button size="large" type="primary" @click="getGpsLocation" v-show=!gpsStatus.isAcquiring>{{
            $t('ui.gps.location.access_gps_location_btn')
          }}
        </el-button>
        <el-button size="large" disabled v-show="gpsStatus.isAcquiring">{{
            $t('ui.gps.location.acquiring_gps_location_btn')
          }}
        </el-button>
      </div>
      <div>
        <!--  超时mark  -->
        <el-text v-if="gpsStatus.isTimeout()">
          {{ $t("ui.gps.status.failed") }}
        </el-text>
        <el-text v-else-if="gpsStatus.deltaSec<60 && gpsData.accuracy>50">
          {{ $t("ui.gps.status.low_accuracy") }}
        </el-text>
        <el-text v-else-if="gpsStatus.deltaSec<60">
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

      <el-input style="width: auto" v-model="gpsData.accuracy" placeholder="waiting" disabled>
        <template #prepend>{{ $t('ui.gps.location.accuracy') }}</template>
        <template #append>{{ $t('ui.gps.location.meter') }}</template>
      </el-input>
      <br>
      <el-text>
        {{ $t('ui.gps.location.delta') }}: {{ gpsStatus.deltaSec }} {{ $t('ui.time.seconds') }}
      </el-text>

    </div>
  </el-card>
</template>

<style scoped>
</style>