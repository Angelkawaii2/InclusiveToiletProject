<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {fromLonLat, toLonLat} from "ol/proj";
import {boundingExtent} from "ol/extent";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Feature} from "ol";
import {Point} from "ol/geom";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";
import Icon from "ol/style/Icon";
import Translate from "ol/interaction/Translate";
import type {ToiletKind} from "@/domain/toilet/v6";

export interface ToiletMapPoint {
  id?: string;
  lon: number;
  lat: number;
  kinds: ToiletKind[];
}

export type BasemapStyle = "standard" | "mono" | "light" | "dark";

const props = withDefaults(defineProps<{
  basemapStyle?: BasemapStyle;
  editableMarker?: boolean;
}>(), {
  basemapStyle: "mono",
  editableMarker: false,
});

const emit = defineEmits<{
  coordinateChange: [location: { lon: number; lat: number }];
  pointClick: [id: string];
}>();

const mapElement = ref<HTMLElement | null>(null);
const mapClasses = computed(() => ["map-container", `basemap-${props.basemapStyle}`]);

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

const editablePinStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
        <path d="M24 58C21 48 7 38 7 22C7 12.6 14.6 5 24 5s17 7.6 17 17c0 16-14 26-17 36Z" fill="#e34d59" stroke="#ffffff" stroke-width="3"/>
        <circle cx="24" cy="22" r="8" fill="#ffffff"/>
      </svg>
    `)}`,
  }),
});

function getMarkerStyle(kinds: ToiletKind[]) {
  if (kinds.includes("allGender")) return markerStyles.neutral;
  if (kinds.includes("male") && !kinds.includes("female")) return markerStyles.male;
  if (kinds.includes("female") && !kinds.includes("male")) return markerStyles.female;
  return markerStyles.mixed;
}

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: (feature) => feature.get("editable") ? editablePinStyle : getMarkerStyle(feature.get("kinds") || []),
});
vectorLayer.setZIndex(10);

const userLocationSource = new VectorSource();
const userLocationLayer = new VectorLayer({
  source: userLocationSource,
  style: new Style({
    image: new CircleStyle({
      radius: 12,
      fill: new Fill({color: "#1a73e8"}),
      stroke: new Stroke({color: "rgba(147, 197, 253, 0.68)", width: 10}),
    }),
  }),
});
userLocationLayer.setZIndex(20);

let map: Map | null = null;
let translateInteraction: Translate | null = null;

onMounted(() => {
  if (!mapElement.value) return;
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        className: "ol-layer osm-basemap-layer",
        source: new OSM(),
      }),
      vectorLayer,
      userLocationLayer,
    ],
    view: new View({
      center: fromLonLat([121.47, 31.23]),
      zoom: 11,
    }),
  });

  if (props.editableMarker) {
    translateInteraction = new Translate({
      layers: [vectorLayer],
      hitTolerance: 12,
    });
    translateInteraction.on("translateend", (event) => {
      const feature = event.features.item(0);
      const geometry = feature?.getGeometry();
      if (!(geometry instanceof Point)) return;
      const [lon, lat] = toLonLat(geometry.getCoordinates());
      emit("coordinateChange", {
        lon: Number(lon.toFixed(6)),
        lat: Number(lat.toFixed(6)),
      });
    });
    map.addInteraction(translateInteraction);
  }

  map.on("singleclick", (event) => {
    const recordId = map?.forEachFeatureAtPixel(event.pixel, (feature) => feature.get("id"), {
      hitTolerance: 10,
      layerFilter: (layer) => layer === vectorLayer,
    });
    if (typeof recordId === "string") emit("pointClick", recordId);
  });
});

function setPoints(points: ToiletMapPoint[]) {
  vectorSource.clear();
  const features = points.map((item) => new Feature({
    geometry: new Point(fromLonLat([item.lon, item.lat])),
    id: item.id,
    kinds: item.kinds,
    editable: props.editableMarker,
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

function setUserLocation(location: { lon: number; lat: number } | null) {
  userLocationSource.clear();
  if (!location) return;
  userLocationSource.addFeature(new Feature({
    geometry: new Point(fromLonLat([location.lon, location.lat])),
  }));
}

function fitAroundLocation(location: { lon: number; lat: number }, points: Array<{ lon: number; lat: number }> = []) {
  if (!map) return;
  const coordinates = [
    fromLonLat([location.lon, location.lat]),
    ...points.map((point) => fromLonLat([point.lon, point.lat])),
  ];
  if (coordinates.length === 1) {
    map.getView().animate({
      center: coordinates[0],
      zoom: 16,
      duration: 260,
    });
    return;
  }
  map.getView().fit(boundingExtent(coordinates), {
    padding: [96, 96, 96, 96],
    minResolution: 1.2,
    maxZoom: 16,
    duration: 300,
  });
}

defineExpose({
  setPoints,
  focusPoint,
  setUserLocation,
  fitAroundLocation,
});

onUnmounted(() => {
  if (map && translateInteraction) map.removeInteraction(translateInteraction);
  translateInteraction = null;
  map = null;
});
</script>

<template>
  <div ref="mapElement" :class="mapClasses"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  min-height: 460px;
  height: 100%;
}

.map-container.basemap-mono :deep(.osm-basemap-layer canvas) {
  filter: grayscale(1) saturate(0) contrast(0.95) brightness(1.05);
}

.map-container.basemap-light :deep(.osm-basemap-layer canvas) {
  filter: saturate(0.55) contrast(0.82) brightness(1.14);
}

.map-container.basemap-dark :deep(.osm-basemap-layer canvas) {
  filter: invert(0.92) hue-rotate(180deg) saturate(0.48) contrast(0.88) brightness(0.9);
}
</style>
