<script lang="ts" setup>
import {inject} from "vue";
import {useCurrentData} from "@/stores/currentData";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const data = inject<ReturnType<typeof useCurrentData>>("currentData")
const properties = data.properties
</script>

<template>

  <!--    卫生间信息拓展-->
  <el-card>
    <template #header>
      <h3>{{ t("ui.metadata.title") }}</h3>
    </template>

    <template v-if="properties">
      <div class="selector">
        <h4>{{ t("ui.metadata.isPrivateProperty") }}</h4>
        <el-radio-group v-model="properties.inPrivateArea">
          <el-radio-button label="yes" :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button label="no" :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button label="unknown" :value=undefined size="large">{{
              t("ui.general.select.unknown")
            }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="properties">
      <div class="selector">
        <h4>{{ t("ui.metadata.isFree") }}</h4>
        <el-radio-group v-model="properties.isFree">
          <el-radio-button label="yes" :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button label="no" :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button label="unknown" :value=undefined size="large">{{
              t("ui.general.select.unknown")
            }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="properties.facilities">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasHook") }}</h4>
        <el-radio-group v-model="properties.facilities.hasHook">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="properties.facilities">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasAccessibilityFeature") }}</h4>
        <el-radio-group v-model="properties.facilities.hasAccessibilityFeatures">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <template v-if="properties.facilities">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasShower") }}</h4>
        <el-radio-group v-model="properties.facilities.hasShower">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="properties.facilities">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasMirror") }}</h4>
        <el-radio-group v-model="properties.facilities.hasMirror">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div class="selector">
      <h4>{{ t("ui.metadata.hasDryer") }}</h4>
      <el-radio-group v-model="properties.facilities.hasDryer">
        <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>

    <!--    <div class="selector">-->
    <!--      <h4>{{ t("ui.metadata.recommendation_title") }}</h4>-->
    <!--      <el-rate size="large" v-model="properties.score.recommendation" clearable/>-->
    <!--    </div>-->

  </el-card>
</template>

<style scoped>
h4 {
  margin-bottom: 5px;
}

.selector {
  margin-bottom: 1rem;
}
</style>