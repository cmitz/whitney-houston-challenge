const STORAGE_KEY = 'whitney_houston_rounds'

export function loadRoundsFromStorage() {
  try {
    if (Object.prototype.hasOwnProperty.call(localStorage, STORAGE_KEY)) {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } else {
      return []
    }
  } catch (error) {
    console.error('Failed to load rounds from storage:', error)
    return []
  }
}

export function saveRoundsToStorage(rounds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds))
  } catch (error) {
    console.error('Failed to save rounds to storage:', error)
  }
}

export function addRoundToStorage(round) {
  const rounds = loadRoundsFromStorage()
  rounds.push({
    ...round,
    id: round.gamePlayedAt,
  })
  saveRoundsToStorage(rounds)
  return rounds
}

export function clearRoundsFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear rounds from storage:', error)
  }
}

const WEBHOOK_STORAGE_KEY = 'slack_webhook_url'

export function saveSlackWebhookToStorage(slackWebhookUrl) {
  try {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, slackWebhookUrl)
  } catch (error) {
    console.error('Failed to save rounds to storage:', error)
  }
}

export function clearSlackWebhookFromStorage() {
  try {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear webhook from storage:', error)
  }
}

export function getSlackWebhookFromStorage() {
  try {
    return localStorage.getItem(WEBHOOK_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to get webhook from storage:', error)
    return null
  }
}
