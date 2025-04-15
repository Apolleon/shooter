<script setup>
  import { useGameStore } from './store'
  const store = useGameStore()
</script>

<template>
  <div class="app">
    <div>
      <h1 v-if="store.name">Hello {{ store.name }}!</h1>
      <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
      <nav>
        <RouterLink to="/">Go to Home</RouterLink>
        <RouterLink to="/game">Go to About</RouterLink>
      </nav>
    </div>

    <main>
      <RouterView />
    </main>

    <footer></footer>
  </div>
</template>

<style scoped>
  .app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100vh;
    width: 100vw;
  }
</style>
