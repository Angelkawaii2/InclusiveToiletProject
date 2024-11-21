<script setup lang="ts">
import {inject, ref} from 'vue';
import {useI18n} from "vue-i18n";
import {StoreGeneric, storeToRefs} from "pinia";
import {notifyError} from "@/Utils/Notify";
import {Loc} from "@/types/ToiletData-V5";

const {t} = useI18n();
const data = inject("currentData") as StoreGeneric
const gpsData = storeToRefs(data).loc


const ERROR = GeolocationPositionError;
let isAcquiring = ref(false);
let errorCode = ref(-1);

const getGpsLocation = () => {
  isAcquiring.value = true
  if (!navigator.geolocation) {
    alert(t('ui.unsupported_browser'));
    return
  }

  navigator.geolocation.getCurrentPosition((position) => {

    console.log(position)
    Object.assign(gpsData.value, {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      alt: position.coords.altitude,
      accuracy: position.coords.accuracy,
    })
    data.timestamp = position.timestamp

    setTimeout(() => {
      isAcquiring.value = false;
    }, 1000); // 至少保留一秒 true 状态

    errorCode.value = 0;

  }, (error: GeolocationPositionError) => {
    isAcquiring.value = false
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED: {
        notifyError(t('ui.gps.check_permission'))
        break;
      }
      case GeolocationPositionError.POSITION_UNAVAILABLE: {
        notifyError("t获取位置信息失败，请移动到开阔位置重试")
        break
      }
      case GeolocationPositionError.TIMEOUT: {
        notifyError("t获取GPS超时，请移动到开阔位置重试")
        break
      }
    }
  }, {
    timeout: 1000 * 5 //超时5s，避免卡住
    //todo 改为配置项
  });

};

</script>

<template>
  <el-card class="">
    <template #header>
      <div class="card-header">
        <h3> {{ $t("ui.gps.title") }}</h3>
        <el-button
            size="large"
            type="primary"
            :disabled="isAcquiring"
            @click="getGpsLocation">
          {{
            isAcquiring ? $t('ui.gps.location.acquiring_gps_location_btn') : $t('ui.gps.location.access_gps_location_btn')
          }}
        </el-button>
      </div>
      <div>
        <!--  超时mark  -->
        <el-text v-if="errorCode === ERROR.TIMEOUT">
          {{ $t("ui.gps.status.failed.timeout") }}
        </el-text>
        <el-text v-if="errorCode === ERROR.PERMISSION_DENIED">
          {{ $t("ui.gps.status.failed.denied") }}
        </el-text>
        <el-text v-if="errorCode === ERROR.POSITION_UNAVAILABLE">
          {{ $t("ui.gps.status.failed.unavailable") }}
        </el-text>

        <el-text v-show="gpsData.accuracy>50">
          {{ $t("ui.gps.status.low_accuracy") }}
        </el-text>

        <el-text v-show="errorCode===0">
          {{ $t("ui.gps.status.success") }}
        </el-text>
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
      <el-text type="danger" v-show="errorCode==-1">{{ $t('ui.gps.acquire.gps_no_data') }}</el-text>

    </div>
  </el-card>
</template>

<style scoped>
</style>