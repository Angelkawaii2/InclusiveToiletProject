<script lang="ts" setup>
import {StoreGeneric, storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {inject} from "vue";

const {t} = useI18n();
const data = inject("currentData") as StoreGeneric;
const comment = storeToRefs(data).comments
const name = storeToRefs(data).name

//todo 要做i18n，或者用tag的方式实现？ 20240308
const cmtMap = [
  "🤗环境好",
  "🤮环境差",
  "👀不好找",
  "🚇地铁站内",
  "🚵在路边",
  "🅿️可临时停车",
  "🏬商场内",
  "❌维护中"
];
const ifContainsInComment = (v: string): boolean => {
  if (comment.value == null) {
    return false
  }
  return comment.value?.indexOf(v) != -1;
}

const handleBtnClick = (v: string) => {
  console.log(v + ifContainsInComment(v))
  if (data.comments != null && ifContainsInComment(v)) {
    data.comments = data.comments.replace(v + ' ', "");
  } else {
    comment.value += v + " "
  }
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ t('ui.comments.title') }}</h3>
      </div>
    </template>

    <div>
      <el-text>{{ t('ui.comments.name') }}</el-text>
      <el-input v-model="name" placeholder="name" type="text"></el-input>
    </div>
    <div>
      <el-input v-model="comment" placeholder="t-comments" rows="3" type="textarea"/>
    </div>
    <div>
      <el-button v-for="k in cmtMap" :type="ifContainsInComment(k)?'primary':''" class="btn" size="large"
                 @click=handleBtnClick(k)>{{ k }}
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.btn {
  margin: 1%;
}
</style>