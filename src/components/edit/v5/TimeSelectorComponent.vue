<script setup lang="ts">
import {StoreGeneric} from "pinia";
import {computed, inject, reactive} from "vue";
import {useCurrentData} from "@/stores/currentData";

const data = inject<ReturnType<typeof useCurrentData>>("currentData");

function initTime() {
  console.log(isTimeAvailable.value)
  if (isTimeAvailable.value) {
    data.initTime(true);
  } else {
    data.initTime();
  }
}

const isTimeAvailable = computed(() => {
      const properties = ['allDay', 'openAt', 'closeAt'];
      return properties.every((property) => property in data.time);
    }
)

</script>

<template>
  <!--时间选择-->
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ $t('ui.time.title') }}</h3>
        <el-button size="large" @click="initTime()">
          {{ !isTimeAvailable ? $t("ui.time.create") : $t("ui.time.remove") }}
        </el-button>
      </div>
    </template>


    <div v-if="isTimeAvailable">
      <el-switch
          v-model="data.time.allDay"
          class="mb-2"
          :active-text="$t('ui.time.is24Hour.true')"
          :inactive-text="$t('ui.time.is24Hour.false')"
      />
      <!--        时间选择器-->
      <div v-show="!data.time.allDay">
        <el-time-select
            size="large"
            v-model="data.time.openAt"
            start="00:00"
            step="00:30"
            end="24:00"
        />

        <el-time-select
            size="large"
            v-model="data.time.closeAt"
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