/**
 * ============================================================
 * Virtual Pet Game - Integration Test Suite
 * Tests frontend-backend compatibility
 * ============================================================
 * Run these tests in browser console after starting backend
 */

const INTEGRATION_TESTS = {
  config: {
    baseUrl: 'http://localhost:8000/api/v1',
    testUser: {
      username: 'testplayer_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'TestPassword123!',
    },
    testGameState: {
      pet: {
        name: 'TestPet',
        type: 'Dog',
        mood: 'Happy',
        energy: 75,
        health: 90,
        fedCounter: 0,
        playCounter: 0,
        hasCleaned: false,
        hadVetVisitThisWeek: false,
      },
      player: {
        name: 'TestPlayer',
        currentDay: 1,
        time: 24,
        coins: 10,
        expenses: 0,
        health: 90,
        mood: 75,
        difficulty: 'normal',
        currentPoints: 0,
        potentialPoints: 100,
      },
    },
  },

  results: [],

  /**
   * Run all tests
   */
  async runAll() {
    console.clear();
    console.log(
      '%c🧪 Virtual Pet Game - Integration Test Suite',
      'font-size: 16px; font-weight: bold; color: #2563eb'
    );
    console.log('Running integration tests...\n');

    this.results = [];

    // Connection tests
    await this.testHealthEndpoint();
    await this.testCorsHeaders();

    // Authentication tests
    await this.testRegister();
    await this.testLogin();
    await this.testGetProfile();

    // Game save tests
    await this.testSaveGame();
    await this.testLoadGame();
    await this.testListSaves();

    // Validation tests
    await this.testValidateName();

    // Display summary
    this.displaySummary();
  },

  /**
   * Test 1: Health endpoint
   */
  async testHealthEndpoint() {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      if (response.ok) {
        this.logPass('✅ Health Endpoint', 'Backend is responding');
      } else {
        this.logFail(
          '❌ Health Endpoint',
          `HTTP ${response.status}`
        );
      }
    } catch (error) {
      this.logFail('❌ Health Endpoint', error.message);
    }
  },

  /**
   * Test 2: CORS headers
   */
  async testCorsHeaders() {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader) {
        this.logPass(
          '✅ CORS Headers',
          `Allow-Origin: ${corsHeader}`
        );
      } else {
        this.logFail('❌ CORS Headers', 'Missing Access-Control-Allow-Origin');
      }
    } catch (error) {
      this.logFail('❌ CORS Headers', error.message);
    }
  },

  /**
   * Test 3: Register new user
   */
  async testRegister() {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.config.testUser.username,
          email: this.config.testUser.email,
          password: this.config.testUser.password,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        this.logPass('✅ User Registration', `User ID: ${data.id}`);
        return true;
      } else {
        const error = await response.json();
        this.logFail('❌ User Registration', error.detail || response.statusText);
        return false;
      }
    } catch (error) {
      this.logFail('❌ User Registration', error.message);
      return false;
    }
  },

  /**
   * Test 4: Login
   */
  async testLogin() {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.config.testUser.username,
          password: this.config.testUser.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.logPass('✅ User Login', `Token received (${data.token_type})`);
        return true;
      } else {
        const error = await response.json();
        this.logFail('❌ User Login', error.detail || response.statusText);
        return false;
      }
    } catch (error) {
      this.logFail('❌ User Login', error.message);
      return false;
    }
  },

  /**
   * Test 5: Get user profile
   */
  async testGetProfile() {
    if (!this.accessToken) {
      this.logSkip('⊘ Get Profile', 'No authentication token');
      return;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        this.logPass(
          '✅ Get Profile',
          `Username: ${data.username}`
        );
      } else {
        this.logFail('❌ Get Profile', response.statusText);
      }
    } catch (error) {
      this.logFail('❌ Get Profile', error.message);
    }
  },

  /**
   * Test 6: Save game
   */
  async testSaveGame() {
    if (!this.accessToken) {
      this.logSkip('⊘ Save Game', 'No authentication token');
      return;
    }

    try {
      const payload = {
        pet: this.config.testGameState.pet,
        player: this.config.testGameState.player,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${this.config.baseUrl}/game/save?save_slot=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveId = data.id;
        this.logPass(
          '✅ Save Game',
          `Save ID: ${data.id}, Day: ${data.day_reached}`
        );
      } else {
        const error = await response.json();
        this.logFail('❌ Save Game', error.detail || response.statusText);
      }
    } catch (error) {
      this.logFail('❌ Save Game', error.message);
    }
  },

  /**
   * Test 7: Load game
   */
  async testLoadGame() {
    if (!this.accessToken) {
      this.logSkip('⊘ Load Game', 'No authentication token');
      return;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/game/save/1`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const petName = data.game_data?.pet?.name || 'N/A';
        this.logPass(
          '✅ Load Game',
          `Pet: ${petName}, Slot: ${data.save_slot}`
        );
      } else if (response.status === 404) {
        this.logFail('❌ Load Game', 'Save not found (404)');
      } else {
        this.logFail('❌ Load Game', response.statusText);
      }
    } catch (error) {
      this.logFail('❌ Load Game', error.message);
    }
  },

  /**
   * Test 8: List saves
   */
  async testListSaves() {
    if (!this.accessToken) {
      this.logSkip('⊘ List Saves', 'No authentication token');
      return;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/game/saves`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        this.logPass(
          '✅ List Saves',
          `${data.length} save(s) found`
        );
      } else {
        this.logFail('❌ List Saves', response.statusText);
      }
    } catch (error) {
      this.logFail('❌ List Saves', error.message);
    }
  },

  /**
   * Test 9: Validate name
   */
  async testValidateName() {
    if (!this.accessToken) {
      this.logSkip('⊘ Validate Name', 'No authentication token');
      return;
    }

    try {
      // Test valid name
      const validResponse = await fetch(`${this.config.baseUrl}/validate/name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ name: 'ValidName123', type: 'player' }),
      });

      if (validResponse.ok) {
        const validData = await validResponse.json();
        if (validData.valid) {
          this.logPass('✅ Validate Name (Valid)', 'Accepted: ValidName123');
        } else {
          this.logFail('❌ Validate Name (Valid)', 'Should have been accepted');
        }
      }

      // Test banned word
      const bannedResponse = await fetch(`${this.config.baseUrl}/validate/name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ name: 'fuck123', type: 'player' }),
      });

      if (bannedResponse.ok) {
        const bannedData = await bannedResponse.json();
        if (!bannedData.valid) {
          this.logPass('✅ Validate Name (Banned)', `Rejected (${bannedData.error})`);
        } else {
          this.logFail('❌ Validate Name (Banned)', 'Should have been rejected');
        }
      }
    } catch (error) {
      this.logFail('❌ Validate Name', error.message);
    }
  },

  /**
   * Log test pass
   */
  logPass(testName, details) {
    console.log(`${testName}`);
    console.log(`  → ${details}\n`);
    this.results.push({ test: testName, status: 'PASS', details });
  },

  /**
   * Log test fail
   */
  logFail(testName, details) {
    console.error(`${testName}`);
    console.error(`  → Error: ${details}\n`);
    this.results.push({ test: testName, status: 'FAIL', details });
  },

  /**
   * Log test skip
   */
  logSkip(testName, details) {
    console.warn(`${testName}`);
    console.warn(`  → ${details}\n`);
    this.results.push({ test: testName, status: 'SKIP', details });
  },

  /**
   * Display test summary
   */
  displaySummary() {
    console.log(
      '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'color: #64748b'
    );
    console.log('%c📊 Test Summary', 'font-size: 14px; font-weight: bold; color: #0f172a');
    console.log(
      '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'color: #64748b'
    );

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const skipped = this.results.filter((r) => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`\n  Total:   ${total} tests`);
    console.log(`  %c✅ Passed:  ${passed}`, 'color: #10b981; font-weight: bold');
    console.log(`  %c❌ Failed:  ${failed}`, 'color: #ef4444; font-weight: bold');
    console.log(`  %c⊘ Skipped: ${skipped}`, 'color: #f59e0b; font-weight: bold');

    if (failed === 0) {
      console.log('\n%c🎉 All tests passed!', 'font-size: 14px; color: #10b981; font-weight: bold');
    } else {
      console.log(
        `\n%c⚠️ ${failed} test(s) failed. Check backend logs for details.`,
        'font-size: 14px; color: #ef4444; font-weight: bold'
      );
    }

    console.log('\n');
  },
};

// ===== UI HELPERS =====

/**
 * Run tests from browser console
 */
function runIntegrationTests() {
  INTEGRATION_TESTS.runAll();
}

/**
 * Test frontend API client
 */
async function testFrontendAPI() {
  console.log('%c🧪 Testing Frontend API Client', 'font-size: 14px; font-weight: bold; color: #2563eb');

  // Check if API is loaded
  if (typeof apiAuth === 'undefined') {
    console.error('❌ api.js not loaded! Make sure it\'s included in index.html');
    return;
  }

  console.log('✅ api.js loaded');
  console.log(`ℹ️ API Config:`, API_CONFIG);
  console.log(`ℹ️ API State:`, API_STATE);

  // Test API availability
  try {
    const response = await apiFetch('/health');
    console.log('✅ Backend health check passed:', response);
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
  }
}

/**
 * Test data structure compatibility
 */
function testDataStructure() {
  console.log('%c🧪 Testing Data Structure Compatibility', 'font-size: 14px; font-weight: bold; color: #2563eb');

  if (typeof pet === 'undefined' || typeof player === 'undefined') {
    console.error('❌ Game objects not initialized. Start a new game first.');
    return;
  }

  console.log('Current Pet Object:', pet);
  console.log('Current Player Object:', player);

  // Check required fields
  const requiredPetFields = [
    'name', 'type', 'mood', 'energy', 'health',
    'fedCounter', 'playCounter', 'hasCleaned'
  ];
  const requiredPlayerFields = [
    'name', 'currentDay', 'coins', 'health', 'mood', 'difficulty'
  ];

  const petFieldsOk = requiredPetFields.every(field => field in pet);
  const playerFieldsOk = requiredPlayerFields.every(field => field in player);

  if (petFieldsOk) {
    console.log('✅ Pet object has all required fields');
  } else {
    console.error('❌ Pet object missing required fields');
  }

  if (playerFieldsOk) {
    console.log('✅ Player object has all required fields');
  } else {
    console.error('❌ Player object missing required fields');
  }
}

/**
 * Test localStorage integration
 */
function testLocalStorage() {
  console.log('%c🧪 Testing localStorage Integration', 'font-size: 14px; font-weight: bold; color: #2563eb');

  const saved = localStorage.getItem('petGameSave');
  if (saved) {
    const data = JSON.parse(saved);
    console.log('✅ localStorage has save data:', data);
  } else {
    console.warn('⊘ No save data in localStorage');
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    console.log('✅ localStorage has auth token (length:', token.length, ')');
  } else {
    console.warn('⊘ No auth token in localStorage');
  }
}

// ===== Quick Commands =====

console.log(`
%c🐶 Virtual Pet Game - Integration Test Suite Ready
%c
Available Commands:
  runIntegrationTests()     - Run complete integration test suite
  testFrontendAPI()         - Test api.js client
  testDataStructure()       - Check game object compatibility
  testLocalStorage()        - Check localStorage integration
  
Usage:
  1. Start backend: cd backend && py main.py
  2. Open game in browser
  3. Paste command above into browser console
  
Example:
  > runIntegrationTests()
`, 'font-size: 14px; font-weight: bold; color: #2563eb', 'color: #64748b');
