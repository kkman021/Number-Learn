<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useGameStore } from '../stores/game'
import NumberCard from '../components/NumberCard.vue'

const store = useGameStore()

const itemEmojis: Record<string, string> = {
  apple: '🍎', bird: '🐦', elephant: '🐘', car: '🚗', star: '⭐', 
  bear: '🐻', flower: '🌸', duck: '🦆', fish: '🐟', cat: '🐱', 
  dog: '🐶', ball: '⚽'
}

import bgSky from '../assets/bg_sky.png'
import bgOcean from '../assets/bg_ocean.png'
import bgSpace from '../assets/bg_space.png'
import bgOrchard from '../assets/bg_Orchard.png'

// Background themes based on items
// Adding a white overlay to make items pop and background less distracting
const overlay = 'linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6))'

const backgroundThemes: Record<string, string> = {
  apple: `${overlay}, url(${bgOrchard})`,
  bird: `${overlay}, url(${bgSky})`,
  elephant: `${overlay}, url(${bgOrchard})`,
  car: `${overlay}, url(${bgOrchard})`,
  star: `${overlay}, url(${bgSpace})`,
  bear: `${overlay}, url(${bgOrchard})`,
  flower: `${overlay}, url(${bgOrchard})`,
  duck: `${overlay}, url(${bgOrchard})`,
  fish: `${overlay}, url(${bgOcean})`,
  cat: `${overlay}, url(${bgOrchard})`,
  dog: `${overlay}, url(${bgOrchard})`,
  ball: `${overlay}, url(${bgOrchard})`,
  // Default fallback
  default: `${overlay}, url(${bgOrchard})`
}

const currentEmoji = computed(() => itemEmojis[store.currentItem] || '❓')
const currentBackground = computed(() => {
  return backgroundThemes[store.currentItem] || backgroundThemes.default
})

// Random positions for items
const itemPositions = ref<{top: string, left: string, rotation: string}[]>([])

// Dynamic item size based on count
const itemSizeClass = computed(() => {
  if (store.targetNumber <= 4) return 'size-xl'
  if (store.targetNumber <= 8) return 'size-l'
  return 'size-m'
})

function generatePositions() {
  const positions: {top: number, left: number, rotation: number}[] = []
  const maxGlobalAttempts = 10 // How many times to restart the whole process if we get stuck
  let globalAttempts = 0
  let success = false

  // Dynamic min distance based on item count/size
  // These values need to be large enough to cover the item size + padding
  // XL (1-4): 25vw ~ 25% width. Safety: 28%
  // L (5-8): 20vw ~ 20% width. Safety: 22%
  // M (9-12): 15vw ~ 15% width. Safety: 17%
  let minDistance = 18
  if (store.targetNumber <= 4) minDistance = 28
  else if (store.targetNumber <= 8) minDistance = 22
  else minDistance = 17

  while (!success && globalAttempts < maxGlobalAttempts) {
    positions.length = 0 // Clear positions
    let itemsPlaced = 0
    
    for (let i = 0; i < store.targetNumber; i++) {
      let attempts = 0
      let valid = false
      let top = 0
      let left = 0
      let rotation = 0
      const maxItemAttempts = 200

      while (!valid && attempts < maxItemAttempts) {
        // Full width usage: Left 5% to 85%
        // Top section usage: 10% to 60%
        top = Math.random() * 50 + 10 
        left = Math.random() * 80 + 5 
        rotation = Math.random() * 40 - 20

        // Check collision with existing positions
        valid = true
        for (const pos of positions) {
          const dx = left - pos.left
          const dy = top - pos.top
          // Simple Euclidean distance in % space
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < minDistance) {
            valid = false
            break
          }
        }
        attempts++
      }

      if (valid) {
        positions.push({ top, left, rotation })
        itemsPlaced++
      } else {
        // If we failed to place an item, break and try the whole set again
        break 
      }
    }

    if (itemsPlaced === store.targetNumber) {
      success = true
    } else {
      globalAttempts++
      // Optional: slightly reduce strictness if we keep failing?
      // minDistance *= 0.95 
    }
  }

  // If we still failed after global retries, we might have some overlap, 
  // but we'll use whatever we managed to generate in the last attempt 
  // (or maybe we should just force grid? sticking to random for now)
  
  itemPositions.value = positions.map(p => ({
    top: `${p.top}%`,
    left: `${p.left}%`,
    rotation: `${p.rotation}deg`
  }))
}

// Watch for round changes to regenerate positions
watch(() => store.targetNumber, () => {
  generatePositions()
}, { immediate: true })

onMounted(() => {
  store.startGame()
})
</script>

<template>
  <div class="game-container" :style="{ backgroundImage: currentBackground }">
    <!-- Status Header -->
    <div class="status-header">
      <div class="status-left">
        <div class="status-item">{{ store.t.round }}: {{ store.currentRound }} / 10</div>
        <div class="status-item">{{ store.t.score }}: {{ store.score }}</div>
      </div>
      <div class="status-right">
        <button class="lang-btn" @click="store.toggleLanguage">
          {{ store.language === 'zh-TW' ? '🇺🇸 EN' : '🇹🇼 中文' }}
        </button>
        <button class="exit-btn" @click="store.exitGame">❌</button>
      </div>
    </div>

    <!-- Top Section: Items (Scattered) -->
    <div class="top-section">
      <div class="scatter-container">
        <div 
          v-for="(pos, index) in itemPositions" 
          :key="index" 
          class="game-item scattered"
          :class="[itemSizeClass, { 'counted': store.countedItems.has(index) }]"
          :style="{ 
            top: pos.top, 
            left: pos.left, 
            transform: `rotate(${pos.rotation})`,
            animationDelay: `${index * 0.2}s` 
          }"
          @click="store.toggleCounted(index)"
        >
          <span class="emoji">{{ currentEmoji }}</span>
          <Transition name="pop">
            <span v-if="store.countedItems.has(index)" class="count-badge">
              {{ Array.from(store.countedItems).indexOf(index) + 1 }}
            </span>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Cards -->
    <div class="bottom-section">
      <div class="cards-container">
        <NumberCard 
          v-for="num in store.options" 
          :key="num" 
          :number="num"
          :disabled="store.gameStatus !== 'playing'"
          @select="store.checkAnswer(num)"
        />
      </div>
    </div>

    <!-- Feedback Overlay -->
    <Transition name="bounce">
      <div v-if="store.feedbackType === 'correct'" class="feedback-overlay correct">
        <div class="feedback-content">
          <h1>🎉 {{ store.t.correct }} 🎉</h1>
          <span class="big-emoji">🌟</span>
        </div>
      </div>
    </Transition>

    <!-- Game Over Overlay -->
    <div v-if="store.gameStatus === 'finished'" class="game-over-overlay">
      <div class="content">
        <h1>{{ store.t.gameOver.replace('{score}', store.score.toString()) }}</h1>
        <button @click="store.startGame" class="restart-btn">{{ store.t.restart }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  height: 100vh;
  width: 100vw; /* Ensure full width */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.5s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0; /* Remove padding */
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px; /* Reduced padding */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  font-size: 1rem; /* Slightly smaller font for mobile */
  font-weight: bold;
  color: #333;
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
}

.status-left, .status-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lang-btn {
  background: white;
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.exit-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.top-section {
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.scatter-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-item.scattered {
  position: absolute;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: float 3s ease-in-out infinite;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dynamic Sizes */
.game-item.size-xl {
  width: 25vw;
  height: 25vw;
  max-width: 150px;
  max-height: 150px;
}
.game-item.size-xl .emoji { font-size: 6rem; }

.game-item.size-l {
  width: 20vw;
  height: 20vw;
  max-width: 120px;
  max-height: 120px;
}
.game-item.size-l .emoji { font-size: 5rem; }

.game-item.size-m {
  width: 15vw;
  height: 15vw;
  max-width: 100px;
  max-height: 100px;
}
.game-item.size-m .emoji { font-size: 4rem; }


.game-item.scattered:active {
  transform: scale(0.9) !important;
}

.game-item.counted {
  filter: brightness(1.2) drop-shadow(0 0 10px gold);
}

.count-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF5252;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 5;
}

.emoji {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
  display: block;
  line-height: 1;
  transition: font-size 0.3s ease;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
  50% { transform: translateY(-10px) rotate(var(--rotation)); }
}

.pop-enter-active {
  animation: popIn 0.3s;
}

.bottom-section {
  height: auto; /* Allow auto height */
  min-height: 25vh;
  background-color: rgba(255, 255, 255, 0.9);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  padding: 15px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.cards-container {
  display: flex;
  justify-content: space-between; /* Distribute space */
  gap: 10px;
  width: 100%;
  max-width: 600px; /* Max width for tablets */
  align-items: center;
}

/* Feedback Animation */
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.feedback-content {
  text-align: center;
  color: #4CAF50;
}

.big-emoji {
  font-size: 6rem;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Game Over */
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.content {
  text-align: center;
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 20px;
  width: 85%;
  max-width: 400px;
}

.restart-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1.2rem;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
}
</style>
