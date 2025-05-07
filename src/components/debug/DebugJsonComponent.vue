<script lang="ts" setup>

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
      readonly
      show-word-limit
      type="textarea"
  />

</template>

<style scoped>

</style>