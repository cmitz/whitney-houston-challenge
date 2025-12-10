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
    <h2 class="scoreboard-header">History</h2>
    <div v-if="scores.length === 0" class="empty-message">
      <div class="magnetic-strip">
        <span class="empty-text">Make your first attempt!</span>
      </div>
    </div>
    <TransitionGroup v-else name="list" tag="ul" class="score-list">
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
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  overflow-y: hidden;
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  /* Hide scrollbar while keeping scrolling functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Hide scrollbar for webkit browsers (Chrome, Safari) */
.score-list::-webkit-scrollbar {
  display: none;
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

/* Header */
.scoreboard-header {
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 6px;
}

/* Empty state */
.empty-message {
  width: 100%;
}

.empty-text {
  color: #888;
  font-size: 1.1rem;
  text-align: center;
  display: block;
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
