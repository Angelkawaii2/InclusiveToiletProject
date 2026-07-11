<script lang="ts" setup>
import {computed} from "vue";
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
        <h2>编辑和核验卫生间数据</h2>
        <p>这里用于修改已有记录、人工核验，以及处理数据源更新冲突。</p>
      </div>
    </div>

    <el-segmented v-model="mode" class="maintenance-mode"
                  :options="[
                    { label: '编辑记录', value: 'edit' },
                    { label: '待 Review', value: 'review' }
                  ]"/>

    <div class="maintenance-panel">
      <edit-page v-if="mode === 'edit'" embedded/>
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
