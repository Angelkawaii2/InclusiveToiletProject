<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";

const toiletTypeMap = {
  'ui.toilet_type.binary': 1,
  'ui.toilet_type.accessible': 2,
  'ui.toilet_type.unisex': 3,
  'ui.toilet_type.undefined': -1
}

const data = useCurrentData()

const toiletType = storeToRefs(data).toiletType
</script>

<template>
  <el-card>
    <template #header>
      <h3>{{ $t('ui.toilet_type.title') }}</h3>
    </template>
    <el-checkbox-group v-model="toiletType">
      <el-checkbox style="margin: 5px" size="large" border v-for="(v,k) in toiletTypeMap" :key="k" :value="v">
        {{ $t(k) }}
      </el-checkbox>
    </el-checkbox-group>
  </el-card>
</template>

<style scoped>

</style>