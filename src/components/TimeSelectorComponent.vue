<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";

const data = useCurrentData()
const time = data.time
</script>

<template>
  <!--时间选择-->
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ $t('ui.time.title') }}</h3>
        <el-button size="large" @click="time.unknown=!time.unknown">
          {{ time.unknown ? $t("ui.time.create") : $t("ui.time.remove") }}
        </el-button>
      </div>
    </template>


    <div v-show="!time.unknown">
      <el-switch
          v-model="time.allDay"
          class="mb-2"
          :active-text="$t('ui.time.is24Hour.true')"
          :inactive-text="$t('ui.time.is24Hour.false')"
      />
      <!--        时间选择器-->
      <div v-show="!time.allDay">
        <el-time-select
            size="large"
            v-model="time.startTime"
            start="00:00"
            step="00:30"
            end="24:00"
        />

        <el-time-select
            size="large"
            v-model="time.endTime"
            start="00:00"
            step="00:30"
            end="24:00"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped>

</style>