<script setup>

import {registerSW} from 'virtual:pwa-register'
import {ref} from 'vue'

const dialogVisible = ref(false)
const updateSW = registerSW({
  onNeedRefresh() {
    // 当检测到有新的版本时，显示提示框
    dialogVisible.value = true
  },
  onOfflineReady() {
    //alert("offline ready")
    // 当应用准备好离线访问时，可以在这里显示一个通知
    console.log('应用已准备好离线访问')
  },
})

function update() {
  // 当用户点击刷新按钮时，调用updateSW函数来更新service worker
  updateSW()
  dialogVisible.value = false
}

function cancel() {
  // 当用户点击取消按钮时，关闭提示框
  dialogVisible.value = false
}


</script>

<template>
  <el-dialog
      title="发现新版本！"
      :visible.sync="dialogVisible"
      :show-close="false"
      :modal-append-to-body="false"
  >
    <p>检测到新版本，点击刷新按钮更新。</p>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="update">刷新</el-button>
      <el-button @click="cancel">取消</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>

</style>