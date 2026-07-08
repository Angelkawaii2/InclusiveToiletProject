<script lang="ts" setup>
import {inject, onMounted, ref} from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Feature} from "ol";
import {Point} from 'ol/geom';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {useI18n} from "vue-i18n";

inject("currentData", null);
const {t} = useI18n()

// 使用 ref 创建一个 DOM 元素引用
const mapElement = ref<HTMLElement | null>(null);

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: 'rgb(255,145,0)',
      }),
      stroke: new Stroke({
        color: '#1f5fbf',
        width: 2
      })
    })
  })
});

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
        vectorLayer

      ],
      view: new View({
        center: fromLonLat([121.47, 31.23]),
        zoom: 11
      })
    });
  }
});

function addPointToMap(lon: number, lat: number) {
  if (!map) return;
  const point = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });
  vectorSource.addFeature(point);
}

function setPoints(points: Array<{ lon: number; lat: number }>) {
  vectorSource.clear();
  const features = points.map((item) => {
    return new Feature({
      geometry: new Point(fromLonLat([item.lon, item.lat])),
    });
  });
  vectorSource.addFeatures(features);

  if (!map || features.length === 0) return;
  const extent = vectorSource.getExtent();
  map.getView().fit(extent, {
    padding: [36, 36, 36, 36],
    maxZoom: 15,
    duration: 220
  });
}

defineExpose({
  addPointToMap,
  setPoints
})

</script>

<template>

  <el-card>
    <template #header>
      <div class="card-header">
        <h3> {{ t("ui.map.title") }}</h3>
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
