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
  default: `${overlay}, url(${bgOrchard})`
}

const currentEmoji = computed(() => itemEmojis[store.currentItem] || '❓')
const currentBackground = computed(() => {
  return backgroundThemes[store.currentItem] || backgroundThemes.default
})

// 原始位置（散落在畫面上）
const itemPositions = ref<{top: string, left: string, rotation: string}[]>([])

// 已收集的項目索引（按點擊順序）
const collectedItems = ref<number[]>([])

// 根據目標數量動態計算收集區項目大小
const collectedItemStyle = computed(() => {
  const maxWidth = window.innerWidth - 20 // 左右各留 10px
  const count = store.targetNumber
  const gap = 12
  const totalGapWidth = (count - 1) * gap
  const itemSize = Math.min(80, Math.floor((maxWidth - totalGapWidth) / count))
  return {
    size: itemSize,
    gap: gap,
    fontSize: itemSize * 0.7,
    numberSize: itemSize * 0.4,
    numberFontSize: itemSize * 0.25,
    numberBorder: Math.max(2, itemSize * 0.025)
  }
})

function getCollectedPosition(orderIndex: number) {
  const { size, gap } = collectedItemStyle.value
  const startX = 10
  const x = startX + orderIndex * (size + gap)
  return { x }
}

// 點擊處理
function handleItemClick(index: number) {
  if (store.gameStatus !== 'playing') return
  if (collectedItems.value.includes(index)) return
  
  collectedItems.value.push(index)
  store.toggleCounted(index)
}

// Dynamic item size based on count
const itemSizeClass = computed(() => {
  if (store.targetNumber === 1) return 'size-solo'
  if (store.targetNumber === 2) return 'size-xxl'
  if (store.targetNumber <= 4) return 'size-xl'
  if (store.targetNumber <= 8) return 'size-l'
  return 'size-m'
})

function generatePositions() {
  const positions: {top: number, left: number, rotation: number}[] = []

  // 特殊處理：單一物件置中
  if (store.targetNumber === 1) {
    itemPositions.value = [{
      top: '42%',
      left: '50%',
      rotation: '0deg'
    }]
    return
  }

  // 特殊處理：兩個物件左右對稱
  if (store.targetNumber === 2) {
    itemPositions.value = [
      { top: '40%', left: '30%', rotation: '-5deg' },
      { top: '44%', left: '70%', rotation: '5deg' }
    ]
    return
  }

  // Grid with Jitter 布局算法
  // 計算最佳網格配置
  const cols = Math.ceil(Math.sqrt(store.targetNumber * 1.2)) // 略寬的網格
  const rows = Math.ceil(store.targetNumber / cols)

  // 定義可用區域（避免與頂部選單重疊）
  const areaTop = 18
  const areaHeight = 54
  const areaLeft = 20
  const areaWidth = 60

  // 計算格子大小
  const cellWidth = areaWidth / cols
  const cellHeight = areaHeight / rows

  // 根據數量動態調整擾動強度
  let jitterStrength = 0.35
  if (store.targetNumber <= 4) jitterStrength = 0.4
  else if (store.targetNumber <= 6) jitterStrength = 0.38
  else if (store.targetNumber >= 10) jitterStrength = 0.3

  // 創建所有格子位置並打亂
  const gridIndices: number[] = []
  for (let i = 0; i < cols * rows; i++) {
    gridIndices.push(i)
  }

  // Fisher-Yates 打亂算法
  for (let i = gridIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[gridIndices[i], gridIndices[j]] = [gridIndices[j]!, gridIndices[i]!]
  }

  // 為每個物件分配位置
  for (let i = 0; i < store.targetNumber; i++) {
    const gridIndex = gridIndices[i]!
    const col = gridIndex % cols
    const row = Math.floor(gridIndex / cols)

    // 計算格子中心點
    const centerLeft = areaLeft + cellWidth * (col + 0.5)
    const centerTop = areaTop + cellHeight * (row + 0.5)

    // 添加隨機擾動（在格子範圍內）
    const jitterX = (Math.random() - 0.5) * cellWidth * jitterStrength
    const jitterY = (Math.random() - 0.5) * cellHeight * jitterStrength

    const left = centerLeft + jitterX
    const top = centerTop + jitterY

    // 隨機旋轉角度
    const rotation = Math.random() * 40 - 20

    positions.push({ top, left, rotation })
  }

  itemPositions.value = positions.map(p => ({
    top: `${p.top}%`,
    left: `${p.left}%`,
    rotation: `${p.rotation}deg`
  }))
}

// Watch for round changes to regenerate positions
watch(() => store.targetNumber, () => {
  generatePositions()
  collectedItems.value = []
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
          :class="[
            itemSizeClass, 
            { 'collected': collectedItems.includes(index) }
          ]"
          :style="{ 
            top: pos.top, 
            left: pos.left, 
            transform: `translate(-50%, -50%) rotate(${pos.rotation})`,
            animationDelay: `${index * 0.2}s` 
          }"
          @click="handleItemClick(index)"
        >
          <span class="emoji">{{ currentEmoji }}</span>
        </div>
      </div>
    </div>

    <!-- Collection Tray -->
    <div class="collection-tray">
      <div class="collected-items">
        <TransitionGroup name="collect">
          <div
            v-for="(itemIndex, orderIndex) in collectedItems"
            :key="itemIndex"
            class="collected-item"
            :style="{
              left: `${getCollectedPosition(orderIndex).x}px`,
              width: `${collectedItemStyle.size}px`,
              height: `${collectedItemStyle.size}px`
            }"
          >
            <span class="collected-emoji" :style="{ fontSize: `${collectedItemStyle.fontSize}px` }">{{ currentEmoji }}</span>
            <span
              class="collected-number"
              :style="{
                width: `${collectedItemStyle.numberSize}px`,
                height: `${collectedItemStyle.numberSize}px`,
                fontSize: `${collectedItemStyle.numberFontSize}px`,
                borderWidth: `${collectedItemStyle.numberBorder}px`,
                bottom: `${-collectedItemStyle.numberSize * 0.125}px`,
                right: `${-collectedItemStyle.numberSize * 0.125}px`
              }"
            >{{ orderIndex + 1 }}</span>
          </div>
        </TransitionGroup>
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
  height: 100%;
  height: 100vh; /* Fallback */
  height: 100dvh; /* Dynamic viewport height */
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.5s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  /* iPhone safe area support */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  /* Prevent bounce scroll on iOS */
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  font-size: 1rem;
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
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: nowrap;
  min-width: 70px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.exit-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  /* iOS touch optimization */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Dynamic Sizes */
.game-item.size-solo {
  width: 45vw;
  height: 45vw;
  max-width: 250px;
  max-height: 250px;
}
.game-item.size-solo .emoji { font-size: 10rem; }

.game-item.size-xxl {
  width: 35vw;
  height: 35vw;
  max-width: 200px;
  max-height: 200px;
}
.game-item.size-xxl .emoji { font-size: 8rem; }

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


.game-item.scattered:active:not(.collected) {
  transform: translate(-50%, -50%) scale(0.9) !important;
}

.game-item.collected {
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0) !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.emoji {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
  display: block;
  line-height: 1;
}

.game-item.scattered:not(.collected) .emoji {
  animation: floatEmoji 3s ease-in-out infinite;
}

@keyframes floatEmoji {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Collection Tray */
.collection-tray {
  height: 110px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  border-top: 3px solid #FFB74D;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
  z-index: 15;
}

.collected-items {
  position: relative;
  height: 100%;
  width: 100%;
}

.collected-item {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.collected-emoji {
  filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));
}

.collected-number {
  position: absolute;
  background: #FF5252;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-style: solid;
  border-color: white;
}

/* Collection animation */
.collect-enter-active {
  animation: dropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dropIn {
  0% { 
    opacity: 0;
    transform: translateY(-200%) scale(1.5);
  }
  60% {
    opacity: 1;
    transform: translateY(-40%) scale(1.1);
  }
  80% {
    transform: translateY(-55%) scale(0.95);
  }
  100% { 
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
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
