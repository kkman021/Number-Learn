import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
    const currentRound = ref(1)
    const score = ref(0)
    const targetNumber = ref(1)
    const options = ref<number[]>([])
    const gameStatus = ref<'playing' | 'feedback' | 'finished'>('playing')
    const feedbackType = ref<'correct' | 'wrong' | null>(null)
    const language = ref<'zh-TW' | 'en-US'>('zh-TW')

    const items = [
        'apple', 'bird', 'elephant', 'car', 'star', 'bear',
        'flower', 'duck', 'fish', 'cat', 'dog', 'ball'
    ]

    const translations = {
        'zh-TW': {
            round: '回合',
            score: '得分',
            correct: '答對了！',
            tryAgain: '再試一次！',
            gameOver: '遊戲結束！你得到了 {score} 分！',
            restart: '再玩一次',
            exitConfirm: '確定要退出遊戲嗎？',
            exit: '退出'
        },
        'en-US': {
            round: 'Round',
            score: 'Score',
            correct: 'Correct!',
            tryAgain: 'Try again!',
            gameOver: 'Game Over! You got {score} points.',
            restart: 'Play Again',
            exitConfirm: 'Are you sure you want to exit?',
            exit: 'Exit'
        }
    }

    const t = computed(() => translations[language.value])

    const currentItem = computed(() => items[currentRound.value - 1] || 'apple')

    const countedItems = ref<Set<number>>(new Set())

    function toggleLanguage() {
        language.value = language.value === 'zh-TW' ? 'en-US' : 'zh-TW'
    }

    function generateRound() {
        // Generate target number (1-12)
        targetNumber.value = Math.floor(Math.random() * 12) + 1

        // Generate options
        const opts = new Set<number>()
        opts.add(targetNumber.value)

        while (opts.size < 3) {
            const randomNum = Math.floor(Math.random() * 12) + 1
            if (randomNum !== targetNumber.value) {
                opts.add(randomNum)
            }
        }

        // Shuffle options
        options.value = Array.from(opts).sort(() => Math.random() - 0.5)
        gameStatus.value = 'playing'
        feedbackType.value = null
        countedItems.value.clear()
    }

    function toggleCounted(index: number) {
        if (gameStatus.value !== 'playing') return

        if (!countedItems.value.has(index)) {
            countedItems.value.add(index)
            // Speak the number
            speakNumber(countedItems.value.size)
        }
    }

    function speakNumber(num: number) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(num.toString())
            utterance.lang = language.value
            window.speechSynthesis.speak(utterance)
        }
    }

    function checkAnswer(number: number) {
        if (gameStatus.value !== 'playing') return

        if (number === targetNumber.value) {
            // Correct
            score.value++
            feedbackType.value = 'correct'
            gameStatus.value = 'feedback'
            speak(t.value.correct)

            setTimeout(() => {
                nextRound()
            }, 2000)
        } else {
            // Wrong
            feedbackType.value = 'wrong'
            speak(t.value.tryAgain)
            // Optional: Shake animation trigger or just sound
            setTimeout(() => {
                feedbackType.value = null
            }, 1000)
        }
    }

    function nextRound() {
        if (currentRound.value >= 10) {
            gameStatus.value = 'finished'
            speak(t.value.gameOver.replace('{score}', score.value.toString()))
        } else {
            currentRound.value++
            generateRound()
        }
    }

    function startGame() {
        currentRound.value = 1
        score.value = 0
        generateRound()
    }

    function exitGame() {
        if (confirm(t.value.exitConfirm)) {
            startGame()
        }
    }

    function speak(text: string) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = language.value
            window.speechSynthesis.speak(utterance)
        }
    }

    return {
        currentRound,
        score,
        targetNumber,
        options,
        gameStatus,
        feedbackType,
        currentItem,
        countedItems,
        language,
        t,
        generateRound,
        checkAnswer,
        startGame,
        exitGame,
        toggleCounted,
        toggleLanguage
    }
})
