<script setup>
import { RouterLink } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
  <nav>
    <RouterLink to="/">Go to GAME</RouterLink>
    <RouterLink to="/poc">Go to POC</RouterLink>
  </nav>

  <hr />

  <MainLayout>
    <RouterView />
  </MainLayout>
</template>

<style scoped></style>
