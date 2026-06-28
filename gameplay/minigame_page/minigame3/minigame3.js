const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const distanceLabel = document.getElementById('distanceLabel');
const bestLabel = document.getElementById('bestLabel');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const statusEl = document.getElementById('statusMessage');

const GRAVITY = 0.34;
const FLAP_FORCE = -6.2;
const PIPE_WIDTH = 70;
const GAP = 136;
const PIPE_SPEED = 2.8;
const DRAGON_WIDTH = 54;
const DRAGON_HEIGHT = 54;

let dragonImage = null;
let gameStarted = false;
let gameOver = false;
let distance = 0;
let bestDistance = 0;
let dragon = {
  x: 140,
  y: 180,
  velocity: 0,
};
let pipes = [];
let frame = 0;
let lastTimestamp = 0;

function loadDragonImage() {
  const img = new Image();
  img.src = './dragonFlying.png';
  img.onload = () => {
    dragonImage = img;
    draw();
  };
}

function resetGame() {
  gameStarted = false;
  gameOver = false;
  distance = 0;
  frame = 0;
  dragon = { x: 140, y: 180, velocity: 0 };
  pipes = [];
  distanceLabel.textContent = '0';
  statusEl.textContent = 'Tap or press space to flap and soar.';
  draw();
}

function spawnPipe() {
  const minHeight = 70;
  const maxHeight = canvas.height - GAP - 70;
  const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
  pipes.push({ x: canvas.width + 40, topHeight, passed: false });
}

function flap() {
  if (!gameStarted) {
    gameStarted = true;
    lastTimestamp = performance.now();
    statusEl.textContent = 'Flight started!';
    requestAnimationFrame(loop);
  }
  if (!gameOver) {
    dragon.velocity = FLAP_FORCE;
  }
}

function checkCollision() {
  const dragonLeft = dragon.x;
  const dragonRight = dragon.x + DRAGON_WIDTH;
  const dragonTop = dragon.y;
  const dragonBottom = dragon.y + DRAGON_HEIGHT;

  if (dragonTop < 0 || dragonBottom > canvas.height) {
    return true;
  }

  return pipes.some((pipe) => {
    const pipeX = pipe.x;
    const pipeTopBottom = pipe.topHeight;
    const pipeBottomTop = pipe.topHeight + GAP;
    return dragonRight > pipeX && dragonLeft < pipeX + PIPE_WIDTH && (dragonTop < pipeTopBottom || dragonBottom > pipeBottomTop);
  });
}

function update() {
  if (!gameStarted || gameOver) return;

  frame += 1;
  dragon.velocity += GRAVITY;
  dragon.y += dragon.velocity;

  pipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED;
    if (!pipe.passed && pipe.x + PIPE_WIDTH < dragon.x) {
      pipe.passed = true;
      distance += 1;
      distanceLabel.textContent = distance;
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -10);
  if (frame % 110 === 0) spawnPipe();

  if (checkCollision()) {
    endGame();
  }
}

function drawBackground() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawDragon() {
  if (dragonImage) {
    ctx.drawImage(dragonImage, dragon.x, dragon.y, DRAGON_WIDTH, DRAGON_HEIGHT);
  } else {
    ctx.fillStyle = '#f97316';
    ctx.fillRect(dragon.x, dragon.y, DRAGON_WIDTH, DRAGON_HEIGHT);
  }
}

function drawPipes() {
  ctx.fillStyle = '#16a34a';
  pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.topHeight + GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - GAP);
  });
}

function draw() {
  drawBackground();
  drawPipes();
  drawDragon();
}

function loop(timestamp) {
  if (!gameStarted || gameOver) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  if (delta > 0) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

function endGame() {
  gameOver = true;
  gameStarted = false;
  bestDistance = Math.max(bestDistance, distance);
  bestLabel.textContent = bestDistance;

  const scoreTier = distance >= 40 ? 'excellent' : distance >= 10 ? 'good' : distance >= 7 ? 'okay' : 'poor';
  let moodDelta = 0;
  let healthDelta = 0;
  let energyDelta = 0;
  let petHealthDelta = 0;

  if (scoreTier === 'excellent') {
    moodDelta = 20;
    healthDelta = 12;
    energyDelta = 30;
    petHealthDelta = 30;
  } else if (scoreTier === 'good') {
    moodDelta = 10;
    healthDelta = 6;
    energyDelta = 15;
    petHealthDelta = 10;
  } else if (scoreTier === 'okay') {
    moodDelta = 0;
    healthDelta = 3;
    energyDelta = 8;
    petHealthDelta = 5;
  } else {
    moodDelta = -10;
    healthDelta = -12;
    energyDelta = -12;
    petHealthDelta = -10;
  }

  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: healthDelta,
    playerMoodDelta: moodDelta,
    petEnergyDelta: energyDelta,
    petHealthDelta: petHealthDelta,
    message: `Dragon flight ended after ${distance} pipes. ${scoreTier === 'excellent' ? 'Your dragon soared brilliantly!' : scoreTier === 'good' ? 'A strong flight!' : scoreTier === 'okay' ? 'A decent flight.' : 'The dragon needs more practice.'}`,
  }));

  statusEl.textContent = 'Flight over. Returning to the game...';
  setTimeout(() => {
    window.location.href = '../../game_page/game.html';
  }, 900);
}

startBtn.addEventListener('click', () => {
  flap();
});

backBtn.addEventListener('click', () => {
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: -2,
    playerMoodDelta: -2,
    petEnergyDelta: -3,
    petHealthDelta: -2,
    message: 'You landed early. The dragon wants another try.'
  }));
  window.location.href = '../../game_page/game.html';
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener('click', () => flap());

loadDragonImage();
resetGame();
