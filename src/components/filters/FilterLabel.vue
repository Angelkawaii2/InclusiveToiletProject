<script setup lang="ts">
defineProps<{
  label: string
  description: string
}>()
</script>

<template>
  <span class="filter-label">
    <span>{{ label }}</span>
    <el-tooltip :content="description" placement="top" :show-after="250">
      <el-button class="filter-help" link :aria-label="`${label}筛选说明`">(?)</el-button>
    </el-tooltip>
  </span>
</template>

<style scoped>
.filter-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.filter-help {
  height: auto;
  min-height: 20px;
  padding: 0;
  line-height: 1;
  cursor: help;
}
</style>
