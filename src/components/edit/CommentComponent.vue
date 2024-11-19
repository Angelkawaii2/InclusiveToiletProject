<script setup lang="ts">
import {useCurrentData} from "@/stores/currentData";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const data = useCurrentData()
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
        <h3>{{ $t('ui.comments.title') }}</h3>
      </div>
    </template>

    <div>
      <el-text>{{$t('ui.comments.name')}}</el-text>
      <el-input type="text" placeholder="name" v-model="name"></el-input>
    </div>
    <div>
      <el-input type="textarea" rows="3" placeholder="t-comments" v-model="comment"/>
    </div>
    <div>
      <el-button size="large" class="btn" :type="ifContainsInComment(k)?'primary':''" @click=handleBtnClick(k)
                 v-for="k in cmtMap">{{ k }}
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.btn {
  margin: 1%;
}
</style>