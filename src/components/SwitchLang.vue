<script setup>
import {useI18n} from 'vue-i18n';
import {watch} from "vue";
import {useSettingStore} from "@/stores/UseSettingStore.ts";
import {notifySuccess} from "@/Utils/Notify.ts";

const {locale} = useI18n();

const setting = useSettingStore();
const availableLang = {
  "zh-cn": {
    name: "简体中文",
    avail: true
  },
  "en-us": {
    name: "English",
    avail: true
  }
}

watch(locale, (newLocale) => {
  setting.updateLanguage(newLocale);
  notifySuccess(`语言已更改为 ${newLocale}`)
  console.log(`change language to ${newLocale}`);
})
</script>

<template>
  <div :class="$attrs.class">
    <el-select v-model="locale" size="small">
      <el-option v-for="(v,k) in availableLang" :key=k :disabled=!v.avail :label=v.name :value="k"></el-option>
    </el-select>
  </div>
</template>

<style scoped>

</style>