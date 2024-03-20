<script setup>
import {useI18n} from 'vue-i18n';
import {watch} from "vue";

const {locale} = useI18n();

const availableLang = {
  "zh-cn": {
    name: "简体中文",
    avail: true
  },
  "en-us": {
    name: "English",
    avail: true
  },
  "ja-jp": {
    name: "日本語",
    avail: true
  },
  "zh-nyaa": {
    name: "中文-猫娘",
    avail: true
  },
  "zh-tw": {
    name: "正體中文-臺灣",
    avail: true
  }
}

watch(locale, (newLocale) => {
  console.log("call watch with " + newLocale)
  localStorage.setItem('ui.lang', newLocale);
})
</script>

<template>
  <div :class="$attrs.class">
    <el-select v-model="locale" size="small">
      <el-option v-for="(v,k) in availableLang" :key=k :label=v.name :value="k" :disabled=!v.avail></el-option>
    </el-select>
  </div>
</template>

<style scoped>

</style>