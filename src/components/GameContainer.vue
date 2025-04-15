<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import Enemy from './Enemy.vue'
  import Bullet from './Bullet.vue'

  // Game constants
  const GAME_WIDTH = 2000
  const GAME_HEIGHT = 2000
  const PLAYER_SIZE = 30
  const BULLET_SIZE = 10
  const ENEMY_SIZE = 25
  const PLAYER_SPEED = 5
  const BULLET_SPEED = 10
  const ENEMY_SPEED = 2
  const VIEWPORT_WIDTH = 800
  const VIEWPORT_HEIGHT = 600
  const ENEMY_SPAWN_INTERVAL = 2000 // ms
  const SCROLL_MARGIN = 100 // px from viewport edge to trigger scrolling

  // Game state
  const player = ref({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 })
  const bullets = ref([])
  const enemies = ref([])
  const score = ref(0)
  const gameOver = ref(false)
  const viewportOffset = ref({
    x: player.value.x - VIEWPORT_WIDTH / 2,
    y: player.value.y - VIEWPORT_HEIGHT / 2
  })
  const keysPressed = ref({})
  const mousePosition = ref({ x: 0, y: 0 })
  const mouseDown = ref(false)
  const lastBulletTime = ref(0)
  const BULLET_COOLDOWN = 200 // ms

  // Computed viewport boundaries
  const viewportBounds = computed(() => {
    return {
      left: viewportOffset.value.x,
      right: viewportOffset.value.x + VIEWPORT_WIDTH,
      top: viewportOffset.value.y,
      bottom: viewportOffset.value.y + VIEWPORT_HEIGHT
    }
  })

  // Handle key presses for player movement
  function handleKeyDown(e) {
    keysPressed.value[e.key] = true
  }

  function handleKeyUp(e) {
    keysPressed.value[e.key] = false
  }

  // Handle mouse for shooting
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePosition.value = {
      x: e.clientX - rect.left + viewportOffset.value.x,
      y: e.clientY - rect.top + viewportOffset.value.y
    }
  }

  function handleMouseDown() {
    mouseDown.value = true
  }

  function handleMouseUp() {
    mouseDown.value = false
  }

  // Shoot bullet function
  function shootBullet() {
    const now = Date.now()
    if (now - lastBulletTime.value < BULLET_COOLDOWN) return

    // Calculate direction from player to mouse
    const dx = mousePosition.value.x - player.value.x
    const dy = mousePosition.value.y - player.value.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const directionX = dx / distance
    const directionY = dy / distance

    bullets.value.push({
      id: now,
      x: player.value.x + PLAYER_SIZE / 2,
      y: player.value.y + PLAYER_SIZE / 2,
      directionX,
      directionY,
      speed: BULLET_SPEED
    })

    lastBulletTime.value = now
  }

  // Spawn enemy at random position outside viewport
  function spawnEnemy() {
    if (gameOver.value) return

    // Decide which side to spawn from
    const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
    let x, y

    switch (side) {
      case 0: // top
        x = viewportOffset.value.x + Math.random() * VIEWPORT_WIDTH
        y = viewportOffset.value.y - ENEMY_SIZE - 50
        break
      case 1: // right
        x = viewportOffset.value.x + VIEWPORT_WIDTH + 50
        y = viewportOffset.value.y + Math.random() * VIEWPORT_HEIGHT
        break
      case 2: // bottom
        x = viewportOffset.value.x + Math.random() * VIEWPORT_WIDTH
        y = viewportOffset.value.y + VIEWPORT_HEIGHT + 50
        break
      case 3: // left
        x = viewportOffset.value.x - ENEMY_SIZE - 50
        y = viewportOffset.value.y + Math.random() * VIEWPORT_HEIGHT
        break
    }

    enemies.value.push({
      id: Date.now() + Math.random(),
      x,
      y,
      health: 2,
      avoidingBullet: false
    })
  }

  // Game loop
  function gameLoop() {
    if (gameOver.value) return

    // Move player based on keys pressed
    if ((keysPressed.value['ArrowUp'] || keysPressed.value['w']) && player.value.y > 0) {
      player.value.y -= PLAYER_SPEED
    }
    if (
      (keysPressed.value['ArrowDown'] || keysPressed.value['s']) &&
      player.value.y < GAME_HEIGHT - PLAYER_SIZE
    ) {
      player.value.y += PLAYER_SPEED
    }
    if ((keysPressed.value['ArrowLeft'] || keysPressed.value['a']) && player.value.x > 0) {
      player.value.x -= PLAYER_SPEED
    }
    if (
      (keysPressed.value['ArrowRight'] || keysPressed.value['d']) &&
      player.value.x < GAME_WIDTH - PLAYER_SIZE
    ) {
      player.value.x += PLAYER_SPEED
    }

    // Auto scroll viewport when player gets close to the edge
    if (player.value.x - viewportOffset.value.x < SCROLL_MARGIN) {
      viewportOffset.value.x = Math.max(0, player.value.x - SCROLL_MARGIN)
    } else if (
      viewportOffset.value.x + VIEWPORT_WIDTH - player.value.x <
      SCROLL_MARGIN + PLAYER_SIZE
    ) {
      viewportOffset.value.x = Math.min(
        GAME_WIDTH - VIEWPORT_WIDTH,
        player.value.x + SCROLL_MARGIN + PLAYER_SIZE - VIEWPORT_WIDTH
      )
    }

    if (player.value.y - viewportOffset.value.y < SCROLL_MARGIN) {
      viewportOffset.value.y = Math.max(0, player.value.y - SCROLL_MARGIN)
    } else if (
      viewportOffset.value.y + VIEWPORT_HEIGHT - player.value.y <
      SCROLL_MARGIN + PLAYER_SIZE
    ) {
      viewportOffset.value.y = Math.min(
        GAME_HEIGHT - VIEWPORT_HEIGHT,
        player.value.y + SCROLL_MARGIN + PLAYER_SIZE - VIEWPORT_HEIGHT
      )
    }

    // Handle shooting
    if (mouseDown.value) {
      shootBullet()
    }

    // Move bullets
    bullets.value = bullets.value.filter(bullet => {
      bullet.x += bullet.directionX * bullet.speed
      bullet.y += bullet.directionY * bullet.speed

      // Remove bullets that go out of bounds
      return !(bullet.x < 0 || bullet.x > GAME_WIDTH || bullet.y < 0 || bullet.y > GAME_HEIGHT)
    })

    // Move enemies
    enemies.value.forEach(enemy => {
      // Basic AI: either chase player or avoid bullets
      enemy.avoidingBullet = false

      // Check if there are bullets nearby to avoid
      for (const bullet of bullets.value) {
        const dx = bullet.x - enemy.x
        const dy = bullet.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Увеличиваем радиус обнаружения и упрощаем проверку направления
        if (distance < 250) {
          // Увеличиваем радиус обнаружения
          // Вектор направления от пули к врагу
          const bulletToEnemyX = enemy.x - bullet.x
          const bulletToEnemyY = enemy.y - bullet.y

          // Скалярное произведение - проверяем, что враг находится впереди пули
          const dotProduct = bullet.directionX * bulletToEnemyX + bullet.directionY * bulletToEnemyY

          // Если враг находится впереди пули (в направлении движения), уклоняемся
          if (dotProduct > 0) {
            enemy.avoidingBullet = true

            // Направление уклонения - перпендикуляр к направлению пули
            // Используем векторное произведение, чтобы определить сторону уклонения
            const crossProduct =
              bullet.directionX * bulletToEnemyY - bullet.directionY * bulletToEnemyX
            const avoidDirection = {
              x: crossProduct > 0 ? -bullet.directionY : bullet.directionY,
              y: crossProduct > 0 ? bullet.directionX : -bullet.directionX
            }

            // Применяем направление уклонения с увеличенной скоростью
            enemy.x += avoidDirection.x * ENEMY_SPEED * 1.8
            enemy.y += avoidDirection.y * ENEMY_SPEED * 1.8
            break
          }
        }
      }

      // If not avoiding bullets, chase the player
      if (!enemy.avoidingBullet) {
        const dx = player.value.x - enemy.x
        const dy = player.value.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        enemy.x += (dx / distance) * ENEMY_SPEED
        enemy.y += (dy / distance) * ENEMY_SPEED
      }

      // Keep enemies within game bounds
      enemy.x = Math.max(0, Math.min(GAME_WIDTH - ENEMY_SIZE, enemy.x))
      enemy.y = Math.max(0, Math.min(GAME_HEIGHT - ENEMY_SIZE, enemy.y))
    })

    // Detect bullet-enemy collisions
    bullets.value = bullets.value.filter(bullet => {
      let bulletHit = false

      enemies.value = enemies.value.filter(enemy => {
        // Check collision
        if (
          bullet.x < enemy.x + ENEMY_SIZE &&
          bullet.x + BULLET_SIZE > enemy.x &&
          bullet.y < enemy.y + ENEMY_SIZE &&
          bullet.y + BULLET_SIZE > enemy.y
        ) {
          enemy.health--
          bulletHit = true

          if (enemy.health <= 0) {
            score.value += 10
            return false // Remove the enemy
          }
        }
        return true // Keep the enemy
      })

      return !bulletHit // Remove the bullet if it hit something
    })

    // Detect player-enemy collisions
    for (const enemy of enemies.value) {
      if (
        player.value.x < enemy.x + ENEMY_SIZE &&
        player.value.x + PLAYER_SIZE > enemy.x &&
        player.value.y < enemy.y + ENEMY_SIZE &&
        player.value.y + PLAYER_SIZE > enemy.y
      ) {
        gameOver.value = true
        break
      }
    }

    requestAnimationFrame(gameLoop)
  }

  // Enemy spawner
  let enemySpawner

  onMounted(() => {
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Start the game loop
    gameLoop()

    // Start spawning enemies
    enemySpawner = setInterval(spawnEnemy, ENEMY_SPAWN_INTERVAL)
  })

  onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)

    // Stop enemy spawner
    clearInterval(enemySpawner)
  })

  function restartGame() {
    player.value = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }
    bullets.value = []
    enemies.value = []
    score.value = 0
    gameOver.value = false
    viewportOffset.value = {
      x: player.value.x - VIEWPORT_WIDTH / 2,
      y: player.value.y - VIEWPORT_HEIGHT / 2
    }

    // Restart enemy spawner
    clearInterval(enemySpawner)
    enemySpawner = setInterval(spawnEnemy, ENEMY_SPAWN_INTERVAL)

    // Restart game loop
    requestAnimationFrame(gameLoop)
  }
</script>

<template>
  <div
    class="game-container"
    @mousemove="handleMouseMove"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <div
      class="game-world"
      :style="{
        width: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
        transform: `translate(${-viewportOffset.x}px, ${-viewportOffset.y}px)`
      }"
    >
      <!-- Player -->
      <div
        class="player"
        :style="{
          left: `${player.x}px`,
          top: `${player.y}px`,
          width: `${PLAYER_SIZE}px`,
          height: `${PLAYER_SIZE}px`
        }"
      ></div>

      <!-- Bullets -->
      <Bullet
        v-for="bullet in bullets"
        :key="bullet.id"
        :bullet="bullet"
        :BULLET_SIZE="BULLET_SIZE"
      />

      <!-- Enemies -->
      <Enemy v-for="enemy in enemies" :enemy="enemy" :ENEMY_SIZE="ENEMY_SIZE" :key="enemy.id" />
    </div>

    <!-- Game Over Screen -->
    <div class="game-over" v-if="gameOver">
      <h2>Game Over</h2>
      <p>Your score: {{ score }}</p>
      <button @click="restartGame">Play Again</button>
    </div>
    <!-- HUD -->
    <div v-else class="hud">
      <div class="score">Score: {{ score }}</div>
    </div>
  </div>
</template>

<style scoped>
  .game-container {
    position: relative;
    width: 800px;
    height: 600px;
    margin: 0 auto;
    overflow: hidden;
    border: 2px solid #333;
    background-color: #f5f5f5;
  }

  .game-world {
    position: absolute;
    background-image: url('/src/assets/bg.jpg');
    background-repeat: repeat;
  }

  .player {
    position: absolute;
    background-color: #3498db;
    border-radius: 4px;
    box-shadow: 0 0 6px 1px black;
  }

  .hud {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }

  .score {
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 4px;
    font-weight: bold;
  }

  .game-over {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    z-index: 20;
  }

  .game-over button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .game-over button:hover {
    background-color: #2980b9;
  }
</style>
