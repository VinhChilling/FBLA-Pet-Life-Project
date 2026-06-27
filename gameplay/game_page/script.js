// ============================================================
// PET LIFE
// Simulate caring for a virtual pet while managing your own
// health, time, and resources across multiple days.
// ============================================================

// ===== DATA MODELS =====

// Pet object: stores all pet-related stats and activity counters
// Daily statistics tracking for analytics dashboard
let dailyStats = [];

// Record daily statistics at the end of each day
function recordDailyStats() {
  const dayData = {
    day: player.currentDay,
    pet: {
      health: pet.health,
      energy: pet.energy,
      mood: pet.mood,
      timesFed: pet.timesFed,
      timesPlayed: pet.timesPlayed,
      timesCleaned: pet.timesCleaned,
      timesVisitedVet: pet.timesVisitedVet,
      timesDoingChores: pet.timesDoingChores,
      evolutionStage: pet.evolutionStage ?? 0,
    },
    player: {
      health: player.health,
      mood: player.mood,
      coins: player.coins,
      expenses: player.expenses,
      currentPoints: player.currentPoints,
      avgSleepHours: player.avgSleepHours,
      timesWorked: player.timesWorked,
      timesStudied: player.timesStudied,
      timesExercised: player.timesExercised,
      timesSlept: player.timesSlept,
      timesRead: player.timesRead,
      timesHangout: player.timesHangout
    },
    timestamp: new Date().toISOString()
  };
  
  dailyStats.push(dayData);
  console.log(`Recorded stats for Day ${player.currentDay}:`, dayData);
}

let pet = {
  gameStarted: false,
  name: "",
  type: "",
  mood: "Happy",
  energy: 75,
  health: 90,

  // Daily activity counters (reset each day)
  fedCounter: 0, // Need 3+ per day
  playCounter: 0, // Need 4+ per day
  hasCleaned: false,
  hadVetVisitThisWeek: false,

  // Lifetime statistics
  timesFed: 0,
  timesPlayed: 0,
  timesCleaned: 0,
  timesVisitedVet: 0,
  timesDoingChores: 0,

  // Evolution tracking
  evolutionStage: 0,
  evolutionHistory: [{ stage: 0, day: 1 }],
};

// Player object: manages time, money, health, and scoring
let player = {
  name: "",
  currentDay: 1,
  time: 24, // Hours available per day
  coins: 10,
  expenses: 0,
  health: 90,
  mood: 75,
  difficulty: "normal", // easy, normal, hard

  // Scoring system
  potentialPoints: 100,
  currentPoints: 0,
  pointsReduction: 0,

  // Sleep tracking
  avgSleepHours: 0,
  totalSleepHours: 0,
  lastSleepHours: 0,

  // Daily activity flags (reset each day)
  hasHangout: false,
  hasExercised: false,
  hasRead: false,
  hasScheduled: false,
  hasCreatedTodoToday: false, // Prevent creating todo list twice in a day

  // Lifetime statistics
  timesWorked: 0,
  timesStudied: 0,
  timesSlept: 0,
  timesHangout: 0,
  timesExercised: 0,
  timesRead: 0,
  timesScheduled: 0,

  // Shop upgrades
  foodTier: "basic",
  toyTier: "basic",
  hasScheduleFeature: false,
  totalMoneySpent: 0,
  daysFoodBought: -7, // Track when food was last bought (initialized as expired)
  daysToyBought: -7, // Track when toy was last bought (initialized as expired)
};

// ===== SHOP DEFINITIONS =====

const FOOD_SHOP = [
  {
    name: "Basic Food",
    cost: 5,
    energyPerFeed: 5,
    desc: "Standard meal. 1 energy per dollar (renews weekly)",
  },
  {
    name: "Premium Food",
    cost: 10,
    energyPerFeed: 10,
    desc: "Better ingredients. 2 energy per dollar (renews weekly)",
  },
  {
    name: "Deluxe Food",
    cost: 15,
    energyPerFeed: 15,
    desc: "Gourmet quality. 3 energy per dollar (renews weekly)",
  },
  {
    name: "Gourmet Food",
    cost: 25,
    energyPerFeed: 20,
    desc: "Finest ingredients. 4 energy per dollar (renews weekly)",
  },
];

const TOY_SHOP = [
  {
    name: "Basic Toy",
    cost: 5,
    playReduction: 0,
    dailyPlayNeeded: 4,
    desc: "Simple toy. Requires 4 plays/day (renews weekly)",
  },
  {
    name: "Standard Toy",
    cost: 10,
    playReduction: 1,
    dailyPlayNeeded: 3,
    desc: "Better engagement. Requires 3 plays/day (renews weekly)",
  },
  {
    name: "Premium Toy",
    cost: 15,
    playReduction: 2,
    dailyPlayNeeded: 2,
    desc: "Highly engaging. Requires 2 plays/day (renews weekly)",
  },
  {
    name: "Deluxe Toy",
    cost: 25,
    playReduction: 3,
    dailyPlayNeeded: 1,
    desc: "Ultimate toy. Requires only 1 play/day! (renews weekly)",
  },
];

const ADDON_SHOP = [
  {
    name: "To-Do Schedule",
    cost: 15,
    feature: "schedule",
    desc: "Unlock schedule feature. Costs 1-2 hours/use",
  },
];

const darkOverlay = document.getElementById("darkOverlay");
const darkOverlayTwo = document.getElementById("darkOverlayTwo");

// ===== INITIALIZATION =====

// Check for saved game on page load
window.addEventListener("DOMContentLoaded", function () {
  const hasSaveData = localStorage.getItem("petGameSave");
  const loadBtn = document.getElementById("loadBtn");
  if (hasSaveData && loadBtn) {
    loadBtn.style.display = "block";
  }
  setDefaultDifficulty();
  // Attach lightweight inline validation for name inputs (UX helper)
  try {
    const playerInputEl = document.getElementById("playerNameInput");
    const petInputEl = document.getElementById("petNameInput");

    if (playerInputEl) {
      const playerRulesEl = document.getElementById("playerNameRules");
      playerInputEl.addEventListener("input", function () {
        const v = this.value || "";
        const banned = containsBannedWord(v);
        if (v.trim().length === 0) {
          this.classList.remove("input-invalid");
          if (playerRulesEl)
            playerRulesEl.textContent = `Name rules: 1-${NAME_MAX_LENGTH} chars. Allowed: letters, numbers, space, -, _, '.`;
        } else if (banned) {
          this.classList.add("input-invalid");
          if (playerRulesEl)
            playerRulesEl.textContent = `Disallowed word detected: "${banned}"`;
        } else if (!isValidNameSyntax(v)) {
          this.classList.add("input-invalid");
          if (playerRulesEl)
            playerRulesEl.textContent = `Invalid characters or length (1-${NAME_MAX_LENGTH}).`;
        } else {
          this.classList.remove("input-invalid");
          if (playerRulesEl)
            playerRulesEl.textContent = `Name rules: 1-${NAME_MAX_LENGTH} chars. Allowed: letters, numbers, space, -, _, '.`;
        }
      });
    }

    if (petInputEl) {
      const petRulesEl = document.getElementById("petNameRules");
      petInputEl.addEventListener("input", function () {
        const v = this.value || "";
        const banned = containsBannedWord(v);
        if (v.trim().length === 0) {
          this.classList.remove("input-invalid");
          if (petRulesEl)
            petRulesEl.textContent = `Name rules: 1-${NAME_MAX_LENGTH} chars. Allowed: letters, numbers, space, -, _, '.`;
        } else if (banned) {
          this.classList.add("input-invalid");
          if (petRulesEl)
            petRulesEl.textContent = `Disallowed word detected: "${banned}"`;
        } else if (!isValidNameSyntax(v)) {
          this.classList.add("input-invalid");
          if (petRulesEl)
            petRulesEl.textContent = `Invalid characters or length (1-${NAME_MAX_LENGTH}).`;
        } else {
          this.classList.remove("input-invalid");
          if (petRulesEl)
            petRulesEl.textContent = `Name rules: 1-${NAME_MAX_LENGTH} chars. Allowed: letters, numbers, space, -, _, '.`;
        }
      });
    }
  } catch (e) {
    /* non-fatal */
  }
});

// Set default difficulty to normal
// function setDefaultDifficulty() {
//   player.difficulty = "normal";
//   player.coins = 15;
//   const normalBtn = document.getElementById("normalBtn");
//   const difficultyInfo = document.getElementById("difficultyInfo");
//   if (normalBtn) normalBtn.classList.add("active");
//   if (difficultyInfo) difficultyInfo.textContent = "Normal: Start with $15";
// }

//Maps pet types to their image paths
const petImages = {
  Dog: "../../images/dog.png",
  Cat: "../../images/cat.png",
  Dragon: "../../images/dragon.png",
};

// Update main pet display with image and evolution styling
function updateMainPetImage(petType, stageId) {
  const mainPetContainer = document.getElementById("mainPetImage");
  if (!mainPetContainer) return;

  const stage = stageId ?? pet.evolutionStage ?? 0;
  if (typeof buildEvolutionImageHtml === "function") {
    mainPetContainer.innerHTML = buildEvolutionImageHtml(
      petType,
      stage,
      petImages,
      "pet-main-img",
    );
  } else {
    mainPetContainer.innerHTML = `<img src="${petImages[petType]}" alt="${petType}" class="pet-main-img">`;
  }

  if (typeof renderEvolutionBadge === "function") {
    renderEvolutionBadge(stage, "evolutionBadge");
  }
}

function checkEvolution() {
  if (typeof getEvolutionStageForDay !== "function") return;

  const target = getEvolutionStageForDay(player.currentDay, pet.health);
  const current = pet.evolutionStage ?? 0;

  if (target.id > current) {
    pet.evolutionStage = target.id;
    if (!Array.isArray(pet.evolutionHistory)) {
      pet.evolutionHistory = [{ stage: 0, day: 1 }];
    }
    pet.evolutionHistory.push({ stage: target.id, day: player.currentDay });
    updateMainPetImage(pet.type, pet.evolutionStage);
    showNotification(
      `${pet.name} evolved into ${target.emoji} ${target.name}!`,
      "Success",
    );
  }
}

// Update pet preview when selection changes
function updatePetPreview() {
  const petTypeInput = document.getElementById("petType");
  if (!petTypeInput) return;
  const petType = petTypeInput.value;
  const descMap = {
    Dog: "Dog - Friendly and loyal",
    Cat: "Cat - Independent and curious",
    Dragon: "Dragon - Powerful and majestic",
  };

  const preview = document.getElementById("petPreview");
  const previewText = document.getElementById("petPreviewText");

  if (!preview || !previewText) return;
  preview.innerHTML = `<img src="${petImages[petType]}" alt="${petType}" class="pet-preview-img">`;
  previewText.textContent = descMap[petType] || petType;

  preview.style.animation = "none";
  setTimeout(() => {
    preview.style.animation = "bounce 0.6s ease";
  }, 10);
}

// Initialize pet preview on page load
document.addEventListener("DOMContentLoaded", function () {
  updatePetPreview();
});

// Select difficulty level
function selectDifficulty(level) {
  document
    .querySelectorAll(".difficulty-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const difficultyMap = {
    easy: { coins: 30, info: "Easy: Start with $30", btn: "easyBtn" },
    normal: { coins: 15, info: "Normal: Start with $15", btn: "normalBtn" },
    hard: { coins: 5, info: "Hard: Start with only $5", btn: "hardBtn" },
  };

  const config = difficultyMap[level];
  player.difficulty = level;
  player.coins = config.coins;
  const selectedBtn = document.getElementById(config.btn);
  const difficultyInfo = document.getElementById("difficultyInfo");
  if (selectedBtn) selectedBtn.classList.add("active");
  if (difficultyInfo) difficultyInfo.textContent = config.info;
}

// Start the game after pet setup is complete
function startGame() {
  // Skip authentication - go directly to game
  console.log("🎮 Starting game in local mode");
  startGameInternal();
}

// Internal start logic separated so auth UI can call it directly for Guest mode
function startGameInternal() {
  // Validate and sanitize player & pet names
  const rawPlayerName = document.getElementById("playerNameInput").value || "";
  const rawPetName = document.getElementById("petNameInput").value || "";

  const validatedPlayer = validateAndSanitizeName(
    rawPlayerName,
    "Player name",
    "Player",
  );
  const validatedPet = validateAndSanitizeName(
    rawPetName,
    "Pet name",
    "Fluffy",
  );

  // If validation failed and user-facing correction is required, abort start
  if (validatedPlayer === null || validatedPet === null) return;

  player.name = validatedPlayer;
  pet.name = validatedPet;
  pet.type = document.getElementById("petType").value;
  pet.evolutionStage = 0;
  pet.evolutionHistory = [{ stage: 0, day: 1 }];
  dailyStats = [];

  // Reset stats based on difficulty
  if (player.difficulty === "easy") {
    player.coins = 30;
    pet.energy = 90;
    pet.health = 95;
    player.health = 90;
    player.mood = 75;
  } else if (player.difficulty === "normal") {
    player.coins = 15;
    pet.energy = 75;
    pet.health = 90;
    player.health = 90;
    player.mood = 75;
  } else if (player.difficulty === "hard") {
    player.coins = 5;
    pet.energy = 60;
    pet.health = 70;
    player.health = 90;
    player.mood = 75;
  }

  // Switch to game screen
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("petName").textContent = pet.name;
  document.getElementById("petTypeDisplay").textContent = pet.type;

  // Set pet image based on type
  updateMainPetImage(pet.type, pet.evolutionStage);

  pet.gameStarted = true;
  updateDayDisplay();
  updatePetStats();
  updatePlayerStats();
  updateProgressBars();
  saveGame();
}

// ===== SAVE/LOAD SYSTEM =====

// Save game to backend (if authenticated) and localStorage (fallback)
async function saveGame() {
  try {
    const gameData = {
      pet: pet,
      player: player,
      dailyStats: dailyStats,
      timestamp: new Date().toISOString(),
    };

    // Always save to localStorage (local backup)
    localStorage.setItem("petGameSave", JSON.stringify(gameData));

    // Try to save to backend if authenticated
    if (apiAuth && apiAuth.isLoggedIn && apiAuth.isLoggedIn()) {
      try {
        await apiSave.save(pet, player, 1);
      } catch (backendError) {
        console.warn(
          "⚠️ Backend save failed, using local save:",
          backendError.message,
        );
      }
    }

    showSaveIndicator();
  } catch (error) {
    console.error("Save error:", error);
    showErrorNotification(`⚠️ Failed to save game: ${error.message}`, "save");
  }
}

// Store last action for retry
let lastAction = null;

function applyGameStateDefaults() {
  pet = {
    gameStarted: true,
    name: "Fluffy",
    type: "Dog",
    mood: "Happy",
    energy: 75,
    health: 90,
    fedCounter: 0,
    playCounter: 0,
    hasCleaned: false,
    hadVetVisitThisWeek: false,
    timesFed: 0,
    timesPlayed: 0,
    timesCleaned: 0,
    timesVisitedVet: 0,
    timesDoingChores: 0,
    evolutionStage: 0,
    evolutionHistory: [{ stage: 0, day: 1 }],
    ...pet,
  };

  player = {
    name: "Player",
    currentDay: 1,
    time: 24,
    coins: 10,
    expenses: 0,
    health: 90,
    mood: 75,
    difficulty: "normal",
    potentialPoints: 100,
    currentPoints: 0,
    pointsReduction: 0,
    avgSleepHours: 0,
    totalSleepHours: 0,
    lastSleepHours: 0,
    hasHangout: false,
    hasExercised: false,
    hasRead: false,
    hasScheduled: false,
    hasCreatedTodoToday: false,
    timesWorked: 0,
    timesStudied: 0,
    timesSlept: 0,
    timesHangout: 0,
    timesExercised: 0,
    timesRead: 0,
    timesScheduled: 0,
    foodTier: "basic",
    toyTier: "basic",
    hasScheduleFeature: false,
    totalMoneySpent: 0,
    daysFoodBought: -7,
    daysToyBought: -7,
    ...player,
  };

  if (!Array.isArray(dailyStats)) dailyStats = [];
}

// Show save indicator briefly
function showSaveIndicator(message = "Saved") {
  const indicator = document.getElementById("saveIndicator");
  if (!indicator) return;

  indicator.textContent = message;
  indicator.style.display = "inline-block";
  indicator.style.animation = "none";
  setTimeout(() => {
    indicator.style.animation = "fadeInOut 2s ease";
  }, 10);
}

function showNotification(message, type = "Info") {
  const prefix = type === "Error" ? "Error: " : "";
  showSaveIndicator(prefix + message);
}

// Load game from backend (if authenticated) or localStorage with error handling
async function loadGame() {
  try {
    let gameData = null;

    // Try backend first if authenticated
    if (apiAuth && apiAuth.isLoggedIn && apiAuth.isLoggedIn()) {
      try {
        const backendState = await apiSave.load(1);
        if (backendState) {
          gameData = backendState;
          console.log("✅ Loaded game from backend");
        }
      } catch (backendError) {
        console.warn(
          "⚠️ Backend load failed, trying localStorage:",
          backendError.message,
        );
      }
    }

    // Fall back to localStorage if backend didn't provide data
    if (!gameData) {
      const savedData = localStorage.getItem("petGameSave");
      if (!savedData) {
        if (window.apiNavigation && typeof apiNavigation.goToEntrance === "function") {
          apiNavigation.goToEntrance();
        } else {
          window.location.href = "../entrance_page/entrance.html";
        }
        return;
      }
      gameData = JSON.parse(savedData);
    }

    // Load the game data
    pet = gameData.pet;
    player = gameData.player;
    dailyStats = Array.isArray(gameData.dailyStats) ? gameData.dailyStats : [];

    // Defensive validation of loaded names
    if (!pet || typeof pet !== "object") pet = {};
    if (!player || typeof player !== "object") player = {};
    applyGameStateDefaults();

    if (!isValidNameSyntax(pet.name) || containsBannedWord(pet.name)) {
      console.warn(
        "⚠️ Invalid or disallowed pet name in save — reset to default (Fluffy).",
      );
      pet.name = "Fluffy";
    }

    if (!isValidNameSyntax(player.name) || containsBannedWord(player.name)) {
      console.warn(
        "⚠️ Invalid or disallowed player name in save — reset to default (Player).",
      );
      player.name = "Player";
    }

    // Switch to game screen
    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("petName").textContent = pet.name;
    document.getElementById("petTypeDisplay").textContent = pet.type;

    // Set pet image
    updateMainPetImage(pet.type, pet.evolutionStage ?? 0);

    updateDayDisplay();
    updateStats();
  } catch (error) {
    console.error("Error loading game:", error);
    showErrorNotification(`❌ Error loading game: ${error.message}`, "load");
  }
}

// Show error notification with retry option
function showErrorNotification(message, actionType) {
  lastAction = actionType;
  const notification = document.getElementById("errorNotification");
  const errorMessage = document.getElementById("errorMessage");
  const retryBtn = document.getElementById("retryBtn");

  errorMessage.textContent = message;
  notification.setAttribute("aria-hidden", "false");
  notification.classList.add("show");

  // Hide retry button if no action to retry
  retryBtn.style.display = actionType ? "inline-block" : "none";
}

// Dismiss error notification
function dismissError() {
  const notification = document.getElementById("errorNotification");
  notification.classList.remove("show");
  notification.setAttribute("aria-hidden", "true");
  lastAction = null;
}

// Retry last failed action
function retryLastAction() {
  dismissError();

  if (lastAction === "save") {
    saveGame();
  } else if (lastAction === "load") {
    loadGame();
  }
}

// Clear saved game
function clearSaveGame() {
  if (
    confirm(
      "Are you sure you want to clear your saved game? This cannot be undone.",
    )
  ) {
    localStorage.removeItem("petGameSave");
    localStorage.removeItem("petGameSave_slot1");
    location.reload();
  }
}

// ===== RANDOM EVENTS SYSTEM =====

// Trigger random events during the day (called from various actions)
function triggerRandomEvent() {
  const eventChance = Math.random();

  // 50% chance of no event
  if (eventChance < 0.1) {
    triggerRandomSickness(); // 10% - rarest
  } else if (eventChance < 0.3) {
    triggerExtraHunger(); // 20%
  } else if (eventChance < 0.5) {
    triggerExtraEnergyNeed(); // 20%
  }
  // 50% chance no event
}

function triggerRandomSickness() {
  pet.health -= 20;
  pet.mood = "Sick";
  pet.hadVetVisitThisWeek = false; // Force vet visit
  showSaveIndicator("🤒 Your pet got sick! Visit the vet ASAP!");
  console.log("Random Event: Pet got sick!");
}

function triggerExtraHunger() {
  showSaveIndicator("🍽️ Your pet is extra hungry today! Feed more often.");
  pet.fedCounter = Math.max(0, pet.fedCounter - 2); // Reduce fed counter to require more feeding
  console.log("Random Event: Pet is extra hungry!");
}

function triggerExtraEnergyNeed() {
  showSaveIndicator("⚡ Your pet is extra playful! Needs more play sessions.");
  pet.playCounter = Math.max(0, pet.playCounter - 2); // Reduce play counter to require more playing
  console.log("Random Event: Pet needs extra play!");
}

// Check if food subscription expired (7 day cycle)
function checkFoodExpiration() {
  const daysSinceBought = player.currentDay - player.daysFoodBought;

  if (daysSinceBought >= 7 && player.foodTier !== "basic") {
    player.foodTier = "basic";
    showSaveIndicator("🍖 Your premium food expired! Reverted to basic food.");
    console.log("Food tier expired, reverted to basic");
  }
}

// Check if toy subscription expired (7 day cycle)
function checkToyExpiration() {
  const daysSinceBought = player.currentDay - player.daysToyBought;

  if (daysSinceBought >= 7 && player.toyTier !== "basic") {
    player.toyTier = "basic";
    showSaveIndicator("🎾 Your premium toy expired! Reverted to basic toy.");
    console.log("Toy tier expired, reverted to basic");
  }
}

// ===== GAME LOOP & DAY MANAGEMENT =====

// Main day cycle: processes end-of-day consequences and scoring
function dayTick() {
  // Check if food/toy subscriptions expired (7 day cycle)
  checkFoodExpiration();
  checkToyExpiration();

  // Check pet care requirements
  checkPetPlayRequirement();
  checkPetFeedingRequirement();
  checkPetVetRequirement();
  checkPetCleaningRequirement();

  // Record daily statistics before incrementing the day
  recordDailyStats();

  player.currentDay++;
  checkEvolution();
  updateDayDisplay();
  processSleepHours();

  // Trigger random event at day start
  triggerRandomEvent();

  calculateDailyScore();
  resetDailyCounters();
}

// Check if pet was played with enough (4+ times)
function checkPetPlayRequirement() {
  const requiredPlays = 4; // Fixed requirement in local mode

  if (pet.playCounter < requiredPlays) {
    pet.energy -= 20;
    pet.mood = "Bored";
    pet.health -= 15;
    player.mood -= 15;
  }
}

// Check if pet was fed enough (3+ times)
function checkPetFeedingRequirement() {
  if (pet.fedCounter < 3) {
    pet.energy -= 35;
    pet.mood = "Hungry";
    pet.health -= 20;
  }
}

// Check weekly vet requirement (every 7 days)
function checkPetVetRequirement() {
  if (player.currentDay % 7 === 0 && !pet.hadVetVisitThisWeek) {
    pet.energy -= 50;
    pet.mood = "Sick";
    pet.health -= 50;
  } else if (player.currentDay % 7 === 0) {
    pet.hadVetVisitThisWeek = false;
  }
}

// Check if pet was cleaned
function checkPetCleaningRequirement() {
  if (!pet.hasCleaned) {
    pet.energy -= 10;
    pet.mood = "Dirty";
    pet.health -= 15;
  }
}

// Record sleep hours and calculate average
function processSleepHours() {
  player.lastSleepHours = player.time;
  player.totalSleepHours += player.time;
  // Avoid division by zero on day 1
  if (player.currentDay > 1) {
    player.avgSleepHours = player.totalSleepHours / (player.currentDay - 1);
  } else {
    player.avgSleepHours = player.time; // First day, use current sleep hours
  }
}

// Calculate daily score based on player and pet performance
function calculateDailyScore() {
  let petCarePoints = 0;
  let playerCarePoints = 0;
  let efficiencyPoints = 0;
  let penalties = 0;

  // ===== PET CARE (0-35 points) =====
  // Feeding (10): Need 3+ per day
  if (pet.fedCounter >= 3) {
    petCarePoints += 10;
  } else {
    petCarePoints += pet.fedCounter * 3.33; // Partial credit
  }

  // Play/Toys (10): Need 4+ plays per day
  const requiredPlays = 4;
  if (pet.playCounter >= requiredPlays) {
    petCarePoints += 10;
  } else {
    petCarePoints += (pet.playCounter / requiredPlays) * 10;
  }

  // Health/Mood (10): Good health and mood
  if (pet.health >= 80 && pet.mood === "Happy") {
    petCarePoints += 10;
  } else if (pet.health >= 60) {
    petCarePoints += 5;
  }

  // Cleaning (5): Weekly cleaning (hasCleanedThisWeek or similar)
  if (pet.hasCleaned) {
    petCarePoints += 5;
  }

  // ===== PLAYER CARE (0-35 points) =====
  // Sleep (10): 8+ hours is good
  if (player.avgSleepHours >= 8) {
    playerCarePoints += 10;
  } else if (player.avgSleepHours >= 6) {
    playerCarePoints += 5;
  } else if (player.avgSleepHours >= 4) {
    playerCarePoints += 2;
  }

  // Exercise (10): Exercised at least once
  if (player.hasExercised) {
    playerCarePoints += 10;
  }

  // Social (10): Hangout at least once
  if (player.hasHangout) {
    playerCarePoints += 10;
  }

  // Education (5): Read at least once
  if (player.hasRead) {
    playerCarePoints += 5;
  }

  // Health/Mood (5): Player's health and mood
  if (player.health >= 80 && player.mood >= 75) {
    playerCarePoints += 5;
  } else if (player.health >= 60) {
    playerCarePoints += 2;
  }

  // ===== EFFICIENCY (0-20 points) =====
  // Money Management (10): Ratio of money spent vs earnings
  // Players get 20 coins daily, so balance spending
  if (player.coins >= 20) {
    efficiencyPoints += 10; // Saved money
  } else if (player.coins >= 10) {
    efficiencyPoints += 7;
  } else if (player.coins >= 0) {
    efficiencyPoints += 4;
  }

  // Time Management (10): Good use of time (max 24 hours)
  // If time is well used (few hours remaining), get points
  const timeUsed = 24 - player.time;
  if (timeUsed >= 18) {
    efficiencyPoints += 10; // Used 18+ hours productively
  } else if (timeUsed >= 12) {
    efficiencyPoints += 7;
  } else if (timeUsed >= 6) {
    efficiencyPoints += 4;
  }

  // ===== PENALTIES (-50 max) =====
  if (pet.health < 30) {
    penalties -= 20;
  }

  if (player.health < 30) {
    penalties -= 20;
  }

  // Neglect penalty: No interaction at all
  if (pet.playCounter === 0 && pet.fedCounter === 0 && !pet.hasCleaned) {
    penalties -= 10;
  }

  // Calculate final score
  const earnedPoints = clamp(
    petCarePoints + playerCarePoints + efficiencyPoints + penalties,
    0,
    100,
  );

  player.currentPoints += earnedPoints;

  // For debugging
  console.log(`Daily Score Breakdown:
    Pet Care: ${petCarePoints.toFixed(1)}/35
    Player Care: ${playerCarePoints.toFixed(1)}/35
    Efficiency: ${efficiencyPoints.toFixed(1)}/20
    Penalties: ${penalties}/-50
    Total: ${earnedPoints.toFixed(1)}/100`);
}

// Reset all daily activity trackers
function resetDailyCounters() {
  player.hasHangout = false;
  player.hasExercised = false;
  player.hasRead = false;
  player.hasScheduled = false;
  player.hasCreatedTodoToday = false;
  pet.playCounter = 0;
  pet.fedCounter = 0;
  pet.hasCleaned = false;

  // Reset to-do list completion tracking
  completedTodos = {};
}

// Update activity summary displays (only works in analytics dashboard)
function updateActivitySummary() {
  // Check if we're on the analytics dashboard by looking for activity elements
  const feedElement = document.getElementById("feedCount");
  if (!feedElement) return; // Exit if not on analytics dashboard
  
  const activityElements = {
    feed: feedElement,
    play: document.getElementById("playCount"), 
    clean: document.getElementById("cleanCount"),
    vet: document.getElementById("vetCount"),
    work: document.getElementById("workCount"),
    study: document.getElementById("studyCount"),
    exercise: document.getElementById("exerciseCount"),
    sleep: document.getElementById("sleepCount")
  };
  
  // Update each activity count if element exists
  if (activityElements.feed) activityElements.feed.textContent = pet.timesFed || 0;
  if (activityElements.play) activityElements.play.textContent = pet.timesPlayed || 0;
  if (activityElements.clean) activityElements.clean.textContent = pet.timesCleaned || 0;
  if (activityElements.vet) activityElements.vet.textContent = pet.timesVisitedVet || 0;
  if (activityElements.work) activityElements.work.textContent = player.timesWorked || 0;
  if (activityElements.study) activityElements.study.textContent = player.timesStudied || 0;
  if (activityElements.exercise) activityElements.exercise.textContent = player.timesExercised || 0;
  if (activityElements.sleep) activityElements.sleep.textContent = player.timesSlept || 0;
  
  console.log("Activity summary updated:", {
    feed: pet.timesFed || 0,
    play: pet.timesPlayed || 0,
    clean: pet.timesCleaned || 0,
    vet: pet.timesVisitedVet || 0,
    work: player.timesWorked || 0,
    study: player.timesStudied || 0,
    exercise: player.timesExercised || 0,
    sleep: player.timesSlept || 0
  });
}

// ===== PET CARE ACTIONS =====

const FOOD_TIER_INDEX = {
  basic: 0,
  premium: 1,
  deluxe: 2,
  gourmet: 3,
};

function getCurrentFood() {
  return FOOD_SHOP[FOOD_TIER_INDEX[player.foodTier] ?? 0];
}

// Feed pet: costs $5, increases energy, need 3+ per day
// Feed pet: uses current food tier for cost, energy, and healing
function feedPet() {
  // Check if player has bought food
  if (player.daysFoodBought === -7) {
    showErrorNotification("You must buy food from the shop first!", "Dismiss");
    return;
  }
  
  const food = getCurrentFood();
  const cost = food.cost;
  
  if (player.coins >= cost) {
    player.coins -= cost;
    player.expenses += cost;
    pet.energy += food.energyPerFeed;
    pet.health += 5;
    pet.mood = "Content";
    pet.fedCounter++;
    pet.timesFed++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification(`${pet.name} has been fed! +${food.energyPerFeed} energy`, "Success");
  } else {
    showErrorNotification(`Need $${cost} to feed pet!`, "Dismiss");
  }
}

// Play with pet: costs 1 hour, need 6+ per day
function playWithPet() {
  // Check if player has bought a toy
  if (player.daysToyBought === -7) {
    showErrorNotification("You must buy a toy from the shop first!", "Dismiss");
    return;
  }
  
  if (player.time >= 1) {
    player.time -= 1;
    pet.energy += 10;
    pet.mood = "Excited";
    pet.playCounter++;
    pet.timesPlayed++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification(`${pet.name} enjoyed playing with you! +10 energy`, "Success");
  } else {
    showErrorNotification("Need 1 hour to play with pet!", "Dismiss");
  }
}

// Clean pet: costs $3 and 2 hours, once per day
function cleanPet() {
  if (player.coins >= 3 && player.time >= 2) {
    player.coins -= 3;
    player.expenses += 3;
    player.time -= 2;
    pet.health += 5;
    pet.mood = "Happy";
    pet.hasCleaned = true;
    pet.timesCleaned++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification(`${pet.name} is now clean and happy!`, "Success");
  } else if (player.coins < 3) {
    showErrorNotification("Need $3 to clean pet!", "Dismiss");
  } else {
    showErrorNotification("Need 2 hours to clean pet!", "Dismiss");
  }
}

// Exercise: costs 2 hours, improves health and mood
function exercise() {
  if (player.time >= 2) {
    player.time -= 2;
    player.health += 10;
    player.mood += 10;
    player.hasExercised = true;
    player.timesExercised++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification("Exercise completed! +10 health, +10 mood", "Success");
  } else {
    showErrorNotification("Need 2 hours to exercise!", "Dismiss");
  }
}

// Do chores: costs 2 hours, earn $8
function doChore() {
  if (player.time >= 2) {
    player.coins += 8;
    player.time -= 2;
    pet.timesDoingChores++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification("Chores completed! +$8", "Success");
  } else {
    showErrorNotification("Need 2 hours to do chores!", "Dismiss");
  }
}

// Read book: costs 1 hour, improves health and mood
function readBook() {
  if (player.time >= 1) {
    player.health += 3;
    player.mood += 5;
    player.time -= 1;
    player.health = clamp(player.health);
    player.timesRead += 1;
    player.hasRead = true;
    player.mood = clamp(player.mood);
    showPetReaction("read");
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
  } else {
    showErrorNotification("Need 1 hour to read!", "Dismiss");
  }
}

// Hang out with friends: costs 3 hours, significantly improves mood
function hangoutWithFriends() {
  if (player.time >= 3) {
    player.health += 12;
    player.mood += 20;
    player.time -= 3;
    player.hasHangout = true;
    player.timesHangout += 1;
    player.mood = clamp(player.mood);
    player.health = clamp(player.health);
    showPetReaction("hangout");
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
  } else {
    showErrorNotification("Need 3 hours to hang out with friends!", "Dismiss");
  }
}

// Visit vet: costs $30 and 4 hours, required weekly
function vetVisit() {
  if (player.coins >= 30 && player.time >= 4) {
    player.coins -= 30;
    player.expenses += 30;
    player.time -= 4;
    pet.health += 50;
    pet.mood = "Healthy";
    pet.hadVetVisitThisWeek = true;
    pet.timesVisitedVet++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification(`${pet.name} visited the vet! Health restored`, "Success");
  } else if (player.coins < 30) {
    showErrorNotification("Need $30 to visit vet!", "Dismiss");
  } else {
    showErrorNotification("Need 4 hours to visit vet!", "Dismiss");
  }
}

// Work: costs 3 hours, earn $15
function work() {
  if (player.time >= 3) {
    player.coins += 15;
    player.time -= 3;
    player.timesWorked++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification("Work completed! +$15", "Success");
  } else {
    showErrorNotification("Need 3 hours to work!", "Dismiss");
  }
}

// Study: costs 2 hours, improves mood and health
function study() {
  if (player.time >= 2) {
    player.health += 5;
    player.mood += 10;
    player.time -= 2;
    player.timesStudied++;
    
    updateActivitySummary(); // Update activity summary in real-time
    updateStats();
    showNotification("Study completed! +5 health, +10 mood", "Success");
  } else {
    showErrorNotification("Need 2 hours to study!", "Dismiss");
  }
}

// Schedule/To-Do: costs 1-2 hours depending on difficulty
// ===== TO-DO LIST =====
const TODO_LIST = [
  "Feed your pet (3+ times today)",
  "Play with your pet (4+ times today)",
  "Clean your pet (once today)",
  "Exercise (2 hours)",
  "Hang out with friends (3 hours)",
  "Read (1 hour)",
  "Visit the vet (once per week)",
  "Get 8+ hours of sleep",
  "Maintain pet health above 80",
  "Maintain pet energy above 80",
  "Keep pet mood positive",
];

let completedTodos = {}; // Track completed tasks for the current day

function openTodoListModal() {
  // Must have created a to-do list first
  if (!player.hasCreatedTodoToday) {
    showErrorNotification("You must create a to-do list first!", "Dismiss");
    return;
  }
  showTodoModal();
}

function createTodoList() {
  // Must buy the to-do feature from shop first
  if (!player.hasScheduleFeature) {
    showErrorNotification(
      "You must buy the To-Do Schedule from the shop first!",
      "Dismiss",
    );
    return;
  }

  // Prevent creating todo list twice in a day
  if (player.hasCreatedTodoToday) {
    showErrorNotification(
      "You can only create a to-do list once per day!",
      "Dismiss",
    );
    return;
  }

  const hoursNeeded = 2; // Costs 1 hour to create

  if (player.time >= hoursNeeded) {
    player.time -= hoursNeeded;
    player.health += 3;
    player.mood += 10;
    player.hasCreatedTodoToday = true;
    player.timesScheduled += 1;
    pet.mood = "Happy";
    showPetReaction("schedule");
    showSaveIndicator(`📝 Created your to-do list! (2h spent)`);
    updateStats();
  } else {
    showErrorNotification(`Need 2 hours to create a to-do list!`, "Dismiss");
  }
}

function scheduleAction() {
  if (!player.hasScheduleFeature) {
    showErrorNotification("Schedule feature not purchased!", "Dismiss");
    return;
  }

  // Prevent using schedule twice in a day
  if (player.hasScheduled) {
    showErrorNotification("You can only schedule once per day!", "Dismiss");
    return;
  }

  const hoursNeeded = 2; // Always 2 hours

  if (player.time >= hoursNeeded) {
    player.time -= hoursNeeded;
    player.health += 5;
    player.mood += 15;
    player.hasScheduled = true;
    player.timesScheduled += 1;
    pet.mood = "Happy";
    showPetReaction("schedule");
    showSaveIndicator(`📅 Scheduled your day! (2h spent)`);
    updateStats();
  } else {
    showErrorNotification(`Need 2 hour(s) to schedule!`, "Dismiss");
  }
}

function showTodoModal() {
  const modal = document.getElementById("todoModal");
  if (!modal) {
    createTodoModal();
  } else {
    document.getElementById("todoModal").style.display = "flex";
    updateTodoList();
  }
}

function createTodoModal() {
  const modal = document.createElement("div");
  modal.id = "todoModal";
  modal.className = "todo-modal";
  modal.innerHTML = `
    <div class="todo-container">
      <div class="todo-header">
        <h2>Today's Tasks</h2>
        <button onclick="closeTodoModal()" class="close-btn">×</button>
      </div>
      <div class="todo-progress" id="todoProgress">
        <div class="progress-text">Progress: <span id="todoProgressText">0/11</span></div>
        <div class="progress-bar">
          <div class="progress-fill" id="todoProgressFill" style="width: 0%"></div>
        </div>
      </div>
      <div class="todo-list" id="todoListContent"></div>
    </div>
  `;
  document.body.appendChild(modal);
  updateTodoList();
}

function updateTodoList() {
  const content = document.getElementById("todoListContent");
  if (!content) return;

  // Calculate progress
  const completedCount = TODO_LIST.filter((_, index) =>
    isTaskCompleted(index),
  ).length;
  const totalCount = TODO_LIST.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Update progress display
  const progressText = document.getElementById("todoProgressText");
  const progressFill = document.getElementById("todoProgressFill");
  if (progressText)
    progressText.textContent = `${completedCount}/${totalCount}`;
  if (progressFill) progressFill.style.width = `${progressPercent}%`;

  content.innerHTML = TODO_LIST.map((task, index) => {
    const isCompleted = isTaskCompleted(index);
    return `
      <div class="todo-item ${isCompleted ? "completed" : ""}">
        <input type="checkbox" ${isCompleted ? "checked" : ""} 
               onchange="toggleTodo(${index})" 
               class="todo-checkbox">
        <span class="todo-text">${task}</span>
      </div>
    `;
  }).join("");
}

function isTaskCompleted(index) {
  // Map tasks to player actions
  const taskMap = {
    0: pet.fedCounter >= 3, // Feed pet (3+ times)
    1: pet.playCounter >= 4, // Play with pet (4+ times)
    2: pet.hasCleaned, // Clean pet (once)
    3: player.hasExercised, // Exercise (2 hours)
    4: player.hasHangout, // Hang out with friends (3 hours)
    5: player.hasRead, // Read (1 hour)
    6: pet.hadVetVisitThisWeek, // Visit the vet (once per week)
    7: player.avgSleepHours >= 8, // Get 8+ hours of sleep
    8: pet.health >= 80, // Maintain pet health above 80
    9: pet.energy >= 80, // Maintain pet energy above 80
    10:
      pet.mood === "Happy" ||
      pet.mood === "Excited" ||
      pet.mood === "Content" ||
      pet.mood === "Rested" ||
      pet.mood === "Healthy", // Keep pet mood positive
  };
  return taskMap[index] || false;
}

function toggleTodo(index) {
  // Prevent unchecking - only allow checking off
  const checkbox = event.target;
  if (!isTaskCompleted(index)) {
    checkbox.checked = false;
  }
  updateTodoList();
}

function closeTodoModal() {
  const modal = document.getElementById("todoModal");
  if (modal) modal.style.display = "none";
}

// End day and trigger sleep cycle with fade animation
function sleep() {
  console.log(`=== SLEEP FUNCTION CALLED ===`);
  console.log(`Current player.time: ${player.time}`);
  console.log(`Current player.health: ${player.health}`);
  console.log(`Current player.mood: ${player.mood}`);
  
  closeTodoModal(); // Ensure to-do modal is closed
  darkOverlay.style.visibility = "visible";
  setTimeout(() => {
    darkOverlay.style.opacity = "1";
  }, 10);

  const restPeriodMs = 3000;
  setTimeout(() => {
    console.log(`Before sleep punishment - player.time: ${player.time}`);
    
    // Apply sleep punishment if hours left is 7 or below (BEFORE processing sleep)
    if (player.time <= 7 && player.time >= 0) {
      const hoursLeft = player.time;
      // The lower the hours, the worse the punishment
      // Scale: 7 hours = light punishment, 0 hours = severe punishment
      const severity = (7 - hoursLeft) / 7; // 0.0 to 1.0 scale
      
      console.log(`Applying sleep punishment - hours left: ${hoursLeft}, severity: ${severity.toFixed(2)}`);
      
      // Player penalties (health and mood)
      const playerHealthLoss = Math.round(10 + (severity * 20)); // 10-30 health loss
      const playerMoodLoss = Math.round(10 + (severity * 20)); // 10-30 mood loss
      player.health -= playerHealthLoss;
      player.mood -= playerMoodLoss;
      
      // Pet penalties (health and energy)
      const petHealthLoss = Math.round(10 + (severity * 25)); // 10-35 health loss
      const petEnergyLoss = Math.round(15 + (severity * 25)); // 15-40 energy loss
      pet.health -= petHealthLoss;
      pet.energy -= petEnergyLoss;
      
      pet.mood = "Tired";
      
      console.log(`Sleep punishment applied:`);
      console.log(`  Player health loss: ${playerHealthLoss}, mood loss: ${playerMoodLoss}`);
      console.log(`  Pet health loss: ${petHealthLoss}, energy loss: ${petEnergyLoss}`);
      console.log(`  Player health: ${player.health}, mood: ${player.mood}`);
      console.log(`  Pet health: ${pet.health}, energy: ${pet.energy}`);
    } else {
      console.log(`No sleep punishment applied - hours left: ${player.time} (condition: <= 7 && >= 0)`);
    }
    
    // Process day evaluation (this modifies health/mood)
    dayTick();
    player.timesSlept += 1;

    // Reset time and give pet rest bonus
    player.time = 24;
    pet.energy += 20;
    pet.mood = "Rested";

    // Clamp stats AFTER all modifications from dayTick
    pet.energy = clamp(pet.energy);
    pet.health = clamp(pet.health);
    player.health = clamp(player.health);
    player.mood = clamp(player.mood);

    updateStats();

    // Auto-save game after each day
    saveGame();

    // Fade back in
    darkOverlay.style.opacity = "0";
    setTimeout(() => {
      darkOverlay.style.visibility = "hidden";
    }, 500);
  }, restPeriodMs);
}

// ===== UI UPDATE FUNCTIONS =====

// Master update function called after every action
function updateStats() {
  // Update pet mood based on energy
  if (pet.energy <= 50) {
    pet.mood = "Bored";
  }
  updatePetStats();
  updatePlayerStats();
  updateProgressBars();

  // Auto-sleep if time runs out (after updating bars)
  if (player.time <= 0) {
    sleep();
    return;
  }

  if (
    pet.energy <= 0 ||
    pet.health <= 0 ||
    player.health <= 0 ||
    player.mood <= 0 ||
    player.coins < 0 ||
    player.currentDay > 30
  ) {
    // Trigger game over after a short delay
    setTimeout(endGameLoss, 100);
  }
}

// Update pet stat displays
function updatePetStats() {
  try {
    const energyTextEl = document.getElementById("energyText");
    if (energyTextEl) energyTextEl.textContent = clamp(pet.energy);

    const healthEl = document.getElementById("health");
    if (healthEl) healthEl.textContent = clamp(pet.health);

    const moodEmojiEl = document.getElementById("petMoodEmoji");
    if (moodEmojiEl) moodEmojiEl.textContent = moodToEmoji(pet.mood);

    // Update mood description
    const moodDescEl = document.getElementById("moodDescription");
    if (moodDescEl) moodDescEl.textContent = getMoodDescription(pet.mood);

    // Update pet expression
    updatePetExpression();
  } catch (error) {
    console.error("Error updating pet stats:", error);
  }
}

// Update player stat displays
function updatePlayerStats() {
  try {
    const coinsEl = document.getElementById("coins");
    if (coinsEl) coinsEl.textContent = player.coins;

    const expensesEl = document.getElementById("expenses");
    if (expensesEl) expensesEl.textContent = player.expenses;

    const timeEl = document.getElementById("time");
    if (timeEl) timeEl.textContent = player.time;

    const playerHealthEl = document.getElementById("playerHealth");
    if (playerHealthEl) playerHealthEl.textContent = clamp(player.health);

    const playerMoodEl = document.getElementById("playerMood");
    if (playerMoodEl) playerMoodEl.textContent = clamp(player.mood);

    const pointsEl = document.getElementById("points");
    if (pointsEl) {
      const maxPossibleScore = (player.currentDay - 1) * 100; // Only count completed days
      const percentage =
        maxPossibleScore > 0
          ? Math.round((player.currentPoints / maxPossibleScore) * 100)
          : 0;
      pointsEl.textContent = `${Math.round(player.currentPoints)}/${maxPossibleScore} (${percentage}%)`;
    }

    // Update shop display if it's open (shows affordability of items)
    const shopSidebar = document.getElementById("shopSidebar");
    if (shopSidebar && shopSidebar.style.display === "block") {
      renderShopItems();
    }

    // Update to-do list if modal is open
    const todoModal = document.getElementById("todoModal");
    if (todoModal && todoModal.style.display === "flex") {
      updateTodoList();
    }
  } catch (error) {
    console.error("Error updating player stats:", error);
  }
}

// Update all progress bar visualizations
function updateProgressBars() {
  console.log("Updating progress bars:", {
    energy: pet.energy,
    health: pet.health,
    time: player.time,
    playerMood: player.mood,
    playerHealth: player.health
  });
  
  try {
    setStatBar("energyBar", clamp(pet.energy));
    setStatBar("healthBar", clamp(pet.health));

    const timePercent = clamp((player.time / 24) * 100);
    setStatBar("timeBar", timePercent);

    setStatBar("playerMoodBar", clamp(player.mood));
    setStatBar("playerHealthBar", clamp(player.health));
  } catch (error) {
    console.error("Error updating progress bars:", error);
  }
}

// Update day number display
function updateDayDisplay() {
  const dayNumEl = document.getElementById("dayNum");
  if (dayNumEl) {
    dayNumEl.textContent = player.currentDay;
  }
}

// ===== UTILITY FUNCTIONS =====

// Clamp value between min and max (default 0-100)
function clamp(v, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

// ===== INPUT VALIDATION UTILITIES =====
// Note: Blocked words are imported from blockedWords.js (see index.html <script> tags)
// This file contains validation logic only; data is in blockedWords.js

const NAME_MAX_LENGTH = 20;
const NAME_MIN_LENGTH = 1;
const NAME_REGEX = /^[A-Za-z0-9 _\-']+$/; // letters, numbers, space, -, _, '

// Normalize input to prevent leetspeak/obfuscation bypass
function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove symbols
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/0/g, "o");
}

// Checks BANNED_WORDS array (from blockedWords.js) and HATE_PATTERNS
function containsBannedWord(name) {
  const normalized = normalizeName(name);

  // Check generic banned words (imported from blockedWords.js)
  if (typeof BANNED_WORDS !== "undefined") {
    const bannedWord = BANNED_WORDS.find((w) => normalized.includes(w));
    if (bannedWord) return bannedWord;
  }

  // Check pattern-based hate words (imported from blockedWords.js)
  if (typeof HATE_PATTERNS !== "undefined") {
    const matchedPattern = HATE_PATTERNS.find((rx) => rx.test(name));
    if (matchedPattern) return name.match(matchedPattern)[0];
  }

  return null;
}

// Validate syntax: length + allowed characters
function isValidNameSyntax(s) {
  if (typeof s !== "string") return false;
  const t = s.trim();
  return (
    t.length >= NAME_MIN_LENGTH &&
    t.length <= NAME_MAX_LENGTH &&
    NAME_REGEX.test(t)
  );
}

// Escape HTML
function escapeForHTML(str) {
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

// Main validator
function validateAndSanitizeName(raw, fieldLabel, defaultVal) {
  const trimmed = (raw || "").trim();

  if (!trimmed) {
    showSaveIndicator(`${fieldLabel} empty — using default (${defaultVal}).`);
    return defaultVal;
  }

  if (!isValidNameSyntax(trimmed)) {
    showErrorNotification(
      `Invalid ${fieldLabel}. Use ${NAME_MIN_LENGTH}-${NAME_MAX_LENGTH} chars: letters, numbers, space, -, _, '`,
      null,
    );
    try {
      const el = document.getElementById(
        fieldLabel.toLowerCase().includes("pet")
          ? "petNameInput"
          : "playerNameInput",
      );
      if (el) el.focus();
    } catch (e) {}
    return null;
  }

  const banned = containsBannedWord(trimmed);
  if (banned) {
    showErrorNotification(
      `${fieldLabel} contains a reserved/blocked word: "${banned}". Please choose a different name.`,
      null,
    );
    try {
      const el = document.getElementById(
        fieldLabel.toLowerCase().includes("pet")
          ? "petNameInput"
          : "playerNameInput",
      );
      if (el) el.focus();
    } catch (e) {}
    return null;
  }

  // Block overly long repeated characters
  if (/(.)\1{6,}/.test(trimmed)) {
    showErrorNotification(
      `${fieldLabel} looks suspicious (repeated characters). Please choose a clearer name.`,
      null,
    );
    return null;
  }

  return trimmed;
}

// Convert mood string to emoji and detailed description
function moodToEmoji(mood) {
  const moodMap = {
    Happy: "😊",
    Content: "😌",
    Excited: "🎉",
    Rested: "😴",
    Hungry: "🍽️",
    Bored: "😐",
    Dirty: "🧹",
    Sick: "🤒",
    Healthy: "💪",
    Tired: "😫",
  };
  return moodMap[mood] ?? "😐";
}

function getMoodDescription(mood) {
  const moodDescriptions = {
    Happy: "Overjoyed!",
    Content: "Very satisfied",
    Excited: "Super pumped!",
    Rested: "Feeling refreshed",
    Hungry: "Needs food...",
    Bored: "Feeling lonely",
    Dirty: "Needs a bath",
    Sick: "Not feeling well",
    Healthy: "Doing great!",
  };
  return moodDescriptions[mood] ?? "Neutral";
}

// Update pet visual with expressions based on mood
function updatePetExpression() {
  const petVisual = document.getElementById("petImage");

  if (!petVisual) return;

  // Clear animation classes
  petVisual.classList.remove(
    "bounce",
    "sad-animation",
    "excited-animation",
    "tired-animation",
    "sick-animation",
  );

  // Apply animations based on mood
  switch (pet.mood) {
    case "Happy":
    case "Content":
    case "Healthy":
      petVisual.classList.add("bounce");
      break;
    case "Excited":
      petVisual.classList.add("excited-animation");
      break;
    case "Rested":
      petVisual.classList.add("tired-animation");
      break;
    case "Hungry":
    case "Sick":
    case "Dirty":
    case "Bored":
      petVisual.classList.add("sad-animation");
      break;
    default:
      break;
  }
}

// Create floating reaction particles (hearts, stars, etc)
function createReaction(emoji) {
  const container = document.getElementById("petReactions");
  if (!container) return;

  const reaction = document.createElement("div");
  reaction.className = "reaction-particle";
  reaction.textContent = emoji;
  reaction.style.left = Math.random() * 80 + 10 + "%";
  container.appendChild(reaction);

  // Remove after animation
  setTimeout(() => reaction.remove(), 1200);
}

// Show pet reactions to actions
function showPetReaction(action) {
  const reactions = {
    feed: ["😋", "🍖", "😊", "🐾"],
    play: ["🎾", "😄", "🎮", "🐕"],
    clean: ["🧼", "✨", "🛁", "🧖"],
    vet: ["🏥", "💊", "🩺", "😷"],
    exercise: ["🏃", "💪", "🤸", "🎯"],
    read: ["📚", "📖", "🤓", "✍️"],
    hangout: ["👫", "🎉", "🗣️", "😎"],
    schedule: ["📝", "📅", "✅", "📋"],
    chore: ["💰", "💸", "🧹", "🪣"],
  };

  const emojis = reactions[action] || ["❤️"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  createReaction(emoji);
  updatePetExpression();
}
// Checks for game over conditions and displays appropriate messages
function endGameLoss() {
  let endMessage = "";
  let gameEnded = false;

  // Determine end condition
  if (pet.health <= 0) {
    endMessage = "Game Over! Your pet's health has reached zero.";
    gameEnded = true;
  } else if (player.health <= 0) {
    endMessage = "Game Over! Your health has reached zero.";
    gameEnded = true;
  } else if (player.mood <= 0) {
    endMessage = "Game Over! Your mood has reached zero.";
    gameEnded = true;
  } else if (pet.energy <= 0) {
    endMessage = "Game Over! Your pet's energy has reached zero.";
    gameEnded = true;
  } else if (player.currentDay > 30) {
    endMessage =
      "Congratulations! You have successfully cared for your pet for 30 days.";
    gameEnded = true;
  } else if (player.coins < 0) {
    endMessage = "Game Over! You have run out of money.";
    gameEnded = true;
  }

  if (!gameEnded) {
    return;
  }

  // Save game stats to localStorage for the end screen
  const gameStats = {
    pet: pet,
    player: player,
    finalDay: player.currentDay,
    endMessage: endMessage,
    dailyStats: dailyStats || [], // Add daily progression data
  };
  localStorage.setItem("gameEndStats", JSON.stringify(gameStats));

  // Clear the active save since game has ended
  localStorage.removeItem("petGameSave");

  // Fade to black
  darkOverlayTwo.style.visibility = "visible";
  setTimeout(() => {
    darkOverlayTwo.style.opacity = "1";
  }, 10);

  // Create message overlay after fade starts
  setTimeout(() => {
    const messageDiv = document.createElement("div");
    messageDiv.id = "endGameMessage";
    messageDiv.style.position = "fixed";
    messageDiv.style.top = "50%";
    messageDiv.style.left = "50%";
    messageDiv.style.transform = "translate(-50%, -50%)";
    messageDiv.style.color = "white";
    messageDiv.style.fontSize = "2rem";
    messageDiv.style.fontWeight = "bold";
    messageDiv.style.textAlign = "center";
    messageDiv.style.zIndex = "10000";
    messageDiv.style.padding = "20px";
    messageDiv.style.maxWidth = "80%";
    messageDiv.style.lineHeight = "1.4";
    messageDiv.textContent = endMessage;
    document.body.appendChild(messageDiv);

    // Hold message for 3 seconds, then fade out and navigate
    setTimeout(() => {
      messageDiv.style.transition = "opacity 1s ease";
      messageDiv.style.opacity = "0";

      setTimeout(() => {
        if (window.apiNavigation && typeof apiNavigation.goToGameEnd === 'function') {
          apiNavigation.goToGameEnd();
        } else {
          window.location.href = "../analytics_page/gameEnd.html";
        }
      }, 1000);
    }, 3000);
  }, 500);
}

// Update progress bar width and color (red to green based on value)
function setStatBar(barId, value) {
  const el = document.getElementById(barId);
  if (!el) {
    console.warn(`Progress bar element not found: ${barId}`);
    return;
  }

  try {
    const percent = clamp(Math.round(value));
    el.style.width = percent + "%";

    // Color transitions from red (0) to green (100)
    const hue = Math.round((percent / 100) * 120);
    el.style.background = `hsl(${hue}, 75%, 45%)`;

    const parent = el.parentElement;
    if (parent) parent.setAttribute("aria-valuenow", percent);
  } catch (error) {
    console.error(`Error setting stat bar ${barId}:`, error);
  }
}

// ===== DEBUG/CREATIVE MODE =====

// Initialize debug mode with keyboard command
window.addEventListener("keydown", function (e) {
  // Press Ctrl+Shift+D to toggle debug menu
  if (e.ctrlKey && e.shiftKey && e.code === "KeyC") {
    toggleDebugMenu();
  }
});

// Toggle debug menu visibility
function toggleDebugMenu() {
  const menu = document.getElementById("debugMenu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
}

// Close debug menu
function closeDebugMenu() {
  const menu = document.getElementById("debugMenu");
  if (menu) {
    menu.style.display = "none";
  }
}

// ===== SHOP SYSTEM =====

function toggleShop() {
  const shopSidebar = document.getElementById("shopSidebar");
  if (
    shopSidebar.style.display === "none" ||
    shopSidebar.style.display === ""
  ) {
    shopSidebar.style.display = "block";
    renderShopItems();
  } else {
    closeShop();
  }
}

function closeShop() {
  const shopSidebar = document.getElementById("shopSidebar");
  if (shopSidebar) {
    shopSidebar.style.display = "none";
  }
}

function renderShopItems() {
  const foodContainer = document.getElementById("foodShop");
  const toyContainer = document.getElementById("toyShop");
  const addonContainer = document.getElementById("addonShop");

  // Clear existing items
  foodContainer.innerHTML = "";
  toyContainer.innerHTML = "";
  addonContainer.innerHTML = "";

  // Render food items
  FOOD_SHOP.forEach((item, index) => {
    const itemEl = createShopItemElement(item, "food", index);
    foodContainer.appendChild(itemEl);
  });

  // Render toy items
  TOY_SHOP.forEach((item, index) => {
    const itemEl = createShopItemElement(item, "toy", index);
    toyContainer.appendChild(itemEl);
  });

  // Render add-on items
  ADDON_SHOP.forEach((item, index) => {
    const itemEl = createShopItemElement(item, "addon", index);
    addonContainer.appendChild(itemEl);
  });

  // Update current upgrades display
  updateUpgradesDisplay();
}

function createShopItemElement(item, type, index) {
  const div = document.createElement("div");
  div.className = "shop-item";

  // Determine if owned/disabled
  let isOwned = false;
  let isDisabled = false;

  if (type === "food") {
    if (index === 0) {
      // Basic food - check if purchased recently
      if (player.daysFoodBought !== -7) {
        isOwned = true;
      }
    } else {
      // Premium foods - check tier ownership
      const tierMap = { premium: 1, deluxe: 2, gourmet: 3 };
      if (tierMap[player.foodTier] >= index) {
        isOwned = true;
      }
    }
  } else if (type === "toy") {
    if (index === 0) {
      // Basic toy - check if purchased recently
      if (player.daysToyBought !== -7) {
        isOwned = true;
      }
    } else {
      // Premium toys - check tier ownership
      const tierMap = { standard: 1, premium: 2, deluxe: 3 };
      if (tierMap[player.toyTier] >= index) {
        isOwned = true;
      }
    }
  } else if (type === "addon" && player.hasScheduleFeature) {
    isOwned = true;
  }

  if (isOwned) {
    div.classList.add("owned");
  }

  // Check if affordable
  if (player.coins < item.cost && !isOwned) {
    div.classList.add("disabled");
    isDisabled = true;
  }

  // Build item HTML
  div.innerHTML = `
    <div class="shop-item-header">
      <h3>${item.name}</h3>
      <span class="shop-item-cost">$${item.cost}</span>
    </div>
    <p class="shop-item-desc">${item.desc}</p>
    ${isOwned ? '<button disabled class="shop-item-btn">✓ Owned</button>' : '<button class="shop-item-btn" onclick="purchaseItem(\'' + type + "'," + index + ')" ' + (isDisabled ? "disabled" : "") + ">Buy</button>"}
  `;

  return div;
}

function purchaseItem(type, index) {
  let item;
  let tierField;
  let tierValues;

  if (type === "food") {
    item = FOOD_SHOP[index];
    tierField = "foodTier";
    tierValues = ["basic", "premium", "deluxe", "gourmet"];
  } else if (type === "toy") {
    item = TOY_SHOP[index];
    tierField = "toyTier";
    tierValues = ["basic", "standard", "premium", "deluxe"];
  } else if (type === "addon") {
    item = ADDON_SHOP[index];
  }

  // Check affordability
  if (player.coins < item.cost) {
    showErrorNotification("Not enough coins!", "Dismiss");
    return;
  }

  // Deduct coins
  player.coins -= item.cost;
  player.totalMoneySpent += item.cost;

  // Apply upgrade
  if (type === "food" || type === "toy") {
    player[tierField] = tierValues[index];
    // Track when food/toy was purchased for 7-day expiration
    if (type === "food") {
      player.daysFoodBought = player.currentDay;
    } else if (type === "toy") {
      player.daysToyBought = player.currentDay;
    }
  } else if (type === "addon") {
    player.hasScheduleFeature = true;
  }

  // Show purchase feedback
  showSaveIndicator("Purchased " + item.name + "! Expires in 7 days.");

  // Update display
  renderShopItems();
  updateStats();

  // Save game
  saveGame();
}

function updateUpgradesDisplay() {
  const foodEl = document.getElementById("currentFood");
  const toyEl = document.getElementById("currentToy");
  const addonsEl = document.getElementById("currentAddons");

  if (foodEl) {
    foodEl.textContent = `Food: ${player.foodTier.charAt(0).toUpperCase() + player.foodTier.slice(1)}`;
  }

  if (toyEl) {
    toyEl.textContent = `Toy: ${player.toyTier.charAt(0).toUpperCase() + player.toyTier.slice(1)}`;
  }

  if (addonsEl) {
    addonsEl.textContent = player.hasScheduleFeature
      ? "Schedule: Unlocked"
      : "Schedule: Locked";
  }
}

// Comprehensive debug object with all commands
const DEBUG = {
  // ===== Error Testing =====
  triggerSaveError: function () {
    console.log("Triggering save error...");
    // Temporarily override localStorage to throw error
    const original = localStorage.setItem;
    localStorage.setItem = function () {
      localStorage.setItem = original;
      throw new Error("QuotaExceededError: Storage limit exceeded");
    };
    saveGame();
  },

  triggerLoadError: function () {
    console.log("Triggering load error...");
    // Save corrupted data
    localStorage.setItem("petGameSave", "{invalid json}");
    showErrorNotification("Corrupted save data detected", "load");
  },

  triggerNoSaveError: function () {
    console.log("Triggering no save found error...");
    localStorage.removeItem("petGameSave");
    showErrorNotification("No saved game found. Starting new game.", null);
  },

  // ===== Game Actions =====
  autoWin: function () {
    console.log("Auto-winning game...");
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    player.currentDay = 31;
    updateDayDisplay();
    updateStats();
    setTimeout(() => endGameLoss(), 500);
  },

  gameLose: function () {
    console.log("Triggering game loss...");
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    pet.health = 0;
    updateStats();
  },

  resetGame: function () {
    console.log("Resetting game state...");
    if (confirm("Reset all game data?")) {
      localStorage.removeItem("petGameSave");
      location.reload();
    }
  },

  // ===== Quick Modifications =====
  maxStats: function () {
    console.log("Maxing all stats...");
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    pet.energy = 100;
    pet.health = 100;
    pet.mood = "Happy";
    player.time = 24;
    player.health = 100;
    player.mood = 100;
    player.coins = 999;
    updateStats();
    console.log("Stats maxed!");
  },

  minStats: function () {
    console.log("Minimizing all stats...");
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    pet.energy = 1;
    pet.health = 1;
    pet.mood = "Sick";
    player.time = 0;
    player.health = 1;
    player.mood = 1;
    player.coins = 0;
    updateStats();
    console.log("✅ Stats minimized!");
  },

  addCoins: function (amount) {
    console.log(`Adding $${amount}...`);
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    player.coins += amount;
    updateStats();
    console.log(`Now have $${player.coins}`);
  },

  nextDay: function () {
    console.log("Skipping to next day...");
    if (!pet.gameStarted) {
      alert("Start game first!");
      return;
    }
    // Skip to next day without processing stat changes
    player.currentDay++;
    player.time = 24; // Reset time for new day
    resetDailyCounters(); // Reset daily activity flags
    updateDayDisplay();
    updateStats();
    saveGame();
    console.log(`✅ Skipped to Day ${player.currentDay}. Stats unchanged.`);
  },

  // ===== Utilities =====
  showStats: function () {
    console.clear();
    console.log(
      "%c=== GAME STATE ===",
      "color: #0f172a; font-weight: bold; font-size: 14px;",
    );
    console.log(
      "%cPET:",
      "color: #3b82f6; font-weight: bold;",
      JSON.stringify(pet, null, 2),
    );
    console.log(
      "%cPLAYER:",
      "color: #3b82f6; font-weight: bold;",
      JSON.stringify(player, null, 2),
    );
    console.log(
      "%c===================",
      "color: #0f172a; font-weight: bold; font-size: 14px;",
    );
  },

  clearAllData: function () {
    console.log("Clearing all saves...");
    if (confirm("Delete all save data?")) {
      localStorage.removeItem("petGameSave");
      localStorage.removeItem("gameEndStats");
      console.log("All data cleared!");
    }
  },

  printCommands: function () {
    console.clear();
    console.log(
      "%cDEBUG MODE - Available Commands",
      "color: #ef4444; font-weight: bold; font-size: 16px;",
    );
    console.log(
      "%cOpen debug menu: Ctrl+Shift+C or call toggleDebugMenu()",
      "color: #10b981;",
    );
    console.log("");
    console.log("%cError Testing:", "color: #3b82f6; font-weight: bold;");
    console.log("  DEBUG.triggerSaveError() - Force save error");
    console.log("  DEBUG.triggerLoadError() - Force load error");
    console.log("  DEBUG.triggerNoSaveError() - Force no save found error");
    console.log("");
    console.log("%cGame Actions:", "color: #3b82f6; font-weight: bold;");
    console.log("  DEBUG.autoWin() - Instantly win");
    console.log("  DEBUG.gameLose() - Trigger loss condition");
    console.log("  DEBUG.resetGame() - Reset everything");
    console.log("");
    console.log("%cQuick Modifications:", "color: #3b82f6; font-weight: bold;");
    console.log("  DEBUG.maxStats() - Max all stats");
    console.log("  DEBUG.minStats() - Min all stats");
    console.log(
      "  DEBUG.addCoins(amount) - Add coins (e.g., DEBUG.addCoins(100))",
    );
    console.log("  DEBUG.nextDay() - Skip to next day");
    console.log("");
    console.log("%cUtilities:", "color: #3b82f6; font-weight: bold;");
    console.log("  DEBUG.showStats() - Show game state in console");
    console.log("  DEBUG.clearAllData() - Delete all saves");
    console.log("  DEBUG.printCommands() - Print this list");
  },
};

// Show debug commands on startup
console.log(
  "%cPet Life Debug Mode Available\nPress Ctrl+Shift+C to open debug menu\nType DEBUG.printCommands() for full list",
  "color: #ef4444; font-weight: bold; background: #fee2e2; padding: 10px; border-radius: 4px;",
);
