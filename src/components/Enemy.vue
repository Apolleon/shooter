<script setup>
const {enemy, ENEMY_SIZE} = defineProps(['enemy', 'ENEMY_SIZE'])
</script>

<template>
      <div
        class="enemy"
        :style="{
          left: `${enemy.x}px`,
          top: `${enemy.y}px`,
          width: `${ENEMY_SIZE}px`,
          height: `${ENEMY_SIZE}px`,
          backgroundColor: enemy.health === 1 ? '#ff6666' : '#ff0000',
        }"
      ></div>
</template>

<style scoped>
.enemy {
  position: absolute;
  background-color: #ff0000;
  border-radius: 4px;
  box-shadow: 0 0 6px 1px black;
}
</style>