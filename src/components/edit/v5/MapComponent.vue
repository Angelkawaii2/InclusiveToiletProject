<script setup lang="ts">
import {inject, onMounted, ref} from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Feature} from "ol";
import {Circle as CircleGeometry, Point} from 'ol/geom';
import {Fill, Stroke, Style} from 'ol/style';
import {StoreGeneric} from "pinia";

const data = inject("currentData") as StoreGeneric;

// 使用 ref 创建一个 DOM 元素引用
const mapElement = ref<HTMLElement | null>(null);

let map: Map = null;
onMounted(() => {
  if (mapElement.value) {
    // 初始化地图
    map = new Map({
      target: mapElement.value,
      layers: [
        new TileLayer({
          source: new OSM()
        }),

      ],
      view: new View({
        center: fromLonLat([116, 30]), // 地图中心点
        zoom: 5 // 初始缩放级别
      })
    });
  }
});

// Function to add a point to the map
function addPointToMap(lon: number, lat: number) {
  console.log(`draw point ${lat} ${lon}`)
  if (!map) return;

  // Create a point feature with the provided coordinates
  const point = new Feature({
    geometry: new Point(fromLonLat([lon, lat])), // Convert lon/lat to map projection
  });

  // Create a vector source and add the point feature
  const vectorSource = new VectorSource({
    features: [point],
  });

  // Create a vector layer with a style that uses a blue circle and optional text
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      geometry: new CircleGeometry(fromLonLat([lon, lat]), 20),
      fill: new Fill({
        color: 'rgb(255,145,0)',  // 半透明蓝色
      }),
      stroke: new Stroke({
        color: 'blue',  // 精度圈边框颜色
        width: 1
      })
    }),
  });
  // Add the vector layer to the map
  map.addLayer(vectorLayer);
}

defineExpose({
  addPointToMap
})

</script>

<template>

  <el-card>
    <template #header>
      <div class="card-header">
        <h3> {{ $t("ui.map.title") }}</h3>
      </div>
    </template>

    <div>
      <div ref="mapElement" class="map-container"></div>
    </div>
  </el-card>

</template>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
}
</style>