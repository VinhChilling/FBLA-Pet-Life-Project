const SETUP_STORAGE_KEY = "petLifeSetup";

function setSetupField(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value;
}

function readSetupPayload() {
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Invalid setup payload:", error);
    localStorage.removeItem(SETUP_STORAGE_KEY);
    return null;
  }
}

function goToEntrance() {
  window.location.href = "../entrance_page/entrance.html";
}

async function bootGamePage() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("load") === "true") {
    await loadGame();
    return;
  }

  const setup = readSetupPayload();
  if (setup) {
    setSetupField("playerNameInput", setup.playerName || "Player");
    setSetupField("petNameInput", setup.petName || "Fluffy");
    setSetupField("petType", setup.petType || "Dog");

    if (typeof selectDifficulty === "function") {
      selectDifficulty(setup.difficulty || "normal");
    }

    localStorage.removeItem(SETUP_STORAGE_KEY);
    startGameInternal();
    return;
  }

  if (localStorage.getItem("petGameSave")) {
    await loadGame();
    return;
  }

  goToEntrance();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootGamePage);
} else {
  bootGamePage();
}
