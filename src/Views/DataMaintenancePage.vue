<script lang="ts" setup>
import {ref} from "vue";
import {CirclePlus, Edit, Files} from "@element-plus/icons-vue";
import AddPage from "@/Views/AddPage.vue";
import EditPage from "@/Views/EditPage.vue";

const mode = ref("create");
</script>

<template>
  <section class="workspace-page">
    <div class="workspace-hero maintenance-hero">
      <div>
        <p class="workspace-eyebrow">数据维护</p>
        <h2>新增、修改和管理卫生间数据</h2>
        <p>这里集中处理数据写入类操作：新增点位、编辑已有记录、批量停用、合并重复点位和导入导出数据包。</p>
      </div>
    </div>

    <el-segmented v-model="mode" class="maintenance-mode"
                  :options="[
                    { label: '新增点位', value: 'create' },
                    { label: '编辑记录', value: 'edit' },
                    { label: '批量管理', value: 'batch' }
                  ]"/>

    <div class="maintenance-panel">
      <add-page v-if="mode === 'create'" embedded/>
      <edit-page v-else-if="mode === 'edit'" embedded/>
      <div v-else class="batch-placeholder">
        <el-icon><Files /></el-icon>
        <div>
          <h3>批量管理</h3>
          <p>后续这里会放批量停用、重复点合并、区域数据导入导出和数据校验结果。</p>
          <div class="batch-actions">
            <el-button disabled>
              <el-icon><CirclePlus /></el-icon>
              导入数据包
            </el-button>
            <el-button disabled>
              <el-icon><Edit /></el-icon>
              批量编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.maintenance-hero {
  background: var(--itp-edit-hero);
}

.maintenance-mode {
  margin-top: 16px;
}

.maintenance-panel {
  margin-top: 16px;
}

.batch-placeholder {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  border: 1px dashed var(--itp-border-strong);
  border-radius: 8px;
  background: var(--itp-surface-soft);
}

.batch-placeholder > .el-icon {
  width: 40px;
  height: 40px;
  color: var(--itp-primary);
}

.batch-placeholder h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.batch-placeholder p {
  margin: 0;
  color: var(--itp-text-muted);
}

.batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
</style>
