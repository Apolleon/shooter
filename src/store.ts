import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const name = ref('')

  const setName = (e: Event) => {
    const target = e.target as HTMLInputElement
    return (name.value = target.value)
  }

  return {
    name,
    setName
  }
})
