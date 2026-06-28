const mazeRows = 15;
const mazeCols = 15;
const tileSize = 42;
const board = document.getElementById('mazeBoard');
const moveCountEl = document.getElementById('moveCount');
const bestScoreEl = document.getElementById('bestScore');
const statusEl = document.getElementById('statusMessage');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');

const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1]
];

let player = { row: 1, col: 1 };
let moveCount = 0;
let bestScore = 0;
let finished = false;

function getPetSprite() {
  const saved = sessionStorage.getItem('petLifeMinigameState');
  if (!saved) return '🐶';
  try {
    const state = JSON.parse(saved);
    const petType = state?.pet?.type || 'Dog';
    if (petType === 'Cat') return '🐱';
    if (petType === 'Dragon') return '🐉';
  } catch (error) {}
  return '🐶';
}

function renderMaze() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${mazeCols}, ${tileSize}px)`;
  board.style.gridTemplateRows = `repeat(${mazeRows}, ${tileSize}px)`;

  for (let row = 0; row < mazeRows; row += 1) {
    for (let col = 0; col < mazeCols; col += 1) {
      const cell = document.createElement('div');
      cell.className = 'maze-cell';
      if (maze[row][col] === 1) cell.classList.add('wall');
      if (maze[row][col] === 2) cell.classList.add('exit');
      if (player.row === row && player.col === col) {
        cell.classList.add('player');
        cell.textContent = getPetSprite();
      }
      board.appendChild(cell);
    }
  }
}

function updateStatus(message) {
  statusEl.textContent = message;
}

function movePlayer(direction) {
  if (finished) return;

  const nextRow = player.row + direction.row;
  const nextCol = player.col + direction.col;

  if (nextRow < 0 || nextRow >= mazeRows || nextCol < 0 || nextCol >= mazeCols) return;
  if (maze[nextRow][nextCol] === 1) return;

  player.row = nextRow;
  player.col = nextCol;
  moveCount += 1;
  moveCountEl.textContent = moveCount;
  renderMaze();

  if (maze[player.row][player.col] === 2) {
    finishGame();
  }
}

function finishGame() {
  finished = true;
  const perfect = moveCount <= 65;
  const good = moveCount <= 70;
  const score = perfect ? 100 : good ? 75 : 50;
  bestScore = Math.max(bestScore, score);
  bestScoreEl.textContent = bestScore;

  const result = {
    playerHealthDelta: perfect ? 8 : good ? 4 : -4,
    playerMoodDelta: perfect ? 10 : good ? 6 : -4,
    petEnergyDelta: perfect ? 10 : good ? 5 : -8,
    petHealthDelta: perfect ? 8 : good ? 3 : -6,
    message: perfect
      ? 'Great training run! Your pet is energized and happy.'
      : good
        ? 'Good run! Your pet learned a lot.'
        : 'The maze was rough, but your pet still made progress.'
  };

  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify(result));
  updateStatus('Maze complete! Returning to the game...');
  setTimeout(() => {
    window.location.href = '../../game_page/game.html';
  }, 900);
}

function resetGame() {
  player = { row: 1, col: 1 };
  moveCount = 0;
  finished = false;
  moveCountEl.textContent = '0';
  updateStatus('Navigate the maze and reach the exit.');
  renderMaze();
}

window.addEventListener('keydown', (event) => {
  const keyMap = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 },
  };

  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    movePlayer(direction);
  }
});

restartBtn.addEventListener('click', resetGame);
backBtn.addEventListener('click', () => {
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: -2,
    playerMoodDelta: -2,
    petEnergyDelta: -3,
    petHealthDelta: -2,
    message: 'You left the training maze early. Your pet still needs rest.'
  }));
  window.location.href = '../../game_page/game.html';
});

resetGame();
