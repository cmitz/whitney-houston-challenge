<template>
  <div v-if="isOpen" class="settings-overlay" @click.self="closePopup">
    <div class="settings-popup">
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="close-btn" @click="closePopup">✕</button>
      </div>

      <div class="settings-content">
        <div class="settings-section">
          <label for="slack-webhook">Slack Webhook URL:</label>
          <input
            id="slack-webhook"
            v-model="slackWebhookUrl"
            type="text"
            placeholder="https://hooks.slack.com/services/..."
            class="webhook-input"
          />
          <button @click="saveSlackWebhook" class="save-btn" :disabled="!slackWebhookUrlValid">
            Save Webhook
          </button>
          <p v-if="webhookSaved" class="success-message">✓ Webhook saved successfully</p>
        </div>

        <hr class="divider" />

        <div class="settings-section">
          <h3>Data Management</h3>
          <button @click="clearLocalStorage" class="danger-btn">Clear localStorage</button>
          <p class="warning-text">This will delete all saved scores and cannot be undone.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  clearRoundsFromStorage,
  clearSlackWebhookFromStorage,
  saveSlackWebhookToStorage,
} from '../state-machines/roundsStorage'

const emit = defineEmits(['localStorage-cleared'])

const isOpen = ref(false)
const slackWebhookUrl = ref('')
const webhookSaved = ref(false)

const WEBHOOK_STORAGE_KEY = 'slack_webhook_url'

function openPopup() {
  isOpen.value = true
  loadSlackWebhook()
}

function closePopup() {
  isOpen.value = false
  webhookSaved.value = false
}

function togglePopup() {
  if (isOpen.value) {
    closePopup()
  } else {
    openPopup()
  }
}

function loadSlackWebhook() {
  const saved = localStorage.getItem(WEBHOOK_STORAGE_KEY)
  if (saved) {
    slackWebhookUrl.value = saved
  }
}

const slackWebhookUrlValid = computed(() => {
  return (
    slackWebhookUrl.value.trim().startsWith('https://hooks.slack.com/services/') ||
    slackWebhookUrl.value.trim() === ''
  )
})
function saveSlackWebhook() {
  if (slackWebhookUrl.value.trim()) {
    saveSlackWebhookToStorage(slackWebhookUrl.value.trim())
    webhookSaved.value = true
    setTimeout(() => {
      webhookSaved.value = false
    }, 3000)
  }
}

function clearLocalStorage() {
  if (confirm('Are you sure you want to delete all saved scores? This cannot be undone.')) {
    clearRoundsFromStorage()
    clearSlackWebhookFromStorage()
    // Reload the webhook after clearing
    loadSlackWebhook()
    // Emit event to notify other components
    emit('localStorage-cleared')
    closePopup()
  }
}

function handleEscape(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closePopup()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})

defineExpose({
  openPopup,
  closePopup,
  togglePopup,
})
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-popup {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.settings-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.settings-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.webhook-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.webhook-input:focus {
  outline: none;
  border-color: #2d5f4f;
  box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
}

.save-btn,
.danger-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.save-btn {
  background-color: #2d5f4f;
  color: white;
}

.save-btn:hover {
  background-color: #1f3f35;
}

.save-btn:disabled {
  background-color: #ccc;
}

.save-btn:active {
  transform: scale(0.98);
}

.danger-btn {
  background-color: #dc3545;
  color: white;
}

.danger-btn:hover {
  background-color: #c82333;
}

.danger-btn:active {
  transform: scale(0.98);
}

.success-message {
  margin: 8px 0 0 0;
  color: #28a745;
  font-size: 13px;
  font-weight: 500;
}

.warning-text {
  margin: 8px 0 0 0;
  color: #999;
  font-size: 12px;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0;
}
</style>
