<script setup lang="ts">
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