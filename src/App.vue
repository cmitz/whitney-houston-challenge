<script setup>
import { RouterLink, RouterView } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
  <div v-if="false">
    <nav>
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/poc">Go to POC</RouterLink>
    </nav>

    <hr />
  </div>

  <MainLayout>
    <RouterView />
  </MainLayout>
</template>

<style scoped></style>

<style>
/**
* By wrapping the reset in a layer, it automatically has zero
* specificity, thus it is overridden by all other styles
*/
@import 'reset.css' layer(reset);
</style>
