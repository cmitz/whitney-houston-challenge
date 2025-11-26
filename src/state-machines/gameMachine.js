import { assign, setup, not } from 'xstate'

const IDEAL_HIT_TIMESTAMP_AFTER_START = 19000
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

function initialcontext() {
  return {
    teamName: '',
    score: null,
    gamePlayedAt: null,
    msOff: null,
  }
}

function testTeamNameLength({ context }) {
  return context.teamName.length > 3
}

export const gameMachine = setup({}).createMachine({
  context: initialcontext(),
  id: 'WhitneyHoustonChallenge',
  initial: 'loadingGame',
  states: {
    loadingGame: {
      on: {
        'game.loaded': {
          target: 'waitingForTeamName',
        },
      },
    },
    waitingForTeamName: {
      always: {
        target: 'waitingForStart',
        guard: (event) => testTeamNameLength(event),
      },
      on: {},
    },
    waitingForStart: {
      always: {
        target: 'waitingForTeamName',
        guard: (event) => !testTeamNameLength(event),
      },
      on: {
        'round.start': {
          target: 'roundPlaying',
        },
      },
    },
    roundPlaying: {
      entry: assign({
        gamePlayedAt: () => Date.now(),
      }),
      on: {
        'round.timeout': {
          target: 'roundFinished',
          actions: assign({
            msOff: Infinity,
            score: 0,
          }),
        },
        'round.completed': {
          target: 'roundFinished',
          actions: assign(({ context, event }) => {
            console.log('seconds in the music:', event.secondsIn)
            const msAfterStart = event.secondsIn * 1000
            const msOff = Math.abs(msAfterStart - IDEAL_HIT_TIMESTAMP_AFTER_START)
            const score = THRESHOLDS.find((threshold) => threshold.below >= msOff)?.points || 0
            return { msOff, score }
          }),
        },
      },
    },
    roundFinished: {
      on: {
        'game.reset': {
          target: 'waitingForTeamName',
          actions: assign(initialcontext()),
        },
      },
    },
  },
  on: {
    'team.update_name': {
      actions: assign({
        teamName: ({ event }) => event.value,
      }),
    },
  },
})
