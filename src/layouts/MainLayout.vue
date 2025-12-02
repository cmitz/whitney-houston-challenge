<template>
  <div class="layout">
    <main>
      <slot />
    </main>
    <SettingsPopup ref="settingsPopupRef" @localStorage-cleared="notifyStorageCleared" />
  </div>
</template>

<script setup lang="js">
import { ref, provide, onMounted, onUnmounted } from 'vue'
import SettingsPopup from '../components/SettingsPopup.vue'

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
:root {
  --bg-primary: #2d5f4f;
  --bg-secondary: #3d7f5f;
  --layout-aspect-ratio: 16 / 9;
}

.layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  aspect-ratio: var(--layout-aspect-ratio);
  overflow: hidden;
}

main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
