<script setup>
import GameContainer from "./components/GameContainer.vue";
</script>

<template>
  <main>
    <h1>Vue Shooter Game</h1>
    <p>Use arrow keys to move. Click or hold left mouse button to shoot.</p>
    <GameContainer />
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #34495e;
  color: #ecf0f1;
}

main {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  color: #3498db;
  margin-bottom: 10px;
}

p {
  margin-bottom: 20px;
}
</style>
