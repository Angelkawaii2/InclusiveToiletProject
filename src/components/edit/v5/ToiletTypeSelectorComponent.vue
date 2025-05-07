<script lang="ts" setup>
import {useCurrentData} from "@/stores/currentData"
import {computed, inject} from "vue";
import {useI18n} from "vue-i18n";

const toiletTypeMap = {
  'ui.toilet_type.binary': 'binary',
  'ui.toilet_type.accessible': 'accessible',
  'ui.toilet_type.unisex': 'unisex',
  'ui.toilet_type.undefined': 'others',
}

const data = inject<ReturnType<typeof useCurrentData>>("currentData")
const {t} = useI18n()

const toiletType = computed({
  get: () => {
    return data.types
  },
  set: (value) => {
    data.updateTypes(value)
  }
})

</script>

<template>
  <el-card>
    <template #header>
      <h3>{{ t('ui.toilet_type.title') }}</h3>
    </template>
    <el-checkbox-group v-model="toiletType">
      <el-checkbox v-for="(v,k) in toiletTypeMap" :key="k" :value="v" border size="large">
        {{ t(k) }}
      </el-checkbox>
    </el-checkbox-group>
  </el-card>
</template>

<style scoped>

</style>