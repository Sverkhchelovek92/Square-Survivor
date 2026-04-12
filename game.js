const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height / 2 - 15,
  size: 30,
  speed: 5,
  color: 'white',
  border: 'black',
}

let score = 0
let kills = 0

let level = 1
let health = 100
let gameOver = false

let gameStarted = false
let paused = false

let nextLevelScore = 100

let healthPack = null
let nextHealthPackScore = 250

// SHOOTING CONSTANTS

const bullets = []
const particles = []

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
}

let canShoot = true
const shootCooldown = 250

let weaponLevel = 0
let nextWeaponDropKills = 10
let weaponDrop = null

// KEYS

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && gameStarted && !gameOver) {
    paused = !paused
    return
  }
  if (keys.hasOwnProperty(e.key)) {
    if (paused) {
      paused = false
      return
    }
    keys[e.key] = true
  }

  if (!gameStarted) {
    gameStarted = true
    return
  }
})

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false
  }
})

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

window.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return
  if (!canShoot || gameOver) return

  shoot()

  canShoot = false

  setTimeout(() => {
    canShoot = true
  }, shootCooldown)
})

// ENEMIES

const greens = []
const reds = []

function random(min, max) {
  return Math.random() * (max - min) + min
}

function createMovingSquare(color) {
  const variants = [
    {
      type: 'small',
      size: 16,
      value: color === '#3cff6b' ? 5 : 1,
    },
    {
      type: 'medium',
      size: 24,
      value: color === '#3cff6b' ? 10 : 2,
    },
    {
      type: 'large',
      size: 36,
      value: color === '#3cff6b' ? 20 : 4,
    },
  ]

  const variant = variants[Math.floor(Math.random() * variants.length)]

  return {
    x: random(0, canvas.width - variant.size),
    y: random(0, canvas.height - variant.size),
    size: variant.size,
    color,
    type: variant.type,
    value: variant.value,
    alpha: 0,
    speedX: random(-2, 2),
    speedY: random(-2, 2),
  }
}

function createExplosion(x, y, color, amount = 8) {
  for (let i = 0; i < amount; i++) {
    particles.push({
      x,
      y,
      size: random(2, 5),
      color,
      speedX: random(-3, 3),
      speedY: random(-3, 3),
      alpha: 1,
      life: random(20, 40),
    })
  }
}

function spawnGreen() {
  if (greens.length < Math.max(3, 10 - level)) {
    greens.push(createMovingSquare('#3cff6b'))
  }
}

function spawnRed() {
  if (reds.length < 4 + level * 2) {
    const red = createMovingSquare('#ff3b3b')

    // Faster with each new level
    red.speedX *= 1 + level * 0.15
    red.speedY *= 1 + level * 0.15

    reds.push(red)
  }
}

for (let i = 0; i < 10; i++) {
  spawnGreen()
}

for (let i = 0; i < 4; i++) {
  spawnRed()
}

// HealthPack

function spawnHealthPack() {
  healthPack = {
    x: random(40, canvas.width - 40),
    y: random(40, canvas.height - 40),
    size: 26,
    lifeTime: 600,
  }
}

// SHOOTING

function shoot() {
  const centerX = player.x + player.size / 2
  const centerY = player.y + player.size / 2

  const dx = mouse.x - centerX
  const dy = mouse.y - centerY

  const length = Math.sqrt(dx * dx + dy * dy)

  const speed = 8

  bullets.push({
    x: centerX,
    y: centerY,
    size: 8,
    speedX: (dx / length) * speed,
    speedY: (dy / length) * speed,
  })
}

// WEAPON DROPS

function spawnWeaponDrop() {
  weaponDrop = {
    x: random(40, canvas.width - 40),
    y: random(40, canvas.height - 40),
    size: 24,
    type: weaponLevel === 0 ? 'rapid' : 'double',
    lifeTime: 600,
  }
}

// UPDATE FUNCTIONS

function updatePlayer() {
  if (keys.ArrowUp || keys.w) player.y -= player.speed
  if (keys.ArrowDown || keys.s) player.y += player.speed
  if (keys.ArrowLeft || keys.a) player.x -= player.speed
  if (keys.ArrowRight || keys.d) player.x += player.speed

  if (player.x < 0) player.x = 0
  if (player.y < 0) player.y = 0

  if (player.x + player.size > canvas.width) {
    player.x = canvas.width - player.size
  }

  if (player.y + player.size > canvas.height) {
    player.y = canvas.height - player.size
  }
}

function updateSquares(array) {
  for (const square of array) {
    square.x += square.speedX
    square.y += square.speedY

    if (square.alpha < 1) {
      square.alpha += 0.02

      if (square.alpha > 1) {
        square.alpha = 1
      }
    }

    if (square.x <= 0 || square.x + square.size >= canvas.width) {
      square.speedX *= -1
    }

    if (square.y <= 0 || square.y + square.size >= canvas.height) {
      square.speedY *= -1
    }
  }
}

function updateHealthPack() {
  if (!healthPack && score >= nextHealthPackScore) {
    spawnHealthPack()
    nextHealthPackScore += 250
  }

  if (healthPack) {
    healthPack.lifeTime--

    if (healthPack.lifeTime <= 0) {
      healthPack = null
    }
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]

    bullet.x += bullet.speedX
    bullet.y += bullet.speedY

    // Delete if out of bounds
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(i, 1)
    }
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]

    p.x += p.speedX
    p.y += p.speedY

    p.life--
    p.alpha = p.life / 40

    // Slowing down
    p.speedX *= 0.97
    p.speedY *= 0.97

    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
}

// COLLISIONS

function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  )
}

function handleCollisions() {
  // Green Squares
  for (let i = greens.length - 1; i >= 0; i--) {
    const green = greens[i]

    if (isColliding(player, green)) {
      greens.splice(i, 1)

      score += green.value

      spawnGreen()
    }
  }

  // Red Squares
  for (let i = reds.length - 1; i >= 0; i--) {
    const red = reds[i]

    if (isColliding(player, red)) {
      reds.splice(i, 1)

      health -= red.value * 10

      if (health <= 0) {
        health = 0
        gameOver = true
      }

      spawnRed()
    }
  }

  // Health Pack
  if (healthPack && isColliding(player, healthPack)) {
    health += 35

    if (health > 100) {
      health = 100
    }

    healthPack = null
  }

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]

    for (let j = reds.length - 1; j >= 0; j--) {
      const red = reds[j]

      const hit =
        bullet.x > red.x &&
        bullet.x < red.x + red.size &&
        bullet.y > red.y &&
        bullet.y < red.y + red.size

      if (hit) {
        bullets.splice(i, 1)

        createExplosion(
          red.x + red.size / 2,
          red.y + red.size / 2,
          red.color,
          red.size < 20 ? 6 : red.size < 30 ? 10 : 16,
        )

        reds.splice(j, 1)

        score += red.value * 2
        kills++

        spawnRed()
        break
      }
    }
  }
}

// Update Level

function updateLevel() {
  if (score >= nextLevelScore) {
    level++
    nextLevelScore += level * 100

    // New Red Spawns
    for (let i = 0; i < 2; i++) {
      spawnRed()
    }

    // New Green Spawns
    while (greens.length > Math.max(3, 10 - level)) {
      greens.pop()
    }
  }
}

// DRAW

function drawSquare(square) {
  ctx.save()

  ctx.globalAlpha = square.alpha
  ctx.fillStyle = square.color
  ctx.fillRect(square.x, square.y, square.size, square.size)

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(square.x, square.y, square.size, square.size)

  ctx.restore()
}

function drawPlayer() {
  ctx.fillStyle = player.color
  ctx.fillRect(player.x, player.y, player.size, player.size)

  ctx.strokeStyle = player.border
  ctx.lineWidth = 2
  ctx.strokeRect(player.x, player.y, player.size, player.size)
}

function drawBullets() {
  ctx.fillStyle = 'white'

  for (const bullet of bullets) {
    ctx.beginPath()
    ctx.arc(bullet.x, bullet.y, bullet.size / 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawUI() {
  ctx.textAlign = 'left'

  ctx.fillStyle = 'white'
  ctx.font = '20px Arial'
  ctx.fillText(`SCORE: ${score}`, 20, 35)
  ctx.fillText(`KILLS: ${kills}`, 20, 65)
  ctx.fillText(`LEVEL: ${level}`, 20, 95)

  // Health bar
  ctx.fillStyle = '#444'
  ctx.fillRect(20, 110, 200, 20)

  let healthColor = '#3cff6b'

  if (health < 60) healthColor = '#ffd93c'
  if (health < 30) healthColor = '#ff3b3b'

  ctx.fillStyle = healthColor
  ctx.fillRect(20, 110, health * 2, 20)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.strokeRect(20, 110, 200, 20)

  ctx.fillStyle = 'white'
  ctx.font = '14px Arial'
  ctx.fillText(`HEALTH: ${Math.floor(health)} / 100`, 25, 125)

  ctx.fillText('WASD / a← ↑ → ↓ — movement', 20, 155)
}

function drawHealthPack() {
  if (!healthPack) return

  if (healthPack.lifeTime < 120) {
    const blink = Math.floor(healthPack.lifeTime / 10) % 2

    if (blink === 0) {
      return
    }
  }

  ctx.fillStyle = 'white'

  ctx.fillRect(
    healthPack.x + healthPack.size / 3,
    healthPack.y,
    healthPack.size / 3,
    healthPack.size,
  )

  ctx.fillRect(
    healthPack.x,
    healthPack.y + healthPack.size / 3,
    healthPack.size,
    healthPack.size / 3,
  )
}

function drawParticles() {
  for (const p of particles) {
    ctx.save()

    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, p.size, p.size)

    ctx.restore()
  }
}

function update() {
  if (!gameStarted) return

  if (paused) return

  if (gameOver) return

  updatePlayer()
  updateSquares(greens)
  updateBullets()
  updateParticles()
  updateSquares(reds)
  updateHealthPack()
  handleCollisions()
  updateLevel()

  spawnGreen()
  spawnRed()
}

function draw() {
  if (!gameStarted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = '48px Arial'
    ctx.fillText('ARE YOU READY?', canvas.width / 2, canvas.height / 2 - 40)

    ctx.font = '24px Arial'
    ctx.fillText(
      'Press any key to start',
      canvas.width / 2,
      canvas.height / 2 + 20,
    )

    return
  }

  if (paused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = '52px Arial'
    ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2 - 20)

    ctx.font = '24px Arial'
    ctx.fillText(
      'Press any key to continue',
      canvas.width / 2,
      canvas.height / 2 + 35,
    )

    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const green of greens) {
    drawSquare(green)
  }

  for (const red of reds) {
    drawSquare(red)
  }

  drawHealthPack()
  drawParticles()
  drawBullets()
  drawPlayer()
  drawUI()

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = '48px Arial'
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20)

    ctx.font = '24px Arial'
    ctx.fillText(
      `Final Score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 30,
    )
    ctx.fillText(
      `Enemies Destroyed: ${kills}`,
      canvas.width / 2,
      canvas.height / 2 + 65,
    )

    ctx.font = '18px Arial'
    ctx.fillText(
      'Refresh page to restart',
      canvas.width / 2,
      canvas.height / 2 + 105,
    )

    ctx.textAlign = 'left'
  }
}

function gameLoop() {
  update()
  draw()
  requestAnimationFrame(gameLoop)
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

gameLoop()
