const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerEl = document.getElementById('timer');
const staminaLabel = document.getElementById('staminaLabel');
const difficultyLabel = document.getElementById('difficultyLabel');
const difficultySelect = document.getElementById('difficultySelect');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const statusMessage = document.getElementById('statusMessage');
const staminaFill = document.getElementById('staminaFill');

const GRID_COLS = 25;
const GRID_ROWS = 15;
const CELL_SIZE = 34;
const MAZE_WIDTH = GRID_COLS * CELL_SIZE;
const MAZE_HEIGHT = GRID_ROWS * CELL_SIZE;
const OFFSET_X = (canvas.width - MAZE_WIDTH) / 2;
const OFFSET_Y = (canvas.height - MAZE_HEIGHT) / 2;

const assets = {
  cat: new Image(),
  mouse: new Image()
};
assets.cat.src = './catMini.png';
assets.mouse.src = './mouseMini.png';

const LIGHT_RADIUS = 120;

const DIFFICULTY = {
  easy: { 
    time: 60, mouseDelay: 900, mouseSpeed: 2, 
    success: { playerHealth: 3, playerMood: 0, petEnergy: 8, petHealth: 5}, 
    failure: { playerHealth: -3, playerMood: 0, petEnergy: -8, petHealth: -5 }
  },
  medium: { 
    time: 45, mouseDelay: 450, mouseSpeed: 4, 
    success: { playerHealth: 6, playerMood: 10, petEnergy: 15, petHealth: 10 }, 
    failure: { playerHealth: -6, playerMood: -10, petEnergy: -15, petHealth: -10}
  },
  hard: { 
    time: 30, mouseDelay: 220, mouseSpeed: 6, 
    success: { playerHealth: 12, playerMood: 20, petEnergy: 30, petHealth: 30 }, 
    failure: { playerHealth: -12, playerMood: -20, petEnergy: -30, petHealth: -30 }
  }
};


const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const cat = {
  x: 1,
  y: 1,
  stamina: 100,
  stunnedUntil: 0,
  lastMoveTime: 0,
  moveInterval: 180,
  boostUntil: 0
};

const BASE_MOVE_INTERVAL_MS = 180;
const BOOST_MOVE_INTERVAL_MS = 60;
const BOOST_DURATION_MS = 5000;
const BOOST_STAMINA_COST = 25;

const mouse = {
  x: GRID_COLS - 2,
  y: GRID_ROWS - 2,
  trail: []
};

let difficulty = 'easy';
let gameState = 'ready';
let timeRemaining = DIFFICULTY.easy.time;
let headstart = 3;
let lastTimestamp = 0;
let mouseMoveTimer = 0;
let animationFrame = null;
let statusText = 'Choose difficulty and press Start.';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function preloadAssets() {
  const images = [assets.cat, assets.mouse];
  let loadedCount = 0;
  const finish = () => {
    loadedCount += 1;
    if (loadedCount >= images.length) {
      render();
    }
  };
  images.forEach((image) => {
    if (image.complete && image.naturalWidth) {
      finish();
    } else {
      image.onload = finish;
      image.onerror = finish;
    }
  });
}

function resetGame() {
  cat.x = 1;
  cat.y = 1;
  cat.stamina = 100;
  cat.stunnedUntil = 0;
  cat.lastMoveTime = 0;
  cat.moveInterval = BASE_MOVE_INTERVAL_MS;
  cat.boostUntil = 0;
  
  mouse.x = GRID_COLS - 2;
  mouse.y = GRID_ROWS - 2;
  mouse.trail = [{ x: mouse.x, y: mouse.y }];
  
  difficulty = difficultySelect.value;
  difficultyLabel.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  
  timeRemaining = DIFFICULTY[difficulty].time;
  headstart = 3;
  mouseMoveTimer = 0;
  lastTimestamp = 0;
  gameState = 'ready';
  statusText = 'Mouse has a 3 second head start. Get ready!';
  
  timerEl.textContent = `${Math.ceil(timeRemaining)}s`;
  staminaLabel.textContent = `${Math.round(cat.stamina)}%`;
  updateStaminaBar();
  render();
}

function startGame() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  resetGame();
  gameState = 'running';
  statusText = 'Head start in progress...';
  animationFrame = requestAnimationFrame(gameLoop);
}

function endGame(success) {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  animationFrame = null;
  gameState = 'over';
  
  const config = DIFFICULTY[difficulty];
  const result = success ? {
    playerHealthDelta: config.success.playerHealth,
    playerMoodDelta: config.success.playerMood,
    petEnergyDelta: config.success.petEnergy,
    petHealthDelta: config.success.petHealth,
    message: `You caught the mouse! ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} training complete.`,
  } : {
    playerHealthDelta: config.failure.playerHealth,
    playerMoodDelta: config.failure.playerMood,
    petEnergyDelta: config.failure.petEnergy,
    petHealthDelta: config.failure.petHealth,
    message: "You didn't catch the mouse in time. Training ends.",
  };
  
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify(result));
  statusText = result.message;
  render();
  
  setTimeout(() => {
    window.location.href = '../../game_page/game.html';
  }, 1900);
}

function isWall(x, y) {
  if (y < 0 || y >= GRID_ROWS || x < 0 || x >= GRID_COLS) return true;
  return maze[y][x] === 1;
}

function moveCat(dx, dy) {
  if (gameState !== 'running') return;
  if (Date.now() < cat.stunnedUntil) return;
  
  const now = Date.now();
  const interval = (cat.boostUntil && now < cat.boostUntil) ? BOOST_MOVE_INTERVAL_MS : (cat.moveInterval || BASE_MOVE_INTERVAL_MS);
  if (now - (cat.lastMoveTime || 0) < interval) return;
  
  const targetX = cat.x + dx;
  const targetY = cat.y + dy;
  if (isWall(targetX, targetY)) return;
  
  cat.x = targetX;
  cat.y = targetY;
  cat.lastMoveTime = now;
  checkCatch();
}

function dashCat(dx, dy) {
  if (gameState !== 'running') return;
  if (Date.now() < cat.stunnedUntil) return;
  if (cat.stamina < 30) {
    statusText = 'Not enough stamina to dash.';
    return;
  }
  
  const firstX = cat.x + dx;
  const firstY = cat.y + dy;
  const secondX = cat.x + dx * 2;
  const secondY = cat.y + dy * 2;
  
  if (isWall(firstX, firstY) || isWall(secondX, secondY)) {
    cat.stunnedUntil = Date.now() + 3000;
    cat.stamina = clamp(cat.stamina - 30, 0, 100);
    statusText = 'Dash hit a wall! Stunned for 3 seconds.';
    updateStaminaBar();
    return;
  }
  
  cat.x = secondX;
  cat.y = secondY;
  cat.stamina = clamp(cat.stamina - 30, 0, 100);
  statusText = 'Dash successful!';
  updateStaminaBar();
  checkCatch();
}

function checkCatch() {
  if (cat.x === mouse.x && cat.y === mouse.y) {
    endGame(true);
  }
}

function getNeighbors(pos) {
  const neighbors = [];
  const deltas = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];
  deltas.forEach(({ dx, dy }) => {
    const x = pos.x + dx;
    const y = pos.y + dy;
    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS && !isWall(x, y)) {
      neighbors.push({ x, y });
    }
  });
  return neighbors;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function moveMouse() {
  if (gameState !== 'running') return;
  const options = getNeighbors({ x: mouse.x, y: mouse.y });
  if (!options.length) return;
  
  const bestDistance = Math.max(...options.map((pos) => distance(pos, cat)));
  const candidates = options.filter((pos) => distance(pos, cat) >= bestDistance - 1);
  const next = candidates[Math.floor(Math.random() * candidates.length)];
  
  mouse.x = next.x;
  mouse.y = next.y;
  mouse.trail.push({ x: mouse.x, y: mouse.y });
  if (mouse.trail.length > 12) mouse.trail.shift();
  checkCatch();
}

function updateStaminaBar() {
  staminaLabel.textContent = `${Math.round(cat.stamina)}%`;
  staminaFill.style.width = `${cat.stamina}%`;
}

function update(delta) {
  const now = Date.now();
  if (gameState !== 'running') return;
  
  if (cat.boostUntil && now > cat.boostUntil) {
    cat.boostUntil = 0;
    cat.moveInterval = BASE_MOVE_INTERVAL_MS;
    statusText = 'Speed boost ended.';
  }
  
  if (headstart > 0) {
    headstart -= delta / 1000;
    if (headstart <= 0) {
      headstart = 0;
      statusText = 'Go! Catch the mouse.';
    }
  }
  
  // Mouse movement checks delay configuration based on difficulty
  mouseMoveTimer += delta;
  const config = DIFFICULTY[difficulty];
  if (mouseMoveTimer >= config.mouseDelay) {
    mouseMoveTimer = 0;
    const steps = Math.max(1, config.mouseSpeed || 1);
    for (let i = 0; i < steps; i += 1) {
      moveMouse();
      if (gameState !== 'running') break;
    }
  }
  
  if (Date.now() > cat.stunnedUntil && cat.stamina < 100) {
    cat.stamina = clamp(cat.stamina + delta * 0.025, 0, 100);
  }
  updateStaminaBar();
  
  timeRemaining -= delta / 1000;
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    endGame(false);
  }
  timerEl.textContent = `${Math.ceil(timeRemaining)}s`;
}

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  update(delta);
  render();
  if (gameState === 'running') {
    animationFrame = requestAnimationFrame(gameLoop);
  }
}

function drawMaze() {
  const centerX = OFFSET_X + cat.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = OFFSET_Y + cat.y * CELL_SIZE + CELL_SIZE / 2;
  const lightRadius = LIGHT_RADIUS;
  
  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const x = OFFSET_X + col * CELL_SIZE;
      const y = OFFSET_Y + row * CELL_SIZE;
      const cellCenterX = x + CELL_SIZE / 2;
      const cellCenterY = y + CELL_SIZE / 2;
      const isVisible = Math.hypot(cellCenterX - centerX, cellCenterY - centerY) <= lightRadius;
      
      if (maze[row][col] === 1) {
        ctx.fillStyle = isVisible ? '#232a38' : '#07080d';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = isVisible ? '#1a202b' : '#050609';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function drawTrail() {
  mouse.trail.forEach((point, index) => {
    const alpha = (index + 1) / mouse.trail.length;
    const px = OFFSET_X + point.x * CELL_SIZE + CELL_SIZE / 2;
    const py = OFFSET_Y + point.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 72, 72, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(255, 92, 92, ${alpha * 0.85})`;
    ctx.beginPath();
    ctx.arc(px, py, 8 + alpha * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawEntities() {
  const catX = OFFSET_X + cat.x * CELL_SIZE + CELL_SIZE / 2;
  const catY = OFFSET_Y + cat.y * CELL_SIZE + CELL_SIZE / 2;
  
  if (assets.cat.complete && assets.cat.naturalWidth) {
    ctx.drawImage(assets.cat, catX - 18, catY - 18, 36, 36);
  } else {
    ctx.save();
    ctx.fillStyle = '#fff5c4';
    ctx.beginPath();
    ctx.arc(catX, catY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a272b';
    ctx.beginPath();
    ctx.arc(catX - 5, catY - 4, 3, 0, Math.PI * 2);
    ctx.arc(catX + 5, catY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  const mouseX = OFFSET_X + mouse.x * CELL_SIZE + CELL_SIZE / 2;
  const mouseY = OFFSET_Y + mouse.y * CELL_SIZE + CELL_SIZE / 2;
  
  if (assets.mouse.complete && assets.mouse.naturalWidth) {
    ctx.drawImage(assets.mouse, mouseX - 14, mouseY - 14, 28, 28);
  } else {
    ctx.save();
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.arc(mouseX + 3, mouseY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawLighting() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'destination-out';
  
  const centerX = OFFSET_X + cat.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = OFFSET_Y + cat.y * CELL_SIZE + CELL_SIZE / 2;
  
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, LIGHT_RADIUS);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.08)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, LIGHT_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(centerX, centerY, LIGHT_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawTrail();
  drawEntities();
  drawLighting();
  difficultyLabel.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  statusMessage.textContent = statusText;
}

function handleKeydown(event) {
  if (gameState !== 'running') return;
  if (Date.now() < cat.stunnedUntil) return;
  
  if (event.code === 'Space') {
    event.preventDefault();
    const now = Date.now();
    if (now < cat.boostUntil) {
      statusText = 'Speed boost already active.';
      return;
    }
    if (cat.stamina < BOOST_STAMINA_COST) {
      statusText = 'Not enough stamina for speed boost.';
      return;
    }
    cat.stamina = clamp(cat.stamina - BOOST_STAMINA_COST, 0, 100);
    cat.boostUntil = now + BOOST_DURATION_MS;
    cat.moveInterval = BOOST_MOVE_INTERVAL_MS;
    statusText = 'Super speed active!';
    updateStaminaBar();
    return;
  }
  
  const directions = {
    ArrowUp: { dx: 0, dy: -1 },
    ArrowDown: { dx: 0, dy: 1 },
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
    KeyW: { dx: 0, dy: -1 },
    KeyS: { dx: 0, dy: 1 },
    KeyA: { dx: -1, dy: 0 },
    KeyD: { dx: 1, dy: 0 },
  };
  
  const dir = directions[event.code];
  if (!dir) return;
  event.preventDefault();
  
  if (event.shiftKey) {
    dashCat(dir.dx, dir.dy);
  } else {
    moveCat(dir.dx, dir.dy);
  }
}

startBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => {
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: -2,
    playerMoodDelta: -2,
    petEnergyDelta: -3,
    petHealthDelta: -2,
    message: 'You left the chase early. Your pet still needs rest.',
  }));
  window.location.href = '../../game_page/game.html';
});

difficultySelect.addEventListener('change', () => {
  difficulty = difficultySelect.value;
  difficultyLabel.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  if (gameState !== 'running') {
    timeRemaining = DIFFICULTY[difficulty].time;
    timerEl.textContent = `${Math.ceil(timeRemaining)}s`;
  }
});

window.addEventListener('keydown', (event) => {
  if (gameState === 'ready' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    startGame();
  }
  handleKeydown(event);
});

resetGame();
preloadAssets();