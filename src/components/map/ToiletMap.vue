<script lang="ts" setup>
import {onMounted, ref} from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {fromLonLat} from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Feature} from "ol";
import {Point} from "ol/geom";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";

const mapElement = ref<HTMLElement | null>(null);

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({color: "rgb(255,145,0)"}),
      stroke: new Stroke({color: "#1f5fbf", width: 2}),
    }),
  }),
});

let map: Map | null = null;

onMounted(() => {
  if (!mapElement.value) return;
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({source: new OSM()}),
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([121.47, 31.23]),
      zoom: 11,
    }),
  });
});

function setPoints(points: Array<{ lon: number; lat: number }>) {
  vectorSource.clear();
  const features = points.map((item) => new Feature({
    geometry: new Point(fromLonLat([item.lon, item.lat])),
  }));
  vectorSource.addFeatures(features);

  if (!map || features.length === 0) return;
  map.getView().fit(vectorSource.getExtent(), {
    padding: [36, 36, 36, 36],
    maxZoom: 15,
    duration: 220,
  });
}

function focusPoint(lon: number, lat: number) {
  if (!map) return;
  map.getView().animate({
    center: fromLonLat([lon, lat]),
    zoom: 17,
    duration: 260,
  });
}

defineExpose({
  setPoints,
  focusPoint,
});
</script>

<template>
  <div ref="mapElement" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  min-height: 460px;
  height: 100%;
}
</style>
