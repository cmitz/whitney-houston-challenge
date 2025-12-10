<script setup>
import { RouterView } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
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

:root {
  --color-background-highlight: #798e36;
  --color-background-dark: #07190d;
  --layout-aspect-ratio: 16 / 9;
}

body {
  background: radial-gradient(
    circle,
    var(--color-background-highlight) 0%,
    var(--color-background-dark) 100%
  );
}
</style>
