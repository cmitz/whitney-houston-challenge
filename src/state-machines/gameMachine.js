import { assign, setup } from 'xstate'

const IDEAL_HIT_TIMESTAMP_AFTER_START = 19000
export const DEFAULT_LATENCY_COMPENSATION = 20
const THRESHOLDS = [
  {
    below: 300,
    points: 10,
  },
  {
    below: 600,
    points: 7,
  },
  {
    below: 1000,
    points: 5,
  },
  {
    below: 1500,
    points: 3,
  },
  {
    below: 2000,
    points: 2,
  },
  {
    below: 3000,
    points: 1,
  },
]

function initialcontext(latencyCompensation = DEFAULT_LATENCY_COMPENSATION) {
  return {
    teamName: '',
    score: null,
    gamePlayedAt: null,
    msOff: null,
    latencyCompensation,
  }
}

function testTeamNameLength({ context }) {
  return context.teamName.length > 3
}

export function createGameMachine(latencyCompensation = DEFAULT_LATENCY_COMPENSATION) {
  return setup({}).createMachine({
    context: initialcontext(latencyCompensation),
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
            actions: assign(({ event, context }) => {
              console.log('seconds in the music:', event.secondsIn)
              const msAfterStart = event.secondsIn * 1000
              const msOff = Math.abs(
                msAfterStart - IDEAL_HIT_TIMESTAMP_AFTER_START - context.latencyCompensation,
              )
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
      'latency.update': {
        actions: assign({
          latencyCompensation: ({ event }) => event.value,
        }),
      },
    },
  })
}

export const gameMachine = createGameMachine()
