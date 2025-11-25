<script setup>
import { ref, computed, onMounted } from 'vue'

import { useMachine } from '@xstate/vue'
import { createBrowserInspector } from '@statelyai/inspect'

import { gameMachine } from '../state-machines/gameMachine'

const IDEAL_HIT_TIMESTAMP_AFTER_START = 18737

// UI elements
const challengeAudioRef = ref(null)
const buttonHitAudioRef = ref(null)

// Audio API
const audioContext = ref(null)
const gainNodes = ref({
  challenge: null,
  buttonHit: null,
})

function initAudioAPI() {
  if (challengeAudioRef.value === null) {
    return
  }
  audioContext.value = new AudioContext()

  const challengeTrack = audioContext.value.createMediaElementSource(challengeAudioRef.value)
  const buttonHitTrack = audioContext.value.createMediaElementSource(buttonHitAudioRef.value)

  // Create gain nodes
  const challengeGain = audioContext.value.createGain()
  const buttonHitGain = audioContext.value.createGain()

  // Add strong entry of drum
  buttonHitGain.gain.value = 1.4

  /// Pipe gains to outputs
  challengeGain.connect(audioContext.value.destination)
  buttonHitGain.connect(audioContext.value.destination)

  challengeTrack.connect(challengeGain)
  buttonHitTrack.connect(buttonHitGain)

  // Save gain refs
  gainNodes.value.challenge = challengeGain
  gainNodes.value.buttonHit = buttonHitGain

  // More debugging:
  challengeAudioRef.value.addEventListener('play', () => {
    console.log('challengeAudioRef started')
  })
  challengeAudioRef.value.addEventListener('ended', () => {
    console.log('challengeAudioRef ended')
  })
}

// Gameplay status
const { inspect } = createBrowserInspector({ autoStart: false })
const { snapshot: state, send } = useMachine(gameMachine, {
  inspect,
})

// Button handlers
function startChallenge() {
  send({ type: 'START_GAME' })
  if (audioContext.value.state === 'suspended') {
    audioContext.value.resume()
  }
  challengeAudioRef.value.currentTime = 0
  challengeAudioRef.value.play()

  // Fade-in
  gainNodes.value.challenge.gain.value = 0.01
  gainNodes.value.challenge.gain.exponentialRampToValueAtTime(1.0, 2)

  // And fade-out at the end
  const waveArray = new Float32Array(4)
  waveArray[0] = 1
  waveArray[1] = 0.5
  waveArray[2] = 0.11
  waveArray[3] = 0.0
  console.log('duration', challengeAudioRef.value.duration)
  gainNodes.value.challenge.gain.setValueCurveAtTime(
    waveArray,
    challengeAudioRef.value.duration - 10,
    1,
  )
}

function hit() {
  buttonHitAudioRef.value.currentTime = 0
  buttonHitAudioRef.value.play()

  // Calculate score
  const hitTimestamp = new Date().getTime()
  if (!state.value.context.attemptStartedAt) debugger
  const startedAtTimestamp = state.value.context.attemptStartedAt

  const msAfterStart = hitTimestamp - startedAtTimestamp
  const msOff = msAfterStart - IDEAL_HIT_TIMESTAMP_AFTER_START
  console.log('msOff', msOff)

  // Update score object
  send({ type: 'SAVE_SCORE', msOff, hitTimestamp })
}

function updateTeamName($event) {
  send({ type: 'TEAM_NAME_CHANGED', value: $event.target.value })
}

function resetGame() {
  challengeAudioRef.value.currentTime = 0
  send({ type: 'RESET_GAME' })
}

const musicPlaying = computed(() => {
  if (audioContext.value) {
    return audioContext.value.state !== 'playing'
  }
  return false
})

// Event listeners
function audioEnded() {
  // Update score object
  send({ type: 'TIMEOUT' })
}

function resetHandler() {
  console.log('TODO: RESET GAME')
}
// state.addEventListener('reset', resetHandler)

// Lifecycle managers
onMounted(initAudioAPI)
</script>

<template>
  <input
    @input="updateTeamName"
    type="text"
    :disabled="!['SETUP', 'READY_TO_PLAY'].includes(state.value)"
    max="24"
  />

  <button @click="startChallenge" :disabled="!state.matches('READY_TO_PLAY')">
    Start challenge
  </button>

  <p>status: {{ musicPlaying }}; state: {{ state.value }}</p>

  <button @click="hit" :disabled="!state.matches('PLAYING')">HIT IT</button>

  <p font-size="48px" v-if="state.value === 'COMPLETED'">
    Score: {{ JSON.stringify(state.context) }}
  </p>

  <figure>
    <figcaption>Listen to the Whitney Houston Challenge!</figcaption>
    <audio
      disableremoteplayback
      preload="auto"
      ref="challengeAudioRef"
      src="/challenge_snippet_i_will_always_love_rudolph.wav"
    ></audio>
    <audio
      disableremoteplayback
      preload="auto"
      ref="buttonHitAudioRef"
      src="/impact.wav"
      @ended="audioEnded"
    ></audio>
  </figure>

  <button @click="resetGame">Reset</button>
</template>
