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

let level = 1
let health = 100
let gameOver = false

let nextLevelScore = 100

// KEYS

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true
  }
})

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false
  }
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

function spawnGreen() {
  greens.push(createMovingSquare('#3cff6b'))
}

function spawnRed() {
  reds.push(createMovingSquare('#ff3b3b'))
}

for (let i = 0; i < 10; i++) {
  spawnGreen()
}

for (let i = 0; i < 4; i++) {
  spawnRed()
}

// UPDATE FUNCTIONS

function updatePlayer() {
  if (keys.ArrowUp) player.y -= player.speed
  if (keys.ArrowDown) player.y += player.speed
  if (keys.ArrowLeft) player.x -= player.speed
  if (keys.ArrowRight) player.x += player.speed

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
      player.size += green.value * 0.3

      spawnGreen()
    }
  }

  // Red Squares
  for (let i = reds.length - 1; i >= 0; i--) {
    const red = reds[i]

    if (isColliding(player, red)) {
      reds.splice(i, 1)

      player.size -= red.value * 2

      if (player.size < 10) {
        player.size = 10
      }

      spawnRed()
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

function drawUI() {
  ctx.fillStyle = 'white'
  ctx.font = '20px Arial'
  ctx.fillText(`SCORE: ${score}`, 20, 35)

  ctx.font = '16px Arial'
  ctx.fillText('← ↑ → ↓ — movement', 20, 65)
}

function update() {
  updatePlayer()
  updateSquares(greens)
  updateSquares(reds)
  handleCollisions()
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const green of greens) {
    drawSquare(green)
  }

  for (const red of reds) {
    drawSquare(red)
  }

  drawPlayer()
  drawUI()
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
