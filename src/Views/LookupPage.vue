<script lang="ts" setup>

import MapComponent from "@/components/edit/v5/MapComponent.vue";
import {ref} from "vue";
import {Bathroom} from "@/types/ToiletData-V5";

const files = ref([])

const bathroomList = ref([] as Bathroom[])

const mapComponent = ref(null)

function handleFiles(event) {
  const selectFiles = event.target.files;
  files.value = Array.from(selectFiles);
  readFiles(files.value)
}

function readFiles(fs) {
  console.log(fs)
  fs.forEach((file) => {

    const reader = new FileReader();


    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const jsonData = JSON.parse(fileContent as string) as Bathroom;


        bathroomList.value.push(jsonData);
        mapComponent.value.addPointToMap(jsonData.loc.lon, jsonData.loc.lat)

        //console.log('File content:', jsonData); // 输出读取的JSON内容
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
      console.log("read done");
    };

    reader.onerror = (e) => {
      console.error('Error reading file:', e.target.error);
    };

    reader.readAsText(file);

  })
}
</script>

<template>


  <div class="">
    <h1 class="">查询</h1>

    <map-component ref="mapComponent"></map-component>


    <el-button class="" type="primary">初始化DB</el-button>
    <el-button class="" type="primary">导入数据</el-button>
    <input ref="fileInput"
           accept=".json"
           multiple
           type="file"
           @change="handleFiles"/>

    <el-button class="" type="primary" @click="processFiles">处理数据</el-button>


    <div>
      <template v-for="(item,idx) in bathroomList">
        <div>
          <div> id:${{ idx }} ${{ item.name }}</div>
        </div>
      </template>
    </div>
  </div>


</template>

<style scoped>

</style>