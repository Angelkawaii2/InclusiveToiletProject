<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData";
import {storeToRefs} from "pinia";

const data = useCurrentData()
const comment = storeToRefs(data).comments
</script>

<template>
  <el-card>
    <div>
      <el-input type="textarea" rows="3" placeholder="t-comments" v-model="comment"/>
    </div>
    <div>
      <el-button @click="comment+='环境好 '"> t环境好</el-button>
      <el-button @click="comment+='环境差 '"> t环境差</el-button>
      <el-button @click="comment+='有淋浴 '"> t有淋浴</el-button>
    </div>
  </el-card>
</template>

<style scoped>

</style>