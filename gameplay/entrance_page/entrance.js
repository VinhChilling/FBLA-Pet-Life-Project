const PET_IMAGES = {
  Dog: "../../images/dog.png",
  Cat: "../../images/cat.png",
  Dragon: "../../images/dragon.png",
};

const PET_DESCRIPTIONS = {
  Dog: "Dog - Friendly and loyal",
  Cat: "Cat - Independent and curious",
  Dragon: "Dragon - Powerful and majestic",
};

const DIFFICULTY_CONFIG = {
  easy: { info: "Easy: Start with $30", buttonId: "easyBtn" },
  normal: { info: "Normal: Start with $10", buttonId: "normalBtn" },
  hard: { info: "Hard: Start with only $5", buttonId: "hardBtn" },
};

const SETUP_STORAGE_KEY = "petLifeSetup";
let selectedDifficulty = "normal";

function showEntranceError(message) {
  const notification = document.getElementById("errorNotification");
  const errorMessage = document.getElementById("errorMessage");
  if (!notification || !errorMessage) {
    alert(message);
    return;
  }

  errorMessage.textContent = message;
  notification.setAttribute("aria-hidden", "false");
  notification.classList.add("show");
}

function dismissEntranceError() {
  const notification = document.getElementById("errorNotification");
  if (!notification) return;
  notification.classList.remove("show");
  notification.setAttribute("aria-hidden", "true");
}

function normalizeNameForEntrance(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/0/g, "o");
}

function getBlockedWord(name) {
  const normalized = normalizeNameForEntrance(name);
  if (typeof BANNED_WORDS !== "undefined") {
    const blocked = BANNED_WORDS.find((word) => normalized.includes(word));
    if (blocked) return blocked;
  }

  if (typeof HATE_PATTERNS !== "undefined") {
    const pattern = HATE_PATTERNS.find((rx) => rx.test(name));
    if (pattern) return name.match(pattern)[0];
  }

  return null;
}

function validateLocalName(name, label, inputId, hintId) {
  const value = name.trim();
  const input = document.getElementById(inputId);
  const hint = document.getElementById(hintId);
  const baseHint =
    "Name rules: 1-20 chars. Allowed: letters, numbers, space, -, _, '. Reserved words are not allowed.";

  if (!value) {
    if (hint) hint.textContent = `${label} is required.`;
    if (input) input.classList.add("input-invalid");
    return false;
  }

  if (!/^[A-Za-z0-9 _\-']{1,20}$/.test(value)) {
    if (hint) hint.textContent = "Use 1-20 allowed characters.";
    if (input) input.classList.add("input-invalid");
    return false;
  }

  const blocked = getBlockedWord(value);
  if (blocked) {
    if (hint) hint.textContent = `Reserved word detected: "${blocked}".`;
    if (input) input.classList.add("input-invalid");
    return false;
  }

  if (/(.)\1{6,}/.test(value)) {
    if (hint) hint.textContent = "Please avoid long repeated characters.";
    if (input) input.classList.add("input-invalid");
    return false;
  }

  if (hint) hint.textContent = baseHint;
  if (input) input.classList.remove("input-invalid");
  return true;
}

async function validateNameWithBackend(name, type) {
  if (!window.apiValidate || typeof apiValidate.validateName !== "function") {
    return { valid: true };
  }
  return apiValidate.validateName(name, type);
}

function selectDifficulty(level) {
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.normal;
  selectedDifficulty = level;

  document
    .querySelectorAll(".difficulty-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const selectedButton = document.getElementById(config.buttonId);
  if (selectedButton) selectedButton.classList.add("active");

  const info = document.getElementById("difficultyInfo");
  if (info) info.textContent = config.info;
}

function updatePetPreview() {
  const type = document.getElementById("petType").value;
  const preview = document.getElementById("petPreview");
  const previewText = document.getElementById("petPreviewText");

  if (preview) {
    preview.innerHTML = `<img src="${PET_IMAGES[type]}" alt="${type}" class="pet-preview-img">`;
    preview.style.animation = "none";
    setTimeout(() => {
      preview.style.animation = "bounce 0.6s ease";
    }, 10);
  }

  if (previewText) previewText.textContent = PET_DESCRIPTIONS[type] || type;
}

function hasLocalSave() {
  return (
    Boolean(localStorage.getItem("petGameSave")) ||
    Boolean(localStorage.getItem("petGameSave_slot1"))
  );
}

async function handleStartGame() {
  dismissEntranceError();

  const playerName = document.getElementById("playerNameInput").value.trim();
  const petName = document.getElementById("petNameInput").value.trim();
  const petType = document.getElementById("petType").value;

  const playerOk = validateLocalName(
    playerName,
    "Player name",
    "playerNameInput",
    "playerNameRules",
  );
  const petOk = validateLocalName(
    petName,
    "Pet name",
    "petNameInput",
    "petNameRules",
  );

  if (!playerOk || !petOk) {
    showEntranceError("Please fix the highlighted names before starting.");
    return;
  }

  const playerValidation = await validateNameWithBackend(playerName, "player");
  const petValidation = await validateNameWithBackend(petName, "pet");

  if (!playerValidation.valid || !petValidation.valid) {
    showEntranceError(
      playerValidation.error ||
        petValidation.error ||
        "One of the names was rejected by validation.",
    );
    return;
  }

  localStorage.setItem(
    SETUP_STORAGE_KEY,
    JSON.stringify({
      playerName,
      petName,
      petType,
      difficulty: selectedDifficulty,
      createdAt: new Date().toISOString(),
    }),
  );
  localStorage.removeItem("petGameSave");
  localStorage.removeItem("gameEndStats");

  window.location.href = "../game_page/game.html?new=true";
}

function handleLoadGame() {
  dismissEntranceError();

  if (!hasLocalSave() && !(window.apiAuth && apiAuth.isLoggedIn())) {
    showEntranceError("No saved game found yet.");
    return;
  }

  window.location.href = "../game_page/game.html?load=true";
}

function attachLiveValidation(inputId, hintId, label) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", () =>
    validateLocalName(input.value, label, inputId, hintId),
  );
}

window.addEventListener("DOMContentLoaded", () => {
  selectDifficulty("normal");
  updatePetPreview();
  attachLiveValidation("playerNameInput", "playerNameRules", "Player name");
  attachLiveValidation("petNameInput", "petNameRules", "Pet name");

  const dismissBtn = document.getElementById("dismissBtn");
  if (dismissBtn) dismissBtn.addEventListener("click", dismissEntranceError);
});
