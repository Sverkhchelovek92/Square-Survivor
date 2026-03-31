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
