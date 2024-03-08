<script setup lang="ts">

import {useCurrentData} from "@/stores/currentData";
import {computed} from "vue";

const data = useCurrentData()

const renderedJsonData = computed(() => {
      return JSON.stringify(data.$state, null, 2)
    }
)
</script>

<template>

  <el-input
      v-model=renderedJsonData
      :autosize="{ minRows: 2 }"
      type="textarea"
      show-word-limit
      readonly
  />

</template>

<style scoped>

</style>