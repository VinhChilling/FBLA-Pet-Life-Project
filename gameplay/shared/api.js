/**
 * Pet Life API client.
 * Uses the backend when the app is served over HTTP and falls back to
 * localStorage when opened directly from the filesystem or when offline.
 */

const API_CONFIG = {
  BASE_URL:
    window.location.protocol === "file:"
      ? null
      : `${window.location.origin}/api/v1`,
  TIMEOUT: 10000,
  SYNC_INTERVAL: 30000,
};

let API_STATE = {
  isAuthenticated: Boolean(localStorage.getItem("access_token")),
  accessToken: localStorage.getItem("access_token") || null,
  userId: localStorage.getItem("user_id") || null,
  username: localStorage.getItem("username") || null,
  isOnline: Boolean(API_CONFIG.BASE_URL) && navigator.onLine,
  lastSyncTime: null,
  syncInProgress: false,
};

function canUseBackend() {
  return Boolean(API_CONFIG.BASE_URL) && API_STATE.isOnline;
}

window.addEventListener("online", () => {
  API_STATE.isOnline = Boolean(API_CONFIG.BASE_URL);
  apiSync.syncAll();
});

window.addEventListener("offline", () => {
  API_STATE.isOnline = false;
});

async function apiFetch(endpoint, options = {}) {
  if (!canUseBackend()) {
    throw new Error("Backend is not available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (API_STATE.accessToken) {
    headers.Authorization = `Bearer ${API_STATE.accessToken}`;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401) {
      await apiAuth.logout();
      throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || `API error: ${response.status}`);
    }

    API_STATE.isOnline = true;
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      API_STATE.isOnline = false;
      throw new Error("Request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function localValidateName(name) {
  const value = String(name || "").trim();
  if (!value) return { valid: false, error: "Name cannot be empty" };
  if (!/^[A-Za-z0-9 _\-']{1,20}$/.test(value)) {
    return {
      valid: false,
      error: "Use 1-20 characters: letters, numbers, space, -, _, '.",
    };
  }

  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/0/g, "o");

  if (typeof BANNED_WORDS !== "undefined") {
    const blocked = BANNED_WORDS.find((word) => normalized.includes(word));
    if (blocked) {
      return { valid: false, error: "Name contains reserved content." };
    }
  }

  if (typeof HATE_PATTERNS !== "undefined") {
    const matched = HATE_PATTERNS.find((rx) => rx.test(value));
    if (matched) {
      return { valid: false, error: "Name contains reserved content." };
    }
  }

  return { valid: true, offline: !canUseBackend() };
}

function formatGameStateForBackend(petObj, playerObj, stats = []) {
  return {
    pet: { ...petObj },
    player: { ...playerObj },
    dailyStats: Array.isArray(stats) ? stats : [],
    timestamp: new Date().toISOString(),
  };
}

function formatGameStateForFrontend(backendState) {
  const source = backendState.game_data || backendState;
  return {
    pet: source.pet || {},
    player: source.player || {},
    dailyStats: Array.isArray(source.dailyStats) ? source.dailyStats : [],
    timestamp: backendState.updated_at || source.timestamp,
  };
}

function writeLocalSave(petState, playerState, saveSlot = 1, stats = []) {
  const gameData = {
    pet: petState,
    player: playerState,
    dailyStats: Array.isArray(stats) ? stats : [],
    timestamp: new Date().toISOString(),
    saveSlot,
  };
  localStorage.setItem("petGameSave", JSON.stringify(gameData));
  localStorage.setItem(`petGameSave_slot${saveSlot}`, JSON.stringify(gameData));
  return gameData;
}

function readLocalSave(saveSlot = 1) {
  const slotData = localStorage.getItem(`petGameSave_slot${saveSlot}`);
  const activeData = localStorage.getItem("petGameSave");
  const raw = slotData || activeData;
  return raw ? JSON.parse(raw) : null;
}

const apiAuth = {
  async register(username, email, password) {
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      return this._storeSession(data);
    } catch (error) {
      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
        localOnly: true,
      };
      localStorage.setItem("local_user", JSON.stringify(userData));
      API_STATE.username = userData.username;
      API_STATE.isAuthenticated = true;
      return userData;
    }
  },

  async login(username, password) {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      return this._storeSession(data);
    } catch (error) {
      const userData = {
        username: username.trim(),
        login_time: new Date().toISOString(),
        localOnly: true,
      };
      localStorage.setItem("local_user", JSON.stringify(userData));
      API_STATE.username = userData.username;
      API_STATE.isAuthenticated = true;
      return userData;
    }
  },

  _storeSession(data) {
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      API_STATE.accessToken = data.access_token;
    }
    if (data.user) {
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("user_id", data.user.id);
      API_STATE.username = data.user.username;
      API_STATE.userId = data.user.id;
    }
    API_STATE.isAuthenticated = true;
    return data.user || data;
  },

  async getProfile() {
    try {
      return await apiFetch("/auth/me");
    } catch (error) {
      const localUser = localStorage.getItem("local_user");
      if (localUser) return JSON.parse(localUser);
      throw error;
    }
  },

  async logout() {
    API_STATE.accessToken = null;
    API_STATE.isAuthenticated = false;
    API_STATE.username = null;
    API_STATE.userId = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("local_user");
    apiSync.stopAutoSync();
    return true;
  },

  isLoggedIn() {
    return (
      API_STATE.isAuthenticated ||
      Boolean(localStorage.getItem("access_token")) ||
      Boolean(localStorage.getItem("local_user"))
    );
  },
};

const apiSave = {
  async save(petState, playerState, saveSlot = 1) {
    const stats =
      typeof dailyStats !== "undefined" && Array.isArray(dailyStats)
        ? dailyStats
        : [];
    const localData = writeLocalSave(petState, playerState, saveSlot, stats);

    if (!canUseBackend() || !apiAuth.isLoggedIn()) {
      return { local: true, id: saveSlot };
    }

    try {
      const payload = formatGameStateForBackend(petState, playerState, stats);
      return await apiFetch(`/game/save?save_slot=${saveSlot}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn("Backend save failed; kept local save:", error.message);
      return { local: true, id: saveSlot, game_data: localData };
    }
  },

  async load(saveSlot = 1) {
    if (canUseBackend() && apiAuth.isLoggedIn()) {
      try {
        const backendState = await apiFetch(`/game/save/${saveSlot}`);
        if (backendState) return formatGameStateForFrontend(backendState);
      } catch (error) {
        console.warn("Backend load failed; trying local save:", error.message);
      }
    }

    try {
      return readLocalSave(saveSlot);
    } catch (error) {
      console.warn("Local load failed:", error.message);
      return null;
    }
  },

  async listSaves() {
    if (canUseBackend() && apiAuth.isLoggedIn()) {
      try {
        return await apiFetch("/game/saves");
      } catch (error) {
        console.warn("Backend save list failed:", error.message);
      }
    }

    const saves = [];
    for (let slot = 1; slot <= 3; slot += 1) {
      const raw = localStorage.getItem(`petGameSave_slot${slot}`);
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        saves.push({
          save_slot: slot,
          timestamp: data.timestamp,
          playerName: data.player?.name,
          petName: data.pet?.name,
        });
      } catch (error) {
        console.warn(`Skipping corrupt local save slot ${slot}`);
      }
    }
    return saves;
  },

  async delete(saveSlot = 1) {
    localStorage.removeItem(`petGameSave_slot${saveSlot}`);
    if (saveSlot === 1) localStorage.removeItem("petGameSave");

    if (canUseBackend() && apiAuth.isLoggedIn()) {
      try {
        await apiFetch(`/game/save/${saveSlot}`, { method: "DELETE" });
      } catch (error) {
        console.warn("Backend delete failed:", error.message);
      }
    }
  },
};

const apiValidate = {
  async validateName(name, type = "player") {
    const localResult = localValidateName(name);
    if (!localResult.valid) return localResult;

    if (canUseBackend()) {
      try {
        return await apiFetch("/validate/name", {
          method: "POST",
          body: JSON.stringify({ name, type }),
        });
      } catch (error) {
        return { ...localResult, offline: true };
      }
    }

    return localResult;
  },
};

const apiSync = {
  syncInterval: null,

  async syncAll() {
    if (!canUseBackend() || !apiAuth.isLoggedIn() || API_STATE.syncInProgress) {
      return false;
    }

    const localSave = readLocalSave(1);
    if (!localSave) return false;

    API_STATE.syncInProgress = true;
    try {
      await apiSave.save(localSave.pet, localSave.player, 1);
      API_STATE.lastSyncTime = new Date().toISOString();
      return true;
    } finally {
      API_STATE.syncInProgress = false;
    }
  },

  startAutoSync() {
    this.stopAutoSync();
    this.syncInterval = window.setInterval(
      () => this.syncAll(),
      API_CONFIG.SYNC_INTERVAL,
    );
  },

  stopAutoSync() {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  },
};

const apiUI = {
  showAuthScreen() {
    return true;
  },
  hideAuthScreen() {
    return true;
  },
  closeAuthModal() {
    return true;
  },
  async handleLogin() {
    return true;
  },
  async handleRegister() {
    return true;
  },
  handleGuestMode() {
    return true;
  },
  switchAuthTab() {
    return true;
  },
};

const apiNavigation = {
  routes: {
    start: "../start_page/start.html",
    entrance: "../entrance_page/entrance.html",
    game: "../game_page/game.html",
    gameLoad: "../game_page/game.html?load=true",
    help: "../help_page/help.html",
    analytics: "../analytics_page/gameEnd.html",
  },

  resolvePage(pageUrl) {
    const legacyRoutes = {
      "index.html": this.routes.gameLoad,
      "help.html": this.routes.help,
      "gameEnd.html": this.routes.analytics,
      "start.html": this.routes.entrance,
      "game.html": this.routes.game,
    };
    return legacyRoutes[pageUrl] || pageUrl;
  },

  navigateToPage(pageUrl, saveBeforeNavigate = true) {
    if (saveBeforeNavigate && typeof saveGame === "function") {
      saveGame();
    }
    window.location.href = this.resolvePage(pageUrl);
  },

  goToStart() {
    this.navigateToPage(this.routes.start, false);
  },

  goToEntrance() {
    this.navigateToPage(this.routes.entrance, false);
  },

  goToHelp() {
    this.navigateToPage(this.routes.help, true);
  },

  goToGameEnd() {
    this.navigateToPage(this.routes.analytics, true);
  },

  goToMainGame() {
    this.navigateToPage(this.routes.gameLoad, false);
  },
};

async function initializeAPI() {
  if (!canUseBackend()) return;
  try {
    await apiFetch("/health");
    apiSync.startAutoSync();
  } catch (error) {
    API_STATE.isOnline = false;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAPI);
} else {
  initializeAPI();
}

window.apiAuth = apiAuth;
window.apiSave = apiSave;
window.apiValidate = apiValidate;
window.apiSync = apiSync;
window.apiUI = apiUI;
window.apiNavigation = apiNavigation;
window.API_STATE = API_STATE;
