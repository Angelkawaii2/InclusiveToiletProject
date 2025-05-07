<script lang="ts" setup>
import {computed, inject} from "vue";
import {useCurrentData} from "@/stores/currentData";
import {useI18n} from "vue-i18n";

const data = inject<ReturnType<typeof useCurrentData>>("currentData");
const {t} = useI18n()

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
        <h3>{{ t('ui.time.title') }}</h3>
        <el-button size="large" @click="initTime()">
          {{ !isTimeAvailable ? t("ui.time.create") : t("ui.time.remove") }}
        </el-button>
      </div>
    </template>


    <div v-if="isTimeAvailable">
      <el-switch
          v-model="data.time.allDay"
          :active-text="t('ui.time.is24Hour.true')"
          :inactive-text="t('ui.time.is24Hour.false')"
          class="mb-2"
      />
      <!--        时间选择器-->
      <div v-show="!data.time.allDay">
        <el-time-select
            v-model="data.time.openAt"
            end="24:00"
            size="large"
            start="00:00"
            step="00:30"
        />

        <el-time-select
            v-model="data.time.closeAt"
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