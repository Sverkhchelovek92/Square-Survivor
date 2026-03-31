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
  const size = random(15, 30)

  return {
    x: random(0, canvas.width - size),
    y: random(0, canvas.height - size),
    size,
    color,
    speedX: random(-2, 2),
    speedY: random(-2, 2),
  }
}

for (let i = 0; i < 10; i++) {
  greens.push(createMovingSquare('#3cff6b'))
}

for (let i = 0; i < 4; i++) {
  reds.push(createMovingSquare('#ff3b3b'))
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

    if (square.x <= 0 || square.x + square.size >= canvas.width) {
      square.speedX *= -1
    }

    if (square.y <= 0 || square.y + square.size >= canvas.height) {
      square.speedY *= -1
    }
  }
}

// DRAW

function drawSquare(square) {
  ctx.fillStyle = square.color
  ctx.fillRect(square.x, square.y, square.size, square.size)
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
  ctx.font = '18px Arial'
  ctx.fillText('← ↑ → ↓ — movement', 20, 30)
}

function update() {
  updatePlayer()
  updateSquares(greens)
  updateSquares(reds)
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
