<script lang="ts" setup>
import {inject, ref} from "vue";
import {useCurrentData} from "@/stores/currentData";
import {useSettingStore} from "@/stores/UseSettingStore";
import {useI18n} from "vue-i18n";

const data = inject<ReturnType<typeof useCurrentData>>("currentData");
const comments = data.comments;
const settings = useSettingStore()
const {t} = useI18n()

const comment = ref("")
const debug = ref(false);

const addComment = () => {
  data.comments.push({
    algorithm: undefined, authorUID: undefined, ratings: 0, signature: undefined,
    author: "测试用户",
    text: comment.value,
    timestamp: Date.now()
  })
}

</script>

<template>
  <el-card>
    <template #header>
      <h3>{{ t('ui.comments.title') }}</h3>
      <div v-if="settings.isDebug">
        <el-text>debug</el-text>
        <el-switch v-model="debug"></el-switch>
      </div>
    </template>


    <template v-for="x  in comments">
      <div
          class="max-w-md  border border-gray-200 rounded-lg shadow-md p-6 space-y-4 hover:shadow-lg transition-shadow mb-2">
        <!-- Header Section -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ x.author }}</h3>
            <p v-if="debug" class="text-sm text-gray-500">UID: {{ x.authorUID }}</p>
          </div>
          <div class="flex items-center space-x-1">
            <!-- Display Star Ratings -->
            <template v-for="i in x.ratings">
              ⭐
            </template>
            <span class="text-gray-600 text-sm">({{ x.ratings }})</span>
          </div>
        </div>
        <!-- Comment Text -->
        <p class="text-gray-700">{{ x.text }}</p>
        <!-- Footer Section -->
        <div class="flex items-center justify-between text-sm text-gray-500">
        <span>
          <!-- Format timestamp as readable date -->
          {{ new Date(x.timestamp).toLocaleString() }}
        </span>
          <span v-if="debug">Algorithm: {{ x.algorithm }}</span>
        </div>

      </div>
    </template>

    <template v-if="true">
      <div
          class="max-w-md bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-4 mt-4 hover:shadow-lg transition-shadow">
        <!-- 评论框 -->
        <textarea
            v-model="comment"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入您的评论..."
            rows="4"
        ></textarea>

        <!-- 发送按钮 -->
        <button
            :disabled="!comment.trim()"
            class="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            @click="addComment()"
        >
          发送
        </button>
      </div>
    </template>

  </el-card>
</template>

<style scoped>

</style>