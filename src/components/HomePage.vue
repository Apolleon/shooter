<script setup>
  import { useRouter } from 'vue-router'
  import { useGameStore } from '../store'

  const router = useRouter()
  const store = useGameStore()

  const handleClick = () => router.push('/game')
</script>

<template>
  <div class="welcome">
    <h2>Welcome to the game: {{ store.name }}</h2>
    <input type="text" :value="store.name" @input="store.setName" placeholder="Enter your name" />
    <button :disabled="!store.name" @click="handleClick">START THE GAME</button>
  </div>
</template>

<style scoped>
  .welcome {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 20px;
  }
</style>
