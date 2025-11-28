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
  user-select: none; /* Prevent text selection */
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden; /* Prevent scroll */
  background-color: #f0f0f0;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>
