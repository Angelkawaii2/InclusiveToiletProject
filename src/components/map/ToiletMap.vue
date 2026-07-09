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
import type {ToiletKind} from "@/domain/toilet/v6";

export interface ToiletMapPoint {
  lon: number;
  lat: number;
  kinds: ToiletKind[];
}

const mapElement = ref<HTMLElement | null>(null);

const markerStyles = {
  male: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: "#2f80ed"}),
      stroke: new Stroke({color: "#ffffff", width: 2}),
    }),
  }),
  female: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: "#f26ba7"}),
      stroke: new Stroke({color: "#ffffff", width: 2}),
    }),
  }),
  neutral: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: "#29a36a"}),
      stroke: new Stroke({color: "#ffffff", width: 2}),
    }),
  }),
  mixed: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: "#8b6bdc"}),
      stroke: new Stroke({color: "#ffffff", width: 2}),
    }),
  }),
};

function getMarkerStyle(kinds: ToiletKind[]) {
  if (kinds.includes("allGender")) return markerStyles.neutral;
  if (kinds.includes("male") && !kinds.includes("female")) return markerStyles.male;
  if (kinds.includes("female") && !kinds.includes("male")) return markerStyles.female;
  return markerStyles.mixed;
}

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: (feature) => getMarkerStyle(feature.get("kinds") || []),
});

let map: Map | null = null;

onMounted(() => {
  if (!mapElement.value) return;
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        className: "ol-layer mono-osm-layer",
        source: new OSM(),
      }),
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([121.47, 31.23]),
      zoom: 11,
    }),
  });
});

function setPoints(points: ToiletMapPoint[]) {
  vectorSource.clear();
  const features = points.map((item) => new Feature({
    geometry: new Point(fromLonLat([item.lon, item.lat])),
    kinds: item.kinds,
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

.map-container :deep(.mono-osm-layer canvas) {
  filter: grayscale(1) saturate(0) contrast(0.95) brightness(1.05);
}
</style>
