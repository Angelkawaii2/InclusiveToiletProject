<script lang="ts" setup>
import {Edit, UploadFilled} from "@element-plus/icons-vue";
</script>

<template>
  <section class="workspace-page">
    <div class="workspace-hero edit-hero">
      <div>
        <p class="workspace-eyebrow">修改维护</p>
        <h2>编辑已导入的卫生间资料</h2>
        <p>这里用于承接搜索页选中的记录，后续会支持修改、停用、合并重复点位和导出更新后的数据包。</p>
      </div>
      <el-button size="large" type="primary" disabled>
        <el-icon><UploadFilled /></el-icon>
        导入待编辑数据
      </el-button>
    </div>

    <div class="edit-empty-state">
      <el-icon><Edit /></el-icon>
      <div>
        <h3>尚未选择记录</h3>
        <p>下一步可以把搜索结果列表和这里打通：点击某条记录后进入编辑状态，保存时写回本地数据集。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edit-hero {
  border-color: rgba(20, 118, 100, 0.2);
  background: var(--itp-edit-hero);
}

.edit-empty-state {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
  padding: 24px;
  border: 1px dashed var(--itp-border-strong);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.edit-empty-state .el-icon {
  width: 40px;
  height: 40px;
  color: var(--itp-primary);
}

.edit-empty-state h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.edit-empty-state p {
  margin: 0;
  color: var(--itp-text-muted);
}
</style>
