const cupsBoard = document.getElementById('cupsBoard');
const difficultyLabel = document.getElementById('difficultyLabel');
const hintLabel = document.getElementById('hintLabel');
const statusEl = document.getElementById('statusMessage');
const startBtn = document.getElementById('startBtn');
const guessBtn = document.getElementById('guessBtn');
const backBtn = document.getElementById('backBtn');
const difficultyButtons = document.querySelectorAll('.difficulty-button');

const cupPositions = [60, 250, 440];
let cupOrder = [0, 1, 2];
let hiddenSlotIndex = 0;
let difficulty = 'easy';
let shuffleCount = 1;
let shuffleSpeed = 1200;
let isShuffling = false;
let canGuess = false;
let revealVisible = true;
let moves = [];
let petSprite = '🐶';
let revealTimeout = null;
let cupElements = [];

function loadGameState() {
  const raw = sessionStorage.getItem('petLifeMinigameState');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const type = parsed?.pet?.type || 'Dog';
    if (type === 'Cat') petSprite = '🐟';
    if (type === 'Dragon') petSprite = '🪙';
    if (type === 'Dog') petSprite = '🦴';
  } catch (error) {
    console.error('Invalid minigame state:', error);
  }
}

function initCupElements() {
  cupsBoard.innerHTML = '';
  cupElements = [];

  for (let cupId = 0; cupId < 3; cupId += 1) {
    const cup = document.createElement('button');
    cup.type = 'button';
    cup.className = `cup-card ${canGuess ? 'enabled' : 'disabled'}`;
    cup.dataset.cupId = cupId;
    cup.innerHTML = `
      <img src="cup.png" class="cup-image" alt="Cup" />
      <div class="cup-shadow"></div>
    `;
    cup.addEventListener('click', () => handleCupClick(Number(cup.dataset.slot || 0)));
    cupsBoard.appendChild(cup);
    cupElements.push(cup);
  }
}

function renderCups() {
  cupElements.forEach((cupEl, cupId) => {
    const slotIndex = cupOrder.indexOf(cupId);
    cupEl.style.left = `${cupPositions[slotIndex]}px`;
    cupEl.dataset.slot = slotIndex;
    cupEl.className = `cup-card ${canGuess ? 'enabled' : 'disabled'}`;

    const existingItem = cupEl.querySelector('.cup-item');
    if (existingItem) existingItem.remove();

    if (revealVisible && slotIndex === hiddenSlotIndex) {
      cupEl.classList.add('cup-reveal');
      const item = document.createElement('div');
      item.className = 'cup-item';
      item.textContent = petSprite;
      cupEl.appendChild(item);
    } else {
      cupEl.classList.remove('cup-reveal');
    }
  });
}

function updateDifficultyDisplay() {
  difficultyLabel.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  if (difficulty === 'easy') {
    hintLabel.textContent = '1 shuffle';
    shuffleCount = 1;
    shuffleSpeed = 1300;
  } else if (difficulty === 'medium') {
    hintLabel.textContent = '3 shuffles';
    shuffleCount = 3;
    shuffleSpeed = 850;
  } else {
    hintLabel.textContent = '5 shuffles';
    shuffleCount = 5;
    shuffleSpeed = 550;
  }
}

function setDifficulty(level) {
  difficulty = level;
  difficultyButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.level === level);
  });
  updateDifficultyDisplay();
}

function shuffleCups() {
  if (isShuffling) return;
  isShuffling = true;
  canGuess = false;
  guessBtn.disabled = true;
  startBtn.disabled = true;
  revealVisible = true;
  renderCups();
  statusEl.textContent = 'The treasure is glowing for a moment...';

  setTimeout(() => {
    revealVisible = false;
    renderCups();
    statusEl.textContent = 'Watching the shuffle...';

    let round = 0;
    const interval = setInterval(() => {
      if (round >= shuffleCount) {
        clearInterval(interval);
        isShuffling = false;
        canGuess = true;
        guessBtn.disabled = false;
        startBtn.disabled = false;
        statusEl.textContent = 'Shuffle finished! Pick a cup.';
        return;
      }

      const first = Math.floor(Math.random() * 3);
      let second = Math.floor(Math.random() * 3);
      while (second === first) second = Math.floor(Math.random() * 3);

      [cupOrder[first], cupOrder[second]] = [cupOrder[second], cupOrder[first]];
      if (hiddenSlotIndex === first) {
        hiddenSlotIndex = second;
      } else if (hiddenSlotIndex === second) {
        hiddenSlotIndex = first;
      }

      moves.push([first, second]);
      renderCups();
      round += 1;
    }, shuffleSpeed);
  }, 800);
}

function handleCupClick(index) {
  if (!canGuess || isShuffling) return;
  canGuess = false;
  guessBtn.disabled = true;
  const isCorrect = index === hiddenSlotIndex;
  finishGame(isCorrect);
}

function finishGame(isCorrect) {
  const results = {
    easy: { success: { mood: 8, health: 4, energy: 8, petHealth: 4 }, failure: { mood: -8, health: 0, energy: -4, petHealth: -6 } },
    medium: { success: { mood: 10, health: 6, energy: 10, petHealth: 6 }, failure: { mood: -10, health: -6, energy: -6, petHealth: -10 } },
    hard: { success: { mood: 12, health: 8, energy: 12, petHealth: 8 }, failure: { mood: -12, health: -10, energy: -10, petHealth: -12 } },
  };

  const chosen = results[difficulty];
  const outcome = isCorrect ? chosen.success : chosen.failure;
  const message = isCorrect
    ? `Correct! You remembered the ${petSprite} treasure location.`
    : `Wrong cup. The ${petSprite} treasure was under the chosen position.`;

  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: outcome.health,
    playerMoodDelta: outcome.mood,
    petEnergyDelta: outcome.energy,
    petHealthDelta: outcome.petHealth,
    message,
  }));

  statusEl.textContent = `${message} Returning to the game...`;
  setTimeout(() => {
    window.location.href = '../../game_page/game.html';
  }, 900);
}

function startGame() {
  loadGameState();
  cupOrder = [0, 1, 2];
  hiddenSlotIndex = Math.floor(Math.random() * 3);
  moves = [];
  revealVisible = true;
  if (revealTimeout) clearTimeout(revealTimeout);
  startBtn.disabled = true;
  guessBtn.disabled = true;
  setDifficulty('easy');
  if (cupElements.length === 0) initCupElements();
  renderCups();
  statusEl.textContent = `Watch the ${petSprite} hide under a cup.`;

  revealTimeout = setTimeout(() => {
    revealVisible = false;
    renderCups();
    startBtn.disabled = false;
    statusEl.textContent = 'Now start the shuffle!';
  }, 1600);
}

startBtn.addEventListener('click', () => {
  if (isShuffling) return;
  shuffleCups();
});

guessBtn.addEventListener('click', () => {
  statusEl.textContent = 'Pick one of the cups above.';
});

backBtn.addEventListener('click', () => {
  sessionStorage.setItem('petLifeMinigameResult', JSON.stringify({
    playerHealthDelta: -2,
    playerMoodDelta: -2,
    petEnergyDelta: -4,
    petHealthDelta: -3,
    message: 'Left the shell game early. Your pet feels unsettled.'
  }));
  window.location.href = '../../game_page/game.html';
});

difficultyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setDifficulty(button.dataset.level);
  });
});

startGame();
