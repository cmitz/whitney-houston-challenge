const STORAGE_KEY = 'whitney_houston_rounds'

export function loadRoundsFromStorage() {
  try {
    if (localStorage.hasOwnProperty(STORAGE_KEY)) {
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

export async function postScoreToSlack(round) {
  const webhookUrl = getSlackWebhookFromStorage()

  if (!webhookUrl) {
    console.log('No Slack webhook configured, skipping Slack post')
    return
  }

  try {
    const message = {
      text: `🎤 Whitney Houston Challenge Score!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🎤 Whitney Houston Challenge*\n*Team:* ${round.teamName}\n*Score:* ${round.score} points\n*Accuracy:* ${Math.round(round.msOff)}ms off`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Played at ${new Date(round.gamePlayedAt).toLocaleString()}`,
            },
          ],
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Failed to post score to Slack:', response.statusText)
    }
  } catch (error) {
    console.error('Error posting score to Slack:', error)
  }
}
