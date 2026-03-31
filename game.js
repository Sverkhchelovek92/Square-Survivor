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

function update() {
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

// DRAW

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // player
  ctx.fillStyle = player.color
  ctx.fillRect(player.x, player.y, player.size, player.size)

  ctx.strokeStyle = player.border
  ctx.lineWidth = 2
  ctx.strokeRect(player.x, player.y, player.size, player.size)

  // UI
  ctx.fillStyle = 'white'
  ctx.font = '18px Arial'
  ctx.fillText('← ↑ → ↓ — movement', 20, 30)
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
