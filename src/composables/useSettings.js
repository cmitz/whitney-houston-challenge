import { ref } from 'vue'
import {
  saveSlackWebhookToStorage,
  clearSlackWebhookFromStorage,
  getSlackWebhookFromStorage,
  saveLatencyCompensationToStorage,
  getLatencyCompensationFromStorage,
} from '../helpers/localStorage'

/**
 * Creates a settings management object for the application.
 *
 * Usage:
 * 1. In MainLayout or parent component:
 *    const settings = createSettings()
 *    provide(SettingsSymbol, settings)
 *    settings.loadPersistedSettings() // on mount
 *
 * 2. In any child component:
 *    const settings = inject(SettingsSymbol)
 *    settings.suspendSlackPosting      // reactive ref (not persisted)
 *    settings.slackWebhookUrl          // reactive ref (persisted)
 *    settings.toggleSuspendSlackPosting() // toggle method
 *    settings.saveWebhook(url)         // save and persist webhook
 *
 * Persisted settings: slackWebhookUrl (saved to localStorage)
 * Non-persisted settings: suspendSlackPosting (state only, resets on reload)
 */
export function createSettings() {
  // Persisted settings
  const slackWebhookUrl = ref('')
  const latencyCompensation = ref(250)

  // Non-persisted settings (state only)
  const suspendSlackPosting = ref(false)

  // Load persisted settings from storage
  function loadPersistedSettings() {
    const savedWebhook = getSlackWebhookFromStorage()
    if (savedWebhook) {
      slackWebhookUrl.value = savedWebhook
    }
    const savedLatencyCompensation = getLatencyCompensationFromStorage()
    if (savedLatencyCompensation !== null) {
      latencyCompensation.value = savedLatencyCompensation
    }
  }

  // Save webhook to storage
  function saveWebhook(url) {
    const trimmedUrl = url.trim()
    if (trimmedUrl) {
      saveSlackWebhookToStorage(trimmedUrl)
      slackWebhookUrl.value = trimmedUrl
      return true
    }
    return false
  }

  // Clear webhook from storage
  function clearWebhook() {
    clearSlackWebhookFromStorage()
    slackWebhookUrl.value = ''
  }

  // Save latency compensation to storage
  function saveLatencyCompensation(value) {
    const numValue = Math.max(0, Number(value))
    saveLatencyCompensationToStorage(numValue)
    latencyCompensation.value = numValue
    return true
  }

  // Toggle suspend slack posting (state only, not persisted)
  function toggleSuspendSlackPosting() {
    suspendSlackPosting.value = !suspendSlackPosting.value
  }

  // Set suspend slack posting state
  function setSuspendSlackPosting(value) {
    suspendSlackPosting.value = value
  }

  return {
    // Persisted settings (exposed as readonly refs for reactivity)
    slackWebhookUrl,
    saveWebhook,
    clearWebhook,
    latencyCompensation,
    saveLatencyCompensation,

    // Non-persisted settings (exposed as readonly refs for reactivity)
    suspendSlackPosting,
    toggleSuspendSlackPosting,
    setSuspendSlackPosting,

    // Lifecycle
    loadPersistedSettings,
  }
}

// Symbol for inject/provide
export const SettingsSymbol = Symbol('settings')
