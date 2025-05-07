<script lang="ts" setup>
import {StoreGeneric, storeToRefs} from "pinia";
import {inject} from "vue";
import {useI18n} from "vue-i18n";

const toiletTypeMap = {
  'ui.toilet_type.binary': 1,
  'ui.toilet_type.accessible': 2,
  'ui.toilet_type.unisex': 3,
  'ui.toilet_type.undefined': -1
}

const data = inject("currentData") as StoreGeneric
const {t} = useI18n()

const toiletType = storeToRefs(data).toiletType

</script>

<template>
  <el-card>
    <template #header>
      <h3>{{ t('ui.toilet_type.title') }}</h3>
    </template>
    <el-checkbox-group v-model="toiletType">
      <el-checkbox v-for="(v,k) in toiletTypeMap" :key="k" :value="v" border size="large" style="margin: 5px">
        {{ t(k) }}
      </el-checkbox>
    </el-checkbox-group>
  </el-card>
</template>

<style scoped>

</style>