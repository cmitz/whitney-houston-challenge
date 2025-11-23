import { assign, setup, not } from 'xstate'

const THRESHOLDS = [
  {
    below: 100,
    points: 10,
  },
  {
    below: 300,
    points: 7,
  },
  {
    below: 500,
    points: 5,
  },
  {
    below: 1000,
    points: 3,
  },
  {
    below: 1500,
    points: 2,
  },
  {
    below: 2000,
    points: 1,
  },
]

export const gameMachine = setup({
  actions: {
    setTeamName: assign({ teamName: ({ event }) => event.value }),
  },
  guards: {
    isEventTeamNameValid: ({ event }) => event.value.length > 3,
  },
}).createMachine({
  context: {
    teamName: '',
    score: null,
    gameStartedAt: Date.now(),
    attemptStartedAt: null,
    hitTimestamp: null,
    msOff: null,
  },
  id: 'WhitneyHoustonChallenge',
  initial: 'INITIAL',
  states: {
    INITIAL: {
      always: {
        target: 'SETUP',
      },
    },
    SETUP: {
      on: {
        TEAM_NAME_CHANGED: [
          {
            target: 'READY_TO_PLAY',
            actions: ['setTeamName'],
            guard: 'isEventTeamNameValid',
          },
          {
            actions: ['setTeamName'],
          },
        ],
      },
    },
    READY_TO_PLAY: {
      on: {
        START_GAME: {
          target: 'PLAYING',
        },
        TEAM_NAME_CHANGED: [
          {
            target: 'SETUP',
            actions: ['setTeamName'],
            guard: not('isEventTeamNameValid'),
          },
          {
            actions: ['setTeamName'],
          },
        ],
      },
    },
    PLAYING: {
      entry: assign({
        attemptStartedAt: Date.now(),
      }),
      on: {
        TIMEOUT: {
          target: 'FAILED',
          actions: assign({
            msOff: 10000,
            score: 0,
          }),
        },
        SAVE_SCORE: {
          target: 'COMPLETED',
          actions: assign({
            hitTimestamp: ({ event }) => event.hitTimestamp,
            msOff: ({ event }) => event.msOff,
            score: ({ context, event }) =>
              THRESHOLDS.find((threshold) => threshold.below >= event.msOff)?.points || 0,
          }),
        },
      },
    },
    FAILED: {
      on: {
        SAVE_SCORE: {
          target: 'SETUP',
          actions: assign({
            msOff: ({ event }) => event.msOff,
            score: ({ context, event }) =>
              THRESHOLDS.find((threshold) => threshold.below >= event.msOff)?.points || 0,
          }),
        },
      },
    },
    COMPLETED: {
      on: {
        SAVE_SCORE: {
          target: 'SETUP',
        },
      },
    },
  },
})
