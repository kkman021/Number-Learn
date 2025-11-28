<script setup lang="ts">
import GameOne from './views/GameOne.vue'
</script>

<template>
  <GameOne />
</template>

<style>
/* Global Reset & Mobile Optimization */
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  background-color: #f0f0f0;
  position: fixed;
  width: 100%;
  height: 100%;
  overscroll-behavior: none;
  touch-action: manipulation;
}

#app {
  width: 100%;
  height: 100%;
  height: 100dvh; /* Dynamic viewport height for mobile */
  overflow: hidden;
}
</style>
