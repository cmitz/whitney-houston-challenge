<template>
  <div class="layout">
    <figure>
      <img :src="GameShowLogo" alt="Whitney Houston Challenge" />
    </figure>
    <main>
      <slot />
    </main>
    <SettingsPopup ref="settingsPopupRef" @localStorage-cleared="notifyStorageCleared" />
  </div>
</template>

<script setup lang="js">
import { ref, provide, onMounted, onUnmounted } from 'vue'

import SettingsPopup from '../components/SettingsPopup.vue'

import GameShowLogo from '../assets/logo_03.png'

const settingsPopupRef = ref(null)
const callbacks = ref([])

function handleKeyDown(e) {
  // Cmd+, (Comma) on Mac or Ctrl+, on Windows/Linux
  if ((e.metaKey || e.ctrlKey) && e.key === ',') {
    e.preventDefault()
    settingsPopupRef.value?.togglePopup()
  }
}

function notifyStorageCleared() {
  callbacks.value.forEach((callback) => callback())
}

function registerStorageClearedCallback(callback) {
  callbacks.value.push(callback)
}

provide('registerStorageClearedCallback', registerStorageClearedCallback)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style>
.layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  aspect-ratio: var(--layout-aspect-ratio);
  overflow: hidden;
  background: radial-gradient(
    circle,
    var(--color-background-highlight) 0%,
    var(--color-background-dark) 100%
  );
}

main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
