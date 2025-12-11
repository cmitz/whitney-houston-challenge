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
            v-model="webhookUrl"
            type="text"
            placeholder="https://hooks.slack.com/services/..."
            class="webhook-input"
          />
          <button @click="handleSaveWebhook" class="save-btn" :disabled="!slackWebhookUrlValid">
            Save Webhook
          </button>
          <p v-if="webhookSaved" class="success-message">✓ Webhook saved successfully</p>
        </div>

        <hr class="divider" />

        <div class="settings-section">
          <h3>Slack Integration</h3>
          <div class="toggle-container">
            <label for="suspend-slack" class="toggle-label">Suspend Slack Posting</label>
            <button
              id="suspend-slack"
              class="toggle-btn"
              :class="{ active: suspendState }"
              @click="toggleSuspend"
              :aria-pressed="suspendState"
            >
              <span class="toggle-switch"></span>
            </button>
          </div>
        </div>

        <hr class="divider" />

        <div class="settings-section">
          <h3>Latency Compensation</h3>
          <label for="latency-slider">Compensation: {{ latencyCompensationValue }} ms</label>
          <input
            id="latency-slider"
            v-model.number="latencyCompensationValue"
            type="range"
            min="0"
            max="500"
            step="10"
            class="latency-slider"
          />
          <p class="warning-text">
            Adjust based on your device's input latency. Test below to find your optimal value.
          </p>
        </div>

        <hr class="divider" />

        <div class="settings-section">
          <h3>Test latency</h3>
          <p class="warning-text">Press the button on the 4th beat</p>
          <div class="latency-test">
            <button @click="startLatencyTest">Start test</button>
            <figure>
              <figcaption hidden>Metronome</figcaption>
              <audio
                noremoteplayback
                preload="auto"
                @pause="resetLatencyTest"
                ref="latencyTestAudioRef"
                src="metronome-4-beats.wav"
              ></audio>
            </figure>

            <pre>{{ msCompensation }} ms compensation</pre>
            <button @click="handleApplyLatencyTest" class="save-btn">Apply test result</button>
          </div>
        </div>

        <hr class="divider" />

        <div class="settings-section">
          <h3>Data Management</h3>
          <button @click="handleClearLocalStorage" class="danger-btn">Clear localStorage</button>
          <p class="warning-text">This will delete all saved scores and cannot be undone.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { clearRoundsFromStorage } from '../helpers/localStorage'
import { SettingsSymbol } from '../composables/useSettings'

const emit = defineEmits(['localStorage-cleared'])

const settings = inject(SettingsSymbol)
const isOpen = ref(false)
const webhookUrl = ref('')
const webhookSaved = ref(false)
const latencyCompensationValue = ref(250)

const suspendState = computed(() => settings.suspendSlackPosting.value)

const latencyTestAudioRef = ref(null)
const latencyTestStartedAt = ref(null)
const msCompensation = ref(0)
const latencyTestStarted = ref(false)

function toggleSuspend() {
  settings.toggleSuspendSlackPosting()
}

function openPopup() {
  isOpen.value = true
  webhookUrl.value = settings.slackWebhookUrl.value || ''
  latencyCompensationValue.value = settings.latencyCompensation.value
}

function closePopup() {
  isOpen.value = false
  webhookSaved.value = false
  webhookUrl.value = settings.slackWebhookUrl.value || ''
  latencyCompensationValue.value = settings.latencyCompensation.value
}

function togglePopup() {
  if (isOpen.value) {
    closePopup()
  } else {
    openPopup()
  }
}

function handleLatencyCompensationChange() {
  settings.saveLatencyCompensation(latencyCompensationValue.value)
}

const slackWebhookUrlValid = computed(() => {
  const url = webhookUrl.value.trim()
  return url.startsWith('https://hooks.slack.com/services/') || url === ''
})

function handleSaveWebhook() {
  if (webhookUrl.value.trim()) {
    settings.saveWebhook(webhookUrl.value)
    webhookSaved.value = true
    setTimeout(() => {
      webhookSaved.value = false
    }, 3000)
  }
}

function startLatencyTest() {
  console.log('Started latency test')
  latencyTestStarted.value = true
  latencyTestStartedAt.value = Date.now()
  latencyTestAudioRef.value.play()
}

function resetLatencyTest() {
  console.log('Resetting latency test')
  latencyTestAudioRef.value.currentTime = 0
  latencyTestAudioRef.value.pause()
}

// The beat is exactly on the 2 seconds mark
function handleLatencyTestButton() {
  console.log('Pressed X')
  if (latencyTestStarted.value) {
    msCompensation.value = Date.now() - latencyTestStartedAt.value - 1500
  }
  resetLatencyTest()
}

function handleApplyLatencyTest() {
  if (msCompensation.value !== 0) {
    latencyCompensationValue.value = msCompensation.value
    handleLatencyCompensationChange()
  }
}

function handleClearLocalStorage() {
  if (confirm('Are you sure you want to delete all saved scores? This cannot be undone.')) {
    clearRoundsFromStorage()
    settings.clearWebhook()
    webhookUrl.value = ''
    emit('localStorage-cleared')
    closePopup()
  }
}

function handleButton(event) {
  if (event.key === 'Escape' && isOpen.value) {
    closePopup()
  }
  if (event.key.toLowerCase() === 'x') {
    handleLatencyTestButton()
    event.preventDefault()
  }
}

watch(latencyCompensationValue, (newValue) => {
  settings.saveLatencyCompensation(newValue)
})

onMounted(() => {
  window.addEventListener('keydown', handleButton)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleButton)
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
  font-size: 10px;
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

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toggle-label {
  margin: 0;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.toggle-btn {
  position: relative;
  width: 50px;
  height: 28px;
  border: 2px solid #ddd;
  border-radius: 14px;
  background-color: #f0f0f0;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding-left: 2px;
}

.toggle-btn:hover {
  border-color: #2d5f4f;
}

.toggle-btn.active {
  background-color: #2d5f4f;
  border-color: #2d5f4f;
  padding-left: auto;
  padding-right: 2px;
}

.toggle-switch {
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  display: block;
}

.toggle-btn.active .toggle-switch {
  transform: translateX(22px);
}

.info-text {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 13px;
  font-weight: 500;
}

.latency-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 12px 0;
}

.latency-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2d5f4f;
  cursor: pointer;
  transition: background 0.2s;
}

.latency-slider::-webkit-slider-thumb:hover {
  background: #1f3f35;
}

.latency-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2d5f4f;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.latency-slider::-moz-range-thumb:hover {
  background: #1f3f35;
}

.latency-test {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1rem;
}
</style>
