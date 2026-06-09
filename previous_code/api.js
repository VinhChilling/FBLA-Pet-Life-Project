/**
 * ============================================================
 * Virtual Pet Game - Local Storage Only
 * Works entirely with local storage (no backend)
 * ============================================================
 * Handles:
 * - Local game state management
 * - Name validation (frontend only)
 * - Save/load functionality
 */

// ===== Configuration =====
const API_CONFIG = {
  BASE_URL: null, // No backend
  TIMEOUT: 10000,
  SYNC_INTERVAL: 30000, // Auto-sync every 30 seconds (local only)
};


// ===== State Management =====

let API_STATE = {

  isAuthenticated: false,

  accessToken: localStorage.getItem('access_token') || null,

  userId: localStorage.getItem('user_id') || null,

  username: localStorage.getItem('username') || null,

  isOnline: navigator.onLine,

  lastSyncTime: null,

  syncInProgress: false,

};



// Track online/offline status

window.addEventListener('online', () => {

  API_STATE.isOnline = true;

  console.log('🟢 Backend connection restored');

  apiSync.syncAll();

});



window.addEventListener('offline', () => {

  API_STATE.isOnline = false;

  console.log('🔴 Backend connection lost - using local storage');

});



// ===== API UTILITY FUNCTIONS =====



/**

 * Make HTTP request with error handling

 */

async function apiFetch(endpoint, options = {}) {

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const headers = {

    'Content-Type': 'application/json',

    ...options.headers,

  };



  if (API_STATE.accessToken) {

    headers['Authorization'] = `Bearer ${API_STATE.accessToken}`;

  }



  try {

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);



    const response = await fetch(url, {

      ...options,

      headers,

      signal: controller.signal,

    });



    clearTimeout(timeoutId);



    if (response.status === 401) {

      // Token expired or invalid

      apiAuth.logout();

      throw new Error('Session expired. Please login again.');

    }



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.detail || `API Error: ${response.statusText}`);

    }



    return await response.json();

  } catch (error) {

    if (error.name === 'AbortError') {

      throw new Error('Request timeout - backend may be offline');

    }

    throw error;

  }

}



/**

 * Convert frontend game state to backend schema

 */

function formatGameStateForBackend(petObj, playerObj) {

  return {

    pet: {

      name: petObj.name,

      type: petObj.type,

      mood: petObj.mood || 'Happy',

      energy: petObj.energy || 75,

      health: petObj.health || 90,

      fedCounter: petObj.fedCounter || 0,

      playCounter: petObj.playCounter || 0,

      hasCleaned: petObj.hasCleaned || false,

      hadVetVisitThisWeek: petObj.hadVetVisitThisWeek || false,

      timesFed: petObj.timesFed || 0,

      timesPlayed: petObj.timesPlayed || 0,

      timesCleaned: petObj.timesCleaned || 0,

      timesVisitedVet: petObj.timesVisitedVet || 0,

      timesDoingChores: petObj.timesDoingChores || 0,

    },

    player: {

      name: playerObj.name,

      currentDay: playerObj.currentDay || 1,

      time: playerObj.time || 24,

      coins: playerObj.coins || 10,

      expenses: playerObj.expenses || 0,

      health: playerObj.health || 90,

      mood: playerObj.mood || 75,

      difficulty: playerObj.difficulty || 'normal',

      currentPoints: playerObj.currentPoints || 0,

      potentialPoints: playerObj.potentialPoints || 100,

    },

    timestamp: new Date().toISOString(),

  };

}



/**

 * Convert backend game state to frontend format

 */

function formatGameStateForFrontend(backendState) {

  const backendPet = backendState.game_data?.pet || backendState.pet;

  const backendPlayer = backendState.game_data?.player || backendState.player;



  return {

    pet: {

      gameStarted: true,

      name: backendPet?.name || 'Fluffy',

      type: backendPet?.type || 'Dog',

      mood: backendPet?.mood || 'Happy',

      energy: backendPet?.energy ?? 75,

      health: backendPet?.health ?? 90,

      fedCounter: backendPet?.fedCounter || 0,

      playCounter: backendPet?.playCounter || 0,

      hasCleaned: backendPet?.hasCleaned || false,

      hadVetVisitThisWeek: backendPet?.hadVetVisitThisWeek || false,

      timesFed: backendPet?.timesFed || 0,

      timesPlayed: backendPet?.timesPlayed || 0,

      timesCleaned: backendPet?.timesCleaned || 0,

      timesVisitedVet: backendPet?.timesVisitedVet || 0,

      timesDoingChores: backendPet?.timesDoingChores || 0,

    },

    player: {

      name: backendPlayer?.name || 'Player',

      currentDay: backendPlayer?.currentDay || 1,

      time: backendPlayer?.time || 24,

      coins: backendPlayer?.coins || 10,

      expenses: backendPlayer?.expenses || 0,

      health: backendPlayer?.health ?? 90,

      mood: backendPlayer?.mood ?? 75,

      difficulty: backendPlayer?.difficulty || 'normal',

      potentialPoints: 100,

      currentPoints: backendPlayer?.currentPoints || 0,

      pointsReduction: 0,

      avgSleepHours: backendPlayer?.avgSleepHours || 0,

      totalSleepHours: backendPlayer?.totalSleepHours || 0,

      lastSleepHours: backendPlayer?.lastSleepHours || 0,

      hasHangout: false,

      hasExercised: false,

      hasRead: false,

      hasCreatedTodoToday: false,

      timesHangout: backendPlayer?.timesHangout || 0,

      timesExercised: backendPlayer?.timesExercised || 0,

      timesRead: backendPlayer?.timesRead || 0,

      timesScheduled: backendPlayer?.timesScheduled || 0,

      foodTier: 'basic',

      toyTier: 'basic',

      hasScheduleFeature: false,

      totalMoneySpent: 0,

      daysFoodBought: -7,

      daysToyBought: -7,

    },

  };

}



// ===== AUTHENTICATION (Local Only) =====

const apiAuth = {

  /**

   * Register new user (local only)

   */

  async register(username, email, password) {

    try {

      // Client-side validation

      if (!username || !email || !password) {

        throw new Error('All fields are required');

      }

      

      if (username.length < 3) {

        throw new Error('Username must be at least 3 characters');

      }

      

      if (password.length < 8) {

        throw new Error('Password must be at least 8 characters');

      }

      

      if (!email.includes('@') || !email.includes('.')) {

        throw new Error('Please enter a valid email address');

      }

      

      // Store locally (no backend)

      const userData = {

        username: username.trim(),

        email: email.trim().toLowerCase(),

        created_at: new Date().toISOString(),

        is_active: true

      };

      

      localStorage.setItem('local_user', JSON.stringify(userData));

      API_STATE.username = username.trim();

      API_STATE.isAuthenticated = true;

      

      console.log('✅ Registration successful (local)');

      return userData;

    } catch (error) {

      console.error('❌ Registration failed:', error.message);

      throw error;

    }

  },

  /**

   * Login user (local only)

   */

  async login(username, password) {

    try {

      // Client-side validation

      if (!username || !password) {

        throw new Error('Username and password are required');

      }

      

      if (username.length < 3) {

        throw new Error('Username must be at least 3 characters');

      }

      

      // For local mode, just accept any password

      const userData = {

        username: username.trim(),

        login_time: new Date().toISOString()

      };

      

      localStorage.setItem('local_user', JSON.stringify(userData));

      API_STATE.username = username.trim();

      API_STATE.isAuthenticated = true;

      

      console.log('✅ Login successful (local)');

      return userData;

    } catch (error) {

      console.error('❌ Login failed:', error.message);

      throw error;

    }

  },

  /**

   * Get current user profile (local only)

   */

  async getProfile() {

    try {

      const userData = localStorage.getItem('local_user');

      if (userData) {

        const user = JSON.parse(userData);

        console.log('✅ Profile loaded (local)');

        return user;

      }

      throw new Error('No user found');

    } catch (error) {

      console.error('❌ Profile fetch failed:', error.message);

      throw error;

    }

  },

  /**

   * Logout user (local only)

   */

  async logout() {

    try {

      // Clear local state

      API_STATE.accessToken = null;

      API_STATE.isAuthenticated = false;

      API_STATE.username = null;

      

      // Clear storage

      localStorage.removeItem('access_token');

      localStorage.removeItem('username');

      localStorage.removeItem('local_user');

      

      // Stop auto-sync

      if (apiSync && typeof apiSync.stopAutoSync === 'function') {

        apiSync.stopAutoSync();

      }

      

      console.log('✅ Logged out successfully (local)');

      return true;

    } catch (error) {

      console.error('❌ Logout failed:', error.message);

      throw error;

    }

  },

  /**

   * Check if user is authenticated

   */

  isLoggedIn() {

    return API_STATE.isAuthenticated || localStorage.getItem('local_user') !== null;

  },

};



// ===== GAME SAVE API (Local Only) =====

const apiSave = {

  /**

   * Save game state to local storage

   */

  async save(petState, playerState, saveSlot = 1) {

    try {

      // Always save locally

      const gameData = {

        pet: petState,

        player: playerState,

        timestamp: new Date().toISOString(),

        saveSlot: saveSlot

      };

      

      localStorage.setItem(`petGameSave_slot${saveSlot}`, JSON.stringify(gameData));

      console.log('✅ Game saved locally');

      return { local: true, id: saveSlot };

    } catch (error) {

      console.error('❌ Local save failed:', error.message);

      throw error;

    }

  },

  /**

   * Load game state from local storage

   */

  async load(saveSlot = 1) {

    try {

      const savedData = localStorage.getItem(`petGameSave_slot${saveSlot}`);

      if (savedData) {

        const gameData = JSON.parse(savedData);

        console.log('✅ Game loaded from local storage');

        return gameData;

      }

      return null;

    } catch (error) {

      console.error('❌ Local load failed:', error.message);

      return null;

    }

  },

  /**

   * List all local saves

   */

  async listSaves() {

    try {

      const saves = [];

      for (let i = 1; i <= 3; i++) {

        const savedData = localStorage.getItem(`petGameSave_slot${i}`);

        if (savedData) {

          const gameData = JSON.parse(savedData);

          saves.push({

            slot: i,

            timestamp: gameData.timestamp,

            playerName: gameData.player.name,

            petName: gameData.pet.name

          });

        }

      }

      console.log('✅ Local saves listed:', saves);

      return saves;

    } catch (error) {

      console.error('❌ Failed to list local saves:', error.message);

      return [];

    }

  },

  /**

   * Delete a local save

   */

  async delete(saveSlot) {

    try {

      localStorage.removeItem(`petGameSave_slot${saveSlot}`);

      console.log('✅ Local save deleted');

    } catch (error) {

      console.error('❌ Failed to delete local save:', error.message);

    }

  },

};





// ===== VALIDATION API (Frontend Only) =====

const apiValidate = {

  /**

   * Validate name using frontend validation only

   */

  async validateName(name, type = 'player') {

    try {

      // Always use frontend validation (no backend)

      console.log('ℹ️ Using frontend validation only');

      // Basic validation

      if (!name || name.trim().length === 0) {

        return { valid: false, error: 'Name cannot be empty' };

      }

      if (name.length > 50) {

        return { valid: false, error: 'Name is too long (max 50 characters)' };

      }

      if (!/^[A-Za-z0-9 _\-']+$/.test(name)) {

        return { valid: false, error: 'Name contains invalid characters' };

      }

      // Check for blocked words (using blockedWords.js if available)

      if (typeof blockedWords !== 'undefined' && blockedWords.isBlocked) {

        if (blockedWords.isBlocked(name)) {

          return { valid: false, error: 'Name contains inappropriate content' };

        }

      }

      return { valid: true, offline: true };

    } catch (error) {

      console.error('❌ Validation error:', error.message);

      return { valid: true, offline: true, error: error.message };

    }

  },

};





// ===== SYNC & OFFLINE HANDLING (Local Only) =====

const apiSync = {

  /**

   * Sync all pending changes (local only)

   */

  async syncAll() {

    // No sync needed in local mode

    console.log('ℹ️ Local mode - no sync needed');

    return true;

  },

  /**

   * Start periodic sync (disabled in local mode)

   */

  startAutoSync() {

    console.log('ℹ️ Local mode - auto-sync disabled');

    return;

  },

  /**

   * Stop periodic sync (disabled in local mode)

   */

  stopAutoSync() {

    console.log('ℹ️ Local mode - auto-sync disabled');

    return;

  },

  syncInterval: null,

};

const apiUI = {

  /**
   * Show simple guest mode message
   */
  showAuthScreen() {
    // No authentication needed - just start the game
    console.log('🎮 Starting game in local mode');
    return true;
  },

  /**
   * Hide auth screen (not needed in local mode)
   */
  hideAuthScreen() {
    // Nothing to hide
    return true;
  },

  /**
   * Close auth modal (not needed in local mode)
   */
  closeAuthModal() {
    // Nothing to close
    return true;
  },

  /**
   * Handle login (not needed in local mode)
   */
  async handleLogin() {
    // Just start the game
    console.log('🎮 Starting game in local mode');
    return true;
  },

  /**
   * Handle register (not needed in local mode)
   */
  async handleRegister() {
    // Just start the game
    console.log('🎮 Starting game in local mode');
    return true;
  },

  /**
   * Handle guest mode (default mode)
   */
  handleGuestMode() {
    console.log('🎮 Starting game in local mode');
    return true;
  },

  /**
   * Switch auth tab (not needed in local mode)
   */
  switchAuthTab(tab) {
    // No tabs to switch
    return true;
  },
};



// ===== INITIALIZATION =====

/**

 * Initialize API on startup (local mode only)

 */

function initializeAPI() {

  console.log('🚀 Initializing Local Storage API Client');

  // Set local mode state

  API_STATE.isOnline = false; // No backend

  API_STATE.isAuthenticated = false; // No auth needed

  console.log('✅ Local mode initialized - no backend required');

  console.log('🎮 Ready to play with local storage only');

}

// Auto-initialize on page load

if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', initializeAPI);

} else {

  initializeAPI();

}



// ===== NAVIGATION HELPERS =====



const apiNavigation = {

  /**

   * Navigate to a different page while preserving game state

   */

  navigateToPage(pageUrl, saveBeforeNavigate = true) {

    // Save game state before navigating if requested

    if (saveBeforeNavigate && typeof saveGame === 'function') {

      saveGame();

    }

    

    // Navigate to the new page

    window.location.href = pageUrl;

  },



  /**

   * Navigate to help page

   */

  goToHelp() {

    this.navigateToPage('help.html', true);

  },



  /**

   * Navigate to game end page

   */

  goToGameEnd() {

    this.navigateToPage('gameEnd.html', true);

  },



  /**

   * Navigate back to main game

   */

  goToMainGame() {

    this.navigateToPage('index.html', false);

  }

};



// Export for use in other scripts

window.apiAuth = apiAuth;

window.apiSave = apiSave;

window.apiValidate = apiValidate;

window.apiSync = apiSync;

window.apiUI = apiUI;

window.apiNavigation = apiNavigation;

window.API_STATE = API_STATE;

