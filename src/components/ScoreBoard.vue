<script setup>
defineProps({
  scores: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="scoreboard">
    <h2>History</h2>
    <TransitionGroup name="list" tag="ul" class="score-list">
      <li v-for="score in scores" :key="score.id" class="score-item">
        <div class="magnetic-strip">
          <span class="team-name">{{ score.teamName }}</span>
          <span class="score-details">
            <span class="score-points">{{ score.score }} pts</span>
            <span class="score-accuracy">({{ Math.round(score.msOff) }}ms)</span>
          </span>
          <small class="score-date">{{ new Date(score.gamePlayedAt).toLocaleString() }}</small>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.scoreboard {
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;

  grid-area: right-sidebar;
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.score-item {
  margin-bottom: 0.5rem;
  width: 100%;
}

.magnetic-strip {
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-bottom: 2px solid #000;
  /* Magnetic strip "look" often implies slightly glossy or textured, but basic black/white is consistent with requests */
  font-family: monospace, sans-serif; /* Monospace gives a bit of a retro/label maker vibe */
}

.team-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-details {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #e0e0e0;
}

.score-date {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
  align-self: flex-end;
}

/* Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so others can move gracefully */
.list-leave-active {
  position: absolute;
}
</style>
