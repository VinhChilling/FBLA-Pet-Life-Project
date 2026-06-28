const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const statusEl = document.getElementById('statusMessage');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 220;
const DOG_WIDTH = 64;
const DOG_HEIGHT = 54;
const GRAVITY = 0.4;
const DUCK_GRAVITY = 1.75;
const JUMP_FORCE = -11.5;

let gameState = 'ready';
let score = 0;
let bestScore = 0;
let lastTimestamp = 0;
let spawnTimer = 0;
let animationFrameId = null;
let speed = 5;
let obstacleId = 0;
let imagesLoaded = 0;

const dog = {
  x: 90,
  y: GROUND_Y - DOG_HEIGHT,
  width: DOG_WIDTH,
  height: DOG_HEIGHT,
  velocity: 0,
  onGround: true,
  ducking: false,
  frameOffset: 0,
};

const obstacles = [];
const inputState = {
  ducking: false,
};
const images = {
  dog: new Image(),
  ball: new Image(),
  stick: new Image(),
  bone: new Image(),
};

function preloadImages() {
  const sources = {
    dog: './dogMini.png',
    ball: './ballMini.png',
    stick: './stickMini.png',
    bone: './boneMini.png',
  };

  Object.entries(sources).forEach(([key, src]) => {
    const img = images[key];
    img.onload = () => {
      imagesLoaded += 1;
      if (imagesLoaded === 4) {
        render();
      }
    };
    img.onerror = () => {
      imagesLoaded += 1;
      if (imagesLoaded === 4) {
        render();
      }
    };
    img.src = src;
  });
}

function resetGame() {
  score = 0;
  speed = 5;
  spawnTimer = 0;
  obstacles.length = 0;
  dog.x = 90;
  dog.y = GROUND_Y - DOG_HEIGHT;
  dog.velocity = 0;
  dog.onGround = true;
  dog.ducking = false;
  dog.frameOffset = 0;
  inputState.ducking = false;
  scoreEl.textContent = '0';
  statusEl.textContent = 'Press Start or tap the space bar to begin.';
  render();
}

function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  resetGame();
  gameState = 'running';
  lastTimestamp = 0;
  statusEl.textContent = 'Jump over the obstacles!';
  animationFrameId = requestAnimationFrame(loop);
}

function endGame() {
  if (gameState !== 'running') return;

  gameState = 'over';
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  bestScore = Math.max(bestScore, score);
  bestScoreEl.textContent = bestScore;

  const result = getScoreResult(score);
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify(result));
  statusEl.textContent = `Game over! You scored ${score}. Returning to your pet...`;
  render();

  setTimeout(() => {
    window.location.href = '../../game_page/game.html';
  }, 900);
}

function getScoreResult(currentScore) {
  if (currentScore >= 30) {
    return {
      playerHealthDelta: 12,
      playerMoodDelta: 20,
      petEnergyDelta: 30,
      petHealthDelta: 30,
      message: 'Great run! Your dog stayed lively and your pet is thrilled.',
    };
  }

  if (currentScore >= 20) {
    return {
      playerHealthDelta: 6,
      playerMoodDelta: 10,
      petEnergyDelta: 15,
      petHealthDelta: 10,
      message: 'Nice work! Your dog kept the pace and your pet enjoyed the training.',
    };
  }

  if (currentScore >= 10) {
    return {
      playerHealthDelta: 3,
      playerMoodDelta: 0,
      petEnergyDelta: 8,
      petHealthDelta: 5,
      message: 'A steady effort. Your pet still got a little boost from the session.',
    };
  }

  return {
    playerHealthDelta: -12,
    playerMoodDelta: -10,
    petEnergyDelta: -12,
    petHealthDelta: -10,
    message: 'The run was rough. Your pet needs extra rest and care.',
  };
}

function spawnObstacle() {
  const shouldFly = Math.random() < 0.4;
  const types = ['ball', 'stick', 'bone'];
  const type = shouldFly ? (Math.random() < 0.5 ? 'stick' : 'bone') : types[Math.floor(Math.random() * types.length)];
  const width = type === 'ball' ? 34 : 42;
  const height = type === 'ball' ? 34 : 48;
  const baseY = shouldFly ? 36 + Math.random() * 86 : GROUND_Y - height;
  const obstacle = {
    id: obstacleId++,
    type,
    x: WIDTH + 10,
    y: baseY,
    width,
    height,
    passed: false,
    flying: shouldFly,
    speed: speed + 1.3 + Math.random() * 1.8,
    wobble: Math.random() * Math.PI,
  };

  obstacles.push(obstacle);
}

function jump() {
  if (dog.onGround) {
    dog.velocity = JUMP_FORCE;
    dog.onGround = false;
  }
}

function loop(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (gameState === 'running') {
    update(delta);
    render();
    animationFrameId = requestAnimationFrame(loop);
  }
}

function update(delta) {
    const step = delta / 16.67;
    
    // Check if the player is pressing the duck key
    const isPressingDuck = inputState.ducking;
    
    // If on the ground and pressing duck, trigger the standard ground-duck state
    dog.ducking = dog.onGround && isPressingDuck;

    if (dog.ducking) {
        dog.y = GROUND_Y - DOG_HEIGHT;
        dog.velocity = 0;
        dog.onGround = true;
    } else {
        // If mid-air and pressing duck, apply the higher DUCK_GRAVITY multiplier
        const currentGravity = (!dog.onGround && isPressingDuck) 
            ? GRAVITY * DUCK_GRAVITY 
            : GRAVITY;
            
        dog.velocity += currentGravity * step;
        dog.y += dog.velocity * step; // Fixed structural syntax issue from line 184
    }

    // Ground collision check
    if (dog.y >= GROUND_Y - DOG_HEIGHT) {
        dog.y = GROUND_Y - DOG_HEIGHT;
        dog.velocity = 0;
        dog.onGround = true;
    }

    // --- rest of your obstacle spawning and moving code continues here ---

  spawnTimer += delta;
  const spawnInterval = Math.max(520, 980 - score * 18);
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnObstacle();
  }

  speed = 5 + score * 0.18;

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    obstacle.x -= obstacle.speed * step;

    if (!obstacle.passed && obstacle.x + obstacle.width < dog.x) {
      obstacle.passed = true;
      score += 1;
      scoreEl.textContent = score;
      bestScore = Math.max(bestScore, score);
      bestScoreEl.textContent = bestScore;
    }

    const collided = checkCollision(dog, obstacle);
    if (collided) {
      endGame();
      break;
    }

    if (obstacle.x + obstacle.width < -20) {
      obstacles.splice(i, 1);
    }
  }
}

function checkCollision(dogSprite, obstacle) {
  return dogSprite.x < obstacle.x + obstacle.width &&
    dogSprite.x + dogSprite.width > obstacle.x &&
    dogSprite.y < obstacle.y + obstacle.height &&
    dogSprite.y + dogSprite.height > obstacle.y;
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawSky();
  drawGround();
  drawClouds();
  drawObstacles();
  drawDog();
}

function drawSky() {
  ctx.fillStyle = '#9fe3ff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#fef7d0';
  ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.55);
}

function drawClouds() {
  const time = performance.now() / 600;
  const cloudPositions = [80, 260, 520, 680];
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  cloudPositions.forEach((x, index) => {
    const y = 48 + ((index + 1) % 2) * 16 + Math.sin(time + index) * 6;
    ctx.beginPath();
    ctx.arc(x + 20 + Math.sin(time + index) * 5, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 44, y - 8, 24, 0, Math.PI * 2);
    ctx.arc(x + 64, y, 18, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGround() {
  ctx.fillStyle = '#74b45e';
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = '#5f8a44';
  ctx.fillRect(0, GROUND_Y, WIDTH, 10);
}

function drawDog() {
  const bob = dog.onGround ? Math.sin(performance.now() / 220) * 1.1 : 0;
  const x = dog.x;
  const y = dog.y + bob;
  const drawHeight = dog.height;

  if (images.dog.complete && images.dog.naturalWidth) {
    ctx.save();
    ctx.drawImage(images.dog, x, y, dog.width, drawHeight);
    ctx.restore();
  } else {
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(x, y, dog.width, drawHeight);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 18, y + 10, 24, 16);
  }
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    const bob = obstacle.flying ? Math.sin(performance.now() / 180 + obstacle.wobble) * 2.5 : Math.sin(performance.now() / 160 + obstacle.wobble) * 2;
    const drawY = obstacle.y + bob;
    const img = images[obstacle.type];

    if (img.complete && img.naturalWidth) {
      ctx.save();
      ctx.translate(obstacle.x + obstacle.width / 2, drawY + obstacle.height / 2);
      ctx.rotate(Math.sin(performance.now() / 220 + obstacle.wobble) * 0.06);
      ctx.drawImage(img, -obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
      ctx.restore();
    } else {
      ctx.fillStyle = obstacle.type === 'ball' ? '#333' : obstacle.type === 'stick' ? '#8a5a2d' : '#d4c37a';
      ctx.beginPath();
      if (obstacle.type === 'ball') {
        ctx.arc(obstacle.x + obstacle.width / 2, drawY + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
      } else {
        ctx.fillRect(obstacle.x, drawY, obstacle.width, obstacle.height);
      }
      ctx.fill();
    }
  });
}

function handleKeydown(event) {
  if (event.code === 'ArrowDown' || event.key === 's' || event.key === 'S') {
    event.preventDefault();
    inputState.ducking = true;
    return;
  }

  if (event.code === 'Space' || event.key === 'ArrowUp' || event.key === 'w') {
    event.preventDefault();
    if (gameState === 'ready') {
      startGame();
    } else if (gameState === 'running') {
      jump();
    }
  }
}

function handleKeyup(event) {
  if (event.code === 'ArrowDown' || event.key === 's' || event.key === 'S') {
    inputState.ducking = false;
  }
}

window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);
canvas.addEventListener('pointerdown', () => {
  if (gameState === 'ready') {
    startGame();
  } else if (gameState === 'running') {
    jump();
  }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
  if (gameState === 'running') {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  startGame();
});
backBtn.addEventListener('click', () => {
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: -2,
    playerMoodDelta: -2,
    petEnergyDelta: -3,
    petHealthDelta: -2,
    message: 'You left the dog dash early. Your pet still needs rest.',
  }));
  window.location.href = '../../game_page/game.html';
});

preloadImages();
resetGame();
