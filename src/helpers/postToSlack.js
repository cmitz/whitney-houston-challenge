import { getSlackWebhookFromStorage } from './localStorage'

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
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Failed to post score to Slack:', response.statusText)
    }
  } catch (error) {
    console.error('Error posting score to Slack:', error)
  }
}
