<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData";
import {useCurrentGpsStatus} from "@/stores/currentGpsStatus";

const data = useCurrentData()
const gpsStatus = useCurrentGpsStatus()

function downloadData() {
  const blob = new Blob([JSON.stringify(data.$state, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = data.timestamp + '.json';
  link.click();

  // 释放URL对象
  URL.revokeObjectURL(url);
}

</script>

<template>
  <div>

    <el-button type="danger" disabled v-show="data.timestamp===0||data.gpsCoord.lon==null">
      {{ $t("ui.gps.acquire.gps_no_data") }}
    </el-button>

    <el-button type="success" @click="downloadData"
               v-show="data.gpsCoord.lon!=null && gpsStatus.deltaSec<60">
      {{ $t("ui.general.save") }}
    </el-button>

    <el-button type="warning" @click="downloadData"
               v-show="data.gpsCoord.lon!=null && gpsStatus.deltaSec>60">
      {{ $t("ui.general.save") }} - {{ $t("ui.gps.acquire.gps_expired") }}
    </el-button>


  </div>

</template>

<style scoped>

</style>