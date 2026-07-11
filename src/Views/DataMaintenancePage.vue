<script lang="ts" setup>
import ReviewQueue from "@/components/maintenance/ReviewQueue.vue";
</script>

<template>
  <section class="workspace-page">
    <div class="workspace-hero maintenance-hero">
      <div>
        <p class="workspace-eyebrow">数据维护</p>
        <h2>核验卫生间数据</h2>
        <p>处理待核验记录和数据源更新冲突，选择单条记录后可在弹窗中编辑。</p>
      </div>
    </div>

    <div class="maintenance-panel">
      <review-queue/>
    </div>
  </section>
</template>

<style scoped>
.maintenance-hero {
  background: var(--itp-edit-hero);
}

.maintenance-panel {
  margin-top: 16px;
}

</style>
