<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted, inject } from 'vue'
import { useActor } from '@xstate/vue'
import { sortBy } from 'lodash'

import { gameMachine } from '../state-machines/gameMachine'
import ScoreBoard from './ScoreBoard.vue'
import { loadRoundsFromStorage, addRoundToStorage } from '../helpers/localStorage'
import { postScoreToSlack } from '../helpers/postToSlack'

const registerStorageClearedCallback = inject('registerStorageClearedCallback', () => {})

// UI elements
const challengeAudioRef = ref(null)
const buttonHitAudioRef = ref(null)
const hitButtonRef = ref(null)
const teamNameInputRef = ref(null)

// Data
const loadingStatusRef = ref({
  challengeAudioLoaded: false,
  buttonHitAudioLoaded: false,
})
const scoresList = ref([])

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
}

// Gameplay status
const { snapshot: actor, send: sendActor } = useActor(gameMachine)

// Button handlers
function startChallenge() {
  if (audioContext.value.state === 'suspended') {
    audioContext.value.resume()
  }
  challengeAudioRef.value.currentTime = 0
  challengeAudioRef.value.play()
  sendActor({ type: 'round.start' })
  hitButtonRef.value.focus()
}

function hit() {
  buttonHitAudioRef.value.currentTime = 0
  buttonHitAudioRef.value.play()

  // Update score object
  sendActor({ type: 'round.completed', secondsIn: challengeAudioRef.value.currentTime })

  const { context } = actor.value
  const roundData = {
    teamName: context.teamName,
    score: context.score,
    msOff: context.msOff,
    gamePlayedAt: context.gamePlayedAt,
  }
  addRoundToStorage(roundData)
  postScoreToSlack(roundData)
  scoresList.value = loadRoundsFromStorage()
}

function saveAndPlayAgain() {
  sendActor({ type: 'game.reset' })

  scoresList.value = loadRoundsFromStorage()
  challengeAudioRef.value.pause()
  teamNameInputRef.value.focus()
}

function reloadScores() {
  scoresList.value = loadRoundsFromStorage()
}

// const musicPlaying = computed(() => {
//   if (audioContext.value) {
//     return audioContext.value.state !== 'playing'
//   }
//   return false
// })
const sortedScores = computed(() => {
  return sortBy(scoresList.value, ['score', 'msOff']).reverse()
})

// Event listeners
function challengeAudioLoadedCompletely() {
  loadingStatusRef.value.challengeAudioLoaded = true
}
function buttonHitAudioLoadedCompletely() {
  loadingStatusRef.value.buttonHitAudioLoaded = true
}
watchEffect(() => {
  if (loadingStatusRef.value.challengeAudioLoaded && loadingStatusRef.value.buttonHitAudioLoaded) {
    sendActor({ type: 'game.loaded' })
  }
})
function audioEnded() {
  sendActor({ type: 'round.timeout' })
}

// Lifecycle managers
onMounted(() => {
  initAudioAPI()
  scoresList.value = loadRoundsFromStorage()

  // Register listener for localStorage cleared events
  if (registerStorageClearedCallback) {
    registerStorageClearedCallback(reloadScores)
  }
})

onUnmounted(() => {
  // cleanup if needed
})
</script>

<template>
  <div class="team-input">
    <input
      @input="sendActor({ type: 'team.update_name', value: $event.target.value })"
      :value="actor.context.teamName"
      type="text"
      @keyup.enter="startChallenge"
      :disabled="!['waitingForTeamName', 'waitingForStart'].includes(actor.value)"
      max="24"
      autofocus
      ref="teamNameInputRef"
    />
    <button @click="startChallenge" :disabled="!actor.matches('waitingForStart')">
      Start challenge
    </button>

    <button @click="saveAndPlayAgain" :disabled="!actor.matches('roundFinished')">
      Save and play again
    </button>
  </div>

  <div class="big-red-button">
    <button
      @click="hit"
      :disabled="!actor.matches('roundPlaying')"
      ref="hitButtonRef"
      class="button"
      :class="{ 'button--playing': actor.matches('roundPlaying') }"
    >
      HIT IT!
    </button>
  </div>

  <footer>
    <figure>
      <figcaption hidden>Listen to the Whitney Houston Challenge!</figcaption>
      <audio
        disableremoteplayback
        preload="auto"
        ref="challengeAudioRef"
        src="/challenge_snippet_i_will_always_love_rudolph.wav"
        @ended="audioEnded"
        @canplaythrough="challengeAudioLoadedCompletely"
      ></audio>
    </figure>
    <figure>
      <figcaption hidden>The drum hit</figcaption>
      <audio
        disableremoteplayback
        preload="auto"
        ref="buttonHitAudioRef"
        src="/impact.wav"
        @canplaythrough="buttonHitAudioLoadedCompletely"
      ></audio>
    </figure>
  </footer>

  <ScoreBoard :scores="sortedScores" />
</template>

<style scoped lang="css">
.team-input {
  grid-area: team-input;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 1rem;

  input {
    flex: 1;
    border: none;
    border-bottom: 1px solid #ccc;
    padding: 0.5rem;
    font-size: 1.2rem;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #007bff;
    }
  }
}
.big-red-button {
  grid-area: button;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;

  button {
    border: none;
    border-radius: 100%;
    aspect-ratio: 1/1;
    font-size: 1.2rem;
    color: white;
    background-color: #333;
    cursor: not-allowed;
    transition: background-color 0.3s ease;

    &.button--playing {
      cursor: pointer;
      background-color: #dc3545;

      &:hover {
        background-color: #c82333;
      }
      &:active {
        background-color: #faa;
      }
    }
  }
}
</style>
