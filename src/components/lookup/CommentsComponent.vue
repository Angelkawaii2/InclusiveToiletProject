<script lang="ts" setup>
import {inject} from "vue";

const store = inject('store')
if (!store) {
  throw new Error("No Store Provided.")
}


</script>

<template>

</template>

<style scoped>

</style>