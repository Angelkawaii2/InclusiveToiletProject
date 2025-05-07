<script lang="ts" setup>
import {StoreGeneric} from "pinia";
import {inject} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const {toiletMetadata} = inject("currentData") as StoreGeneric

</script>

<template>

  <!--    卫生间信息拓展-->
  <el-card>
    <template #header>
      <h3>{{ t("ui.metadata.title") }}</h3>
    </template>

    <template v-if="toiletMetadata.hasOwnProperty('isPrivate')">
      <div class="selector">
        <h4>{{ t("ui.metadata.isPrivateProperty") }}</h4>
        <el-radio-group v-model="toiletMetadata.isPrivate">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="toiletMetadata.extra.isFree">
      <div class="selector">
        <h4>{{ t("ui.metadata.isFree") }}</h4>
        <el-radio-group v-model="toiletMetadata.extra.isFree">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <template v-if="true">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasHook") }}</h4>
        <el-radio-group v-model="toiletMetadata.extra.hasHook">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>

    </template>

    <template v-if="true">
      <div class="selector">
        <h4>{{ t("ui.metadata.hasMirror") }}</h4>
        <el-radio-group v-model="toiletMetadata.extra.hasMirror">
          <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
          <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
          <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div class="selector">
      <h4>{{ t("ui.metadata.hasDryer") }}</h4>
      <el-radio-group v-model="toiletMetadata.extra.hasDryer">
        <el-radio-button :value=true size="large">{{ t("ui.general.select.yes") }}</el-radio-button>
        <el-radio-button :value=false size="large">{{ t("ui.general.select.no") }}</el-radio-button>
        <el-radio-button :value=undefined size="large">{{ t("ui.general.select.unknown") }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="selector">
      <h4>{{ t("ui.metadata.recommendation_title") }}</h4>
      <el-rate v-model="toiletMetadata.score.recommendation" clearable size="large"/>
    </div>

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