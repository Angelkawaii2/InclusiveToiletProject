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
  }
}

watch(locale, (newLocale) => {
  console.log("call watch with " + newLocale)
  localStorage.setItem('ui.lang', newLocale);
})
</script>

<template>
  <el-select v-model="locale" size="small">
    <el-option v-for="(v,k) in availableLang" :key=k :label=v.name :value="k" :disabled=!v.avail />
  </el-select>

</template>

<style scoped>

</style>