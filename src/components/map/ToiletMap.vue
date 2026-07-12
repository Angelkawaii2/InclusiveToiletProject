<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {fromLonLat, toLonLat} from "ol/proj";
import {boundingExtent} from "ol/extent";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import {Feature} from "ol";
import {Circle as CircleGeometry, Point} from "ol/geom";
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from "ol/style";
import Icon from "ol/style/Icon";
import Translate from "ol/interaction/Translate";
import Select from "ol/interaction/Select";
import type {ToiletKind} from "@/domain/toilet/v6";

export interface ToiletMapPoint {
  id?: string;
  lon: number;
  lat: number;
  kinds: ToiletKind[];
}

export type BasemapStyle = "mono" | "light" | "dark";

const props = withDefaults(defineProps<{
  basemapStyle?: BasemapStyle;
  editableMarker?: boolean;
  clusterPoints?: boolean;
  selectedPointId?: string;
}>(), {
  basemapStyle: "mono",
  editableMarker: false,
  clusterPoints: true,
  selectedPointId: "",
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

const selectedMarkerStyles = {
  male: new Style({
    image: new CircleStyle({radius: 11, fill: new Fill({color: "#2f80ed"}), stroke: new Stroke({color: "#ffffff", width: 4})}),
  }),
  female: new Style({
    image: new CircleStyle({radius: 11, fill: new Fill({color: "#f26ba7"}), stroke: new Stroke({color: "#ffffff", width: 4})}),
  }),
  neutral: new Style({
    image: new CircleStyle({radius: 11, fill: new Fill({color: "#29a36a"}), stroke: new Stroke({color: "#ffffff", width: 4})}),
  }),
  mixed: new Style({
    image: new CircleStyle({radius: 11, fill: new Fill({color: "#8b6bdc"}), stroke: new Stroke({color: "#ffffff", width: 4})}),
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

function getMarkerStyle(kinds: ToiletKind[], selected = false) {
  const styles = selected ? selectedMarkerStyles : markerStyles;
  if (kinds.includes("allGender")) return styles.neutral;
  if (kinds.includes("male") && !kinds.includes("female")) return styles.male;
  if (kinds.includes("female") && !kinds.includes("male")) return styles.female;
  return styles.mixed;
}

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: (feature) => feature.get("editable") ? editablePinStyle : getMarkerStyle(feature.get("kinds") || [], feature.get("selected") === true),
});
vectorLayer.setZIndex(10);

const clusterSource = new Cluster({
  distance: 52,
  minDistance: 16,
  source: vectorSource,
});

const clusterStyles = new Map<number, Style>();

function getClusterStyle(feature: Feature) {
  const clusteredFeatures = feature.get("features") as Feature[] | undefined;
  if (!clusteredFeatures?.length) return markerStyles.mixed;
  if (clusteredFeatures.length === 1) {
    const point = clusteredFeatures[0];
    return point.get("editable") ? editablePinStyle : getMarkerStyle(point.get("kinds") || [], point.get("selected") === true);
  }
  const count = clusteredFeatures.length;
  const cachedStyle = clusterStyles.get(count);
  if (cachedStyle) return cachedStyle;
  const style = new Style({
    image: new CircleStyle({
      radius: Math.min(22, 12 + Math.log2(count) * 3),
      fill: new Fill({color: "#2f80ed"}),
      stroke: new Stroke({color: "#ffffff", width: 2}),
    }),
    text: new Text({
      text: String(count),
      fill: new Fill({color: "#ffffff"}),
      font: "600 12px sans-serif",
    }),
  });
  clusterStyles.set(count, style);
  return style;
}

const clusterLayer = new VectorLayer({
  source: clusterSource,
  style: getClusterStyle,
});
clusterLayer.setZIndex(10);

const userLocationSource = new VectorSource();
const userAccuracyStyle = new Style({
  fill: new Fill({color: "rgba(96, 165, 250, 0.18)"}),
  stroke: new Stroke({color: "rgba(96, 165, 250, 0.78)", width: 2}),
});
const userCenterStyles = [
  new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({color: "#ffffff"}),
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: "#1a73e8"}),
    }),
  }),
];
const minimumAccuracyRingPixels = 18;

function getUserLocationStyle(feature: Feature, resolution: number) {
  const type = feature.get("type");
  if (type === "accuracy") return userAccuracyStyle;
  if (type === "center") return userCenterStyles;
  if (type === "minimum-accuracy-ring") {
    const accuracy = feature.get("accuracy");
    return typeof accuracy === "number" && accuracy / resolution < minimumAccuracyRingPixels
      ? userCenterStyles
      : null;
  }
  return null;
}

const userLocationLayer = new VectorLayer({
  source: userLocationSource,
  style: getUserLocationStyle,
});
userLocationLayer.setZIndex(20);

let map: Map | null = null;
let translateInteraction: Translate | null = null;
let selectInteraction: Select | null = null;

function handleClusterSelection(feature: Feature) {
  const clusteredFeatures = feature.get("features") as Feature[] | undefined;
  if (!clusteredFeatures?.length) return;
  if (clusteredFeatures.length > 1) {
    const geometry = feature.getGeometry();
    if (!(geometry instanceof Point) || !map) return;
    map.getView().animate({
      center: geometry.getCoordinates(),
      zoom: Math.min(18, (map.getView().getZoom() || 0) + 2),
      duration: 240,
    });
    return;
  }
  const recordId = clusteredFeatures[0].get("id");
  if (typeof recordId === "string") emit("pointClick", recordId);
}

onMounted(() => {
  if (!mapElement.value) return;
  const pointLayer = props.clusterPoints ? clusterLayer : vectorLayer;
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        className: "ol-layer osm-basemap-layer",
        source: new OSM(),
      }),
      pointLayer,
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

  if (props.clusterPoints) {
    selectInteraction = new Select({
      layers: [clusterLayer],
      hitTolerance: 12,
      style: null,
    });
    selectInteraction.on("select", (event) => {
      const selectedFeature = event.selected[0];
      if (selectedFeature) handleClusterSelection(selectedFeature);
      selectInteraction?.getFeatures().clear();
    });
    map.addInteraction(selectInteraction);
  }
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
  setSelectedPoint(props.selectedPointId);

  if (!map || features.length === 0) return;
  map.getView().fit(vectorSource.getExtent(), {
    padding: [36, 36, 36, 36],
    maxZoom: 15,
    duration: 220,
  });
}

function setSelectedPoint(id = "") {
  vectorSource.getFeatures().forEach((feature) => {
    feature.set("selected", Boolean(id) && feature.get("id") === id);
  });
  vectorLayer.changed();
  clusterLayer.changed();
}

function focusPoint(lon: number, lat: number) {
  if (!map) return;
  map.getView().animate({
    center: fromLonLat([lon, lat]),
    zoom: 17,
    duration: 260,
  });
}

function setUserLocation(location: { lon: number; lat: number; accuracy?: number | null } | null) {
  userLocationSource.clear();
  if (!location) return;
  const center = fromLonLat([location.lon, location.lat]);
  const accuracy = Number.isFinite(location.accuracy) && (location.accuracy || 0) > 0
    ? location.accuracy!
    : 40;
  userLocationSource.addFeature(new Feature({
    geometry: new CircleGeometry(center, accuracy),
    type: "accuracy",
  }));
  userLocationSource.addFeature(new Feature({
    geometry: new Point(center),
    type: "minimum-accuracy-ring",
    accuracy,
  }));
  if (accuracy <= 40) {
    userLocationSource.addFeature(new Feature({
      geometry: new Point(center),
      type: "center",
    }));
  }
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
  setSelectedPoint,
  focusPoint,
  setUserLocation,
  fitAroundLocation,
});

watch(() => props.selectedPointId, (id) => {
  setSelectedPoint(id);
}, {immediate: true});

onUnmounted(() => {
  if (map && translateInteraction) map.removeInteraction(translateInteraction);
  if (map && selectInteraction) map.removeInteraction(selectInteraction);
  translateInteraction = null;
  selectInteraction = null;
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
