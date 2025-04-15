<script setup>
  const props = defineProps({
    bullet: {
      type: Object,
      required: true
    },
    BULLET_SIZE: {
      type: Number,
      required: true
    }
  })
</script>

<template>
  <div
    class="bullet"
    :style="{
      left: `${bullet.x}px`,
      top: `${bullet.y}px`,
      width: `${BULLET_SIZE}px`,
      height: `${BULLET_SIZE}px`
    }"
  ></div>
</template>

<style scoped>
  .bullet {
    position: absolute;
    background-color: #e74c3c;
    border-radius: 50%;
  }
</style>
