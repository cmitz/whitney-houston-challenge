<script setup>
import { ref, computed, onMounted } from 'vue'

import { useMachine } from '@xstate/vue'
import { createBrowserInspector } from '@statelyai/inspect'

import { gameMachine } from '../state-machines/gameMachine'

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
  if (audioContext.value.state === 'suspended') {
    audioContext.value.resume()
  }
  challengeAudioRef.value.currentTime = 0
  challengeAudioRef.value.play()
  send({ type: 'round.start' })
}

function hit() {
  buttonHitAudioRef.value.currentTime = 0
  buttonHitAudioRef.value.play()

  // Update score object
  send({ type: 'round.completed', secondsIn: challengeAudioRef.value.currentTime })
}

function resetGame() {
  challengeAudioRef.value.pause()
  challengeAudioRef.value.currentTime = 0
  send({ type: 'round.reset' })
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
  send({ type: 'round.failed' })
}

// state.addEventListener('reset', resetHandler)

// Lifecycle managers
onMounted(initAudioAPI)
</script>

<template>
  <input
    @input="send({ type: 'team.update_name', value: $event.target.value })"
    :value="state.context.teamName"
    type="text"
    :disabled="!['waitingForTeamName', 'waitingForStart'].includes(state.value)"
    max="24"
  />

  <button @click="startChallenge" :disabled="!state.matches('waitingForStart')">
    Start challenge
  </button>

  <p>status: {{ musicPlaying }}; state: {{ state.value }}</p>

  <button @click="hit" :disabled="!state.matches('roundPlaying')">HIT IT</button>

  <figure>
    <figcaption>Listen to the Whitney Houston Challenge!</figcaption>
    <audio
      disableremoteplayback
      preload="auto"
      ref="challengeAudioRef"
      src="/challenge_snippet_i_will_always_love_rudolph.wav"
      @ended="audioEnded"
    ></audio>
    <audio disableremoteplayback preload="auto" ref="buttonHitAudioRef" src="/impact.wav"></audio>
  </figure>

  <button @click="resetGame">Reset</button>

  <hr />

  <pre>{{ JSON.stringify(state, null, 2) }}</pre>
</template>
