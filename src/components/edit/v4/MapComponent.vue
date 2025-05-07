<script lang="ts" setup>
import {inject, onMounted, ref, watch} from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Feature} from "ol";
import {Circle as CircleGeometry, Geometry, Point} from 'ol/geom';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {StoreGeneric, storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";

const data = inject("currentData") as StoreGeneric;
//这里是解构赋值吗？
const gpsCoord = (storeToRefs(data)).loc
const {t} = useI18n()


// 使用 ref 创建一个 DOM 元素引用
const mapElement = ref<HTMLElement | null>(null);

/**
 * 创建点和精度圈的样式。
 * @param {Object} coords - 包含经纬度和可能的精度信息的对象。
 * @param {number} [accuracy] - 可选，手动指定的精度值，单位为米。
 * @returns {Style[]} 返回一个包含中心点样式和精度圈样式的数组。
 */
function createPointAndAccuracyStyles(coords, accuracy?: number) {
  // 使用手动指定的精度或者从坐标数据中获取的精度
  const effectiveAccuracy = accuracy !== undefined ? accuracy : coords.accuracy || 50; // 默认精度为50米

  return [
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: 'blue'
        })
      })
    }),
    new Style({
      geometry: new CircleGeometry(fromLonLat([coords.lon, coords.lat]), effectiveAccuracy),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',  // 半透明蓝色
      }),
      stroke: new Stroke({
        color: 'blue',  // 精度圈边框颜色
        width: 1
      })
    })
  ];
}

const vectorLayer = new VectorLayer({
  source: new VectorSource<Feature<Geometry>>({
    features: []
  })
});

/**
 * 计算地图缩放精度，先临时这样实现，后面有空再改成根据地图显示的大小去计算
 * @param accuracy
 */
function calculateZoomLevel(accuracy: number) {
  if (accuracy < 100) {
    return 18
  } else if (accuracy < 1000) {
    return 16
  } else if (accuracy < 10000) {
    return 14
  } else if (accuracy < 20000) {
    return 12
  }
  return 10;
}

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
        center: fromLonLat([116, 30]), // 地图中心点
        zoom: 5 // 初始缩放级别
      })
    });
  }
});


watch(gpsCoord, (coords, _) => {
  console.log("watch坐标变更" + gpsCoord.toString())
  if (coords && coords.lat && coords.lon) {

    //coords.accuracy=50

    let source = vectorLayer.getSource();

    let coordinates = fromLonLat([coords.lon, coords.lat]);

    const point = new Point(coordinates);
    const pointFeature = new Feature({geometry: point});
    pointFeature.setStyle(createPointAndAccuracyStyles(coords)); // 使用点样式

    source.clear()
    source.addFeature(pointFeature); // 添加新的位置特征

    if (map) {
      const accuracy = coords.accuracy || 50; // 使用精度或默认值
      let zoomLevel = calculateZoomLevel(accuracy);
      let view = map.getView();
      view.setZoom(zoomLevel);
      view.setCenter(coordinates);
    }
  }
}, {
  immediate: true,
  deep: true
});
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