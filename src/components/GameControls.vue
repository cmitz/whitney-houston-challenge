<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted, inject } from 'vue'
import { useActor } from '@xstate/vue'
import { sortBy } from 'lodash'

import { gameMachine } from '../state-machines/gameMachine'
import ScoreBoard from './ScoreBoard.vue'
import { loadRoundsFromStorage, addRoundToStorage } from '../helpers/localStorage'
import { postScoreToSlack } from '../helpers/postToSlack'
import { SettingsSymbol } from '../composables/useSettings'

const registerStorageClearedCallback = inject('registerStorageClearedCallback', () => {})
const settings = inject(SettingsSymbol)

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
  sendActor({ type: 'round.start' })
  challengeAudioRef.value.play()
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
  postScoreToSlack(roundData, settings.suspendSlackPosting.value)
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
  return sortBy(scoresList.value, ['msOff'])
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
      :class="{
        'button--playing': actor.matches('roundPlaying'),
        'button--inactive': !actor.matches('roundPlaying'),
      }"
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
@keyframes redFlash {
  0% {
    background: radial-gradient(circle at 30% 30%, #ff6b6b, #dc3545 50%, #a02030);
  }
  50% {
    background: radial-gradient(circle at 30% 30%, #ff5555, #ff3333 50%, #cc0000);
    box-shadow:
      inset -2px -2px 5px rgba(0, 0, 0, 0.5),
      inset 2px 2px 5px rgba(255, 255, 255, 0.2),
      0 15px 30px 10px rgba(0, 0, 0, 0.5),
      0 5px 15px rgba(0, 0, 0, 0.4),
      0 0 50px 25px rgba(255, 51, 51, 0.7),
      0 0 100px 50px rgba(204, 0, 0, 0.4);
    filter: drop-shadow(0 0 40px rgba(255, 51, 51, 0.6));
  }
  100% {
    background: radial-gradient(circle at 30% 30%, #ff6b6b, #dc3545 50%, #a02030);
  }
}

.team-input {
  grid-area: team-input;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 1rem;

  input {
    flex: 1;
    border: none;
    padding: 0.75rem 1rem;
    font-size: 1.2rem;
    outline: none;
    transition: all 0.3s ease;
    background-color: #1a1a1a;
    color: #ffffff;
    font-family: monospace, sans-serif;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-bottom: 2px solid #000;
    max-height: 150px;

    &::placeholder {
      color: #fff;
    }

    &:focus {
      background-color: #252525;
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 0 8px rgba(0, 123, 255, 0.2);
      border-bottom: 2px solid #007bff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      color: #888;
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
    transform-style: preserve-3d;
    transform: perspective(2cm) rotateX(5deg);
    border: none;
    border-radius: 100%;
    aspect-ratio: 1/1;
    font-size: 2.5rem;
    font-weight: bold;
    color: #f5f5f5;
    background: radial-gradient(circle at 30% 30%, #ff6b6b, #dc3545 50%, #a02030);
    /*cursor: not-allowed;*/
    transition: all 0.1s ease;

    border: 15px solid #333;
    box-shadow:
      inset -2px -2px 5px rgba(0, 0, 0, 0.5),
      inset 2px 2px 5px rgba(255, 255, 255, 0.2),
      0 15px 30px 10px rgba(0, 0, 0, 0.5),
      0 5px 15px rgba(0, 0, 0, 0.4);

    &.button--playing {
      cursor: pointer;
      animation: redFlash 0.8s ease-in-out 6s infinite;

      &:hover {
        background: radial-gradient(circle at 30% 30%, #ff7777, #e63e52 50%, #b02840);
        box-shadow:
          inset -2px -2px 5px rgba(0, 0, 0, 0.5),
          inset 2px 2px 5px rgba(255, 255, 255, 0.2),
          0 18px 35px 12px rgba(0, 0, 0, 0.5),
          0 6px 18px rgba(0, 0, 0, 0.4);
      }
      &:active {
        background: radial-gradient(circle at 30% 30%, #ff5555, #cc2f42 50%, #8a1f30);
        box-shadow:
          inset -2px -2px 5px rgba(0, 0, 0, 0.6),
          inset 2px 2px 5px rgba(255, 255, 255, 0.1),
          0 5px 10px 5px rgba(0, 0, 0, 0.6),
          0 2px 5px rgba(0, 0, 0, 0.5);
        transform: scale(0.98);
      }
    }

    &.button--inactive {
      cursor: not-allowed;
      opacity: 0.6;
      background: radial-gradient(circle at 30% 30%, #8b4545, #6b3535 50%, #4a1f20);
      box-shadow:
        inset -2px -2px 5px rgba(0, 0, 0, 0.7),
        inset 2px 2px 5px rgba(255, 255, 255, 0.05),
        0 10px 20px 8px rgba(0, 0, 0, 0.6),
        0 3px 8px rgba(0, 0, 0, 0.5),
        0 0 15px rgba(139, 69, 69, 0.4),
        0 0 30px rgba(139, 69, 69, 0.2);
      filter: drop-shadow(0 0 20px rgba(139, 69, 69, 0.3));
      color: #b0b0b0;
    }
  }
}
</style>
