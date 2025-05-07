<script lang="ts" setup>
import {StoreGeneric} from "pinia";
import {inject} from "vue";
import {useI18n} from "vue-i18n";

const data = inject("currentData") as StoreGeneric;
const time = data.time
const {t} = useI18n();
</script>

<template>
  <!--时间选择-->
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ t('ui.time.title') }}</h3>
        <el-button size="large" @click="time.unknown=!time.unknown">
          {{ time.unknown ? t("ui.time.create") : t("ui.time.remove") }}
        </el-button>
      </div>
    </template>


    <div v-show="!time.unknown">
      <el-switch
          v-model="time.allDay"
          :active-text="t('ui.time.is24Hour.true')"
          :inactive-text="t('ui.time.is24Hour.false')"
          class="mb-2"
      />
      <!--        时间选择器-->
      <div v-show="!time.allDay">
        <el-time-select
            v-model="time.startTime"
            end="24:00"
            size="large"
            start="00:00"
            step="00:30"
        />

        <el-time-select
            v-model="time.endTime"
            end="24:00"
            size="large"
            start="00:00"
            step="00:30"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped>

</style>