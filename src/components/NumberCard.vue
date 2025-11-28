<script setup lang="ts">
defineProps<{
  number: number
  disabled?: boolean
}>()

defineEmits<{
  (e: 'select', number: number): void
}>()
</script>

<template>
  <button 
    class="number-card" 
    :disabled="disabled"
    @click="$emit('select', number)"
  >
    {{ number }}
  </button>
</template>

<style scoped>
.number-card {
  background: white;
  border: 4px solid #FFB74D;
  border-radius: 16px;
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  width: 100%;
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.number-card:active:not(:disabled) {
  transform: scale(0.95);
}

.number-card:disabled {
  opacity: 0.8;
  cursor: default;
}
</style>
