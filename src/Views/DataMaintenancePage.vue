<script lang="ts" setup>
import {computed} from "vue";
import AddPage from "@/Views/AddPage.vue";
import EditPage from "@/Views/EditPage.vue";
import ReviewQueue from "@/components/maintenance/ReviewQueue.vue";
import {useWorkspaceStore} from "@/stores/workspaceStore";

const workspace = useWorkspaceStore();
const mode = computed({
  get: () => workspace.maintenanceMode,
  set: (value) => {
    workspace.maintenanceMode = value;
  }
});
</script>

<template>
  <section class="workspace-page">
    <div class="workspace-hero maintenance-hero">
      <div>
        <p class="workspace-eyebrow">数据维护</p>
        <h2>新增、修改和管理卫生间数据</h2>
        <p>这里集中处理数据写入类操作：新增点位、编辑已有记录、人工核验和处理数据源更新冲突。</p>
      </div>
    </div>

    <el-segmented v-model="mode" class="maintenance-mode"
                  :options="[
                    { label: '新增点位', value: 'create' },
                    { label: '编辑记录', value: 'edit' },
                    { label: '待 Review', value: 'review' }
                  ]"/>

    <div class="maintenance-panel">
      <add-page v-if="mode === 'create'" embedded/>
      <edit-page v-else-if="mode === 'edit'" embedded/>
      <review-queue v-else/>
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

</style>
