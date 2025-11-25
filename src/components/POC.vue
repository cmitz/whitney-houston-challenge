<script setup>
// import { ref, computed } from 'vue'

import { setup } from 'xstate'
import { useMachine } from '@xstate/vue'
import { createBrowserInspector } from '@statelyai/inspect'

const machine = setup({
  actions: {
    logEnteringState: ({ context, event }) => {
      console.log('Entering state', context, event)
      context.stepsCounted += 1
    },
  },
}).createMachine({
  context: {
    stepsCounted: 0,
  },
  initial: 'A',
  states: {
    A: {
      entry: ['logEnteringState'],
      on: {
        CLICK_A: 'B',
      },
    },
    B: {
      entry: ['logEnteringState'],
      on: {
        CLICK_B: 'C',
      },
    },
    C: {
      entry: ['logEnteringState'],
      on: {
        CLICK_C: 'A',
      },
    },
  },
})

const { inspect } = createBrowserInspector({
  // Comment out the line below to start the inspector
  autoStart: false,
})
const { snapshot, send } = useMachine(machine, { inspect })
</script>

<template>
  <div>
    <h1>POC</h1>
    <button @click="send({ type: 'CLICK_A' })">A (Go to B)</button>
    <button @click="send({ type: 'CLICK_B' })">B (Go to C)</button>
    <button @click="send({ type: 'CLICK_C' })">C (Go to A)</button>
    <hr />
    <h2>Current step: {{ snapshot.value }}</h2>
    <p>Steps counted: {{ snapshot.context.stepsCounted }}</p>
  </div>
</template>
