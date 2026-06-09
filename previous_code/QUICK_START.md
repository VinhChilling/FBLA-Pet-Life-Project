# Quick Start - Full Stack Integration

Get your Virtual Pet Game running with cloud saves and authentication.

## 📋 Prerequisites

- **Node.js** or a simple HTTP server (for frontend)
- **Python 3.10+** (for backend)
- **pip** or similar for Python package management
- A modern web browser

## 🚀 Setup Instructions

### Step 1: Start the Backend

#### Option A: Quick Start (Windows)

```bash
cd backend
.\setup.bat
py main.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

#### Option B: Quick Start (Mac/Linux)

```bash
cd backend
chmod +x setup.sh
./setup.sh
py main.py
```

#### Option C: Manual Setup

```bash
cd backend

# Create virtual environment
py -3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
py -3 -m pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run server
py main.py
```

**Verify Backend is Running:**
Open http://localhost:8000/docs in your browser. You should see the interactive API documentation (Swagger UI).

### Step 2: Serve Frontend Locally

#### Option A: Python Built-in Server

```bash
# In the root directory (not backend/)
py -m http.server 3000
```

Then open http://localhost:3000

#### Option B: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Browser opens automatically

#### Option C: Node.js http-server

```bash
npm install -g http-server
http-server . -p 3000
```

Then open http://localhost:3000

### Step 3: Verify Integration

Open browser to http://localhost:3000 (or whatever port your HTTP server uses)

**Expected Flow:**

1. ✅ Page loads
2. ✅ Setup screen shows "Load Game" button (if save exists)
3. ✅ Enter player name, pet name, select pet type, select difficulty
4. ✅ Click "Start Game"
5. ✅ Game loads with your pet
6. ✅ Click any action (Feed, Play, etc.)
7. ✅ Save indicator shows "💾 Saved!" 

## 🧪 Testing Integration

### Test 1: Verify API Connection

<details>
<summary><b>Click to expand</b></summary>

1. Open browser developer console (F12)
2. Paste this command:

```javascript
// Include the test suite file first
const script = document.createElement('script');
script.src = './INTEGRATION_TEST_SUITE.js';
document.head.appendChild(script);

// Then wait a second and run tests
setTimeout(() => {
  runIntegrationTests();
}, 1000);
```

3. Watch the console for test results

**Expected Output:**
```
🧪 Virtual Pet Game - Integration Test Suite
✅ Health Endpoint - Backend is responding
✅ CORS Headers - Allow-Origin: *
✅ User Registration - User ID: 1
✅ User Login - Token received (bearer)
✅ Get Profile - Username: testplayer_1234567890
✅ Save Game - Save ID: 1, Day: 1
✅ Load Game - Pet: TestPet, Slot: 1
✅ List Saves - 1 save(s) found
✅ Validate Name (Valid) - Accepted: ValidName123
✅ Validate Name (Banned) - Rejected (Contains banned word)

📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed:  10
❌ Failed:  0
🎉 All tests passed!
```

</details>

### Test 2: Test Save/Load

<details>
<summary><b>Click to expand</b></summary>

1. Start a new game
2. Perform some actions (Feed, Play, Clean pet)
3. Close browser tab
4. Reopen the game
5. Click "Load Game"
6. Verify your pet's name, day count, and stats are restored

**What should happen:**
- If logged in: Data loaded from backend (cloud)
- If not logged in: Data loaded from localStorage
- Both are synced, so your data is safe

</details>

### Test 3: Test Authentication

<details>
<summary><b>Click to expand</b></summary>

1. Open game
2. Look for "Login" / "Register" buttons on setup screen
3. Click "Register"
4. Create account with email/password
5. Log in with credentials
6. Play game normally
7. Close and reopen - your save should be in the cloud!

**What should happen:**
- Account created in backend database
- JWT token saved to localStorage
- Game saves now go to backend
- Can access saves from different devices (if backend is public)

</details>

## 🔍 Troubleshooting

### Problem: "Request timeout - backend may be offline"

**Solution:**
1. Make sure backend is running: `py main.py` shows no errors
2. Check if http://localhost:8000/docs loads
3. Check if port 8000 is in use: `netstat -ano | find :8000` (Windows)
4. Try restarting backend on different port:
   ```python
   # In backend/main.py, last line:
   # Change from:
   # uvicorn.run(app, host="127.0.0.1", port=8000)
   # To:
   # uvicorn.run(app, host="127.0.0.1", port=8001)
   ```

### Problem: CORS Error (No 'Access-Control-Allow-Origin' header)

**Solution:**
1. Make sure frontend and backend are running
2. Check that `API_CONFIG.BASE_URL` in `api.js` is correct
3. For development: `BASE_URL: 'http://localhost:8000/api/v1'`
4. Restart both frontend and backend

### Problem: "Name contains banned word" but name is fine

**Solution:**
1. Banned words include leetspeak patterns:
   - 1 → i, 3 → e, 4 → a, 0 → o, 5 → s, 7 → t
   - So "L33t" triggers spam detection
2. Try different characters
3. Check backend console for exact flagged word

### Problem: Authentication fails

**Solution:**
1. Password must be at least 8 characters
2. Username must be unique
3. Check backend console for detailed error
4. Clear localStorage and try again:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Problem: Game saves locally but not to backend

**Solution:**
1. Check if you're logged in: `apiAuth.isLoggedIn()`
2. If false, log in first via auth screen
3. Check browser console for error messages
4. Verify backend has `/api/v1/game/save` endpoint (check http://localhost:8000/docs)
5. Check backend console for validation errors

## 📊 Database Inspection

### View Backend Database (SQLite)

```bash
# Install sqlite tools if needed
# Windows: choco install sqlite
# Mac: brew install sqlite
# Linux: sudo apt-get install sqlite3

# Connect to database
cd backend
sqlite3 instance/app.db

# Useful queries:
sqlite> SELECT * FROM user;                    # View all users
sqlite> SELECT * FROM game_save;               # View all saves
sqlite> SELECT * FROM game_save WHERE user_id = 1;  # Saves for user 1
sqlite> .quit                                  # Exit
```

### View Backend Logs

Backend console shows all requests:
```
INFO:     127.0.0.1:54321 - "POST /api/v1/auth/register" 201 Created
INFO:     127.0.0.1:54322 - "POST /api/v1/auth/login" 200 OK
INFO:     127.0.0.1:54323 - "POST /api/v1/game/save" 200 OK
INFO:     127.0.0.1:54324 - "GET /api/v1/game/save/1" 200 OK
```

## 🔒 Security Notes

### Development Mode
- Backend runs on localhost (secure for local testing)
- Passwords use bcrypt hashing
- JWT tokens expire in 30 days
- SQLite database is file-based (backend/instance/app.db)

### Production Deployment
- Use PostgreSQL instead of SQLite
- Set `SECRET_KEY` to a random value in `.env`
- Use HTTPS (required for JWT)
- Set `CORS_ORIGINS` to specific domains only
- Use environment variables for sensitive data
- See [backend/README.md](backend/README.md) for full deployment guide

## 📝 API Reference

### Authentication

```bash
# Register new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"p@test.com","password":"pwd123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pwd123"}'

# Get profile (with token)
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Game Saves

```bash
# Save game (requires token)
curl -X POST "http://localhost:8000/api/v1/game/save?save_slot=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pet": {"name":"Fluffy","type":"Dog",...},
    "player": {"name":"Player","currentDay":5,...},
    "timestamp":"2024-01-15T10:00:00Z"
  }'

# Load game
curl -X GET http://localhost:8000/api/v1/game/save/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# List saves
curl -X GET http://localhost:8000/api/v1/game/saves \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Delete save
curl -X DELETE http://localhost:8000/api/v1/game/save/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Name Validation

```bash
# Validate name
curl -X POST http://localhost:8000/api/v1/validate/name \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"TestPlayer","type":"player"}'
```

## 📚 Documentation

- [API Documentation](backend/README.md) - Full backend setup and API reference
- [Integration Guide](FRONTEND_BACKEND_INTEGRATION.md) - Data flow and architecture
- [Code Review](SHOP_SYSTEM_SUMMARY.md) - Game systems and features

## 🎮 Next Steps

1. ✅ Backend + Frontend running together
2. ✅ Authentication working (register/login)
3. ✅ Save/load from cloud
4. ✅ Name validation on server

### Optional Enhancements

- [ ] Add multiplayer features (see ideas in INTEGRATION_GUIDE.md)
- [ ] Deploy to cloud (Heroku, AWS, DigitalOcean)
- [ ] Add mobile app (React Native, Flutter)
- [ ] Add social features (friend list, trading)
- [ ] Add daily challenges and quests

## 💡 Pro Tips

### Local Development

Save this to `helpers/start-dev.sh` (or `.bat` on Windows):

```bash
#!/bin/bash
# Start both backend and frontend

echo "Starting backend..."
# Terminal 1: Start backend
echo "Starting backend..."
cd backend
py -3 -m venv venv
source venv/bin/activate
py -3 -m pip install -r requirements.txt
py main.py &
BACKEND_PID=$!

echo "Starting frontend..."
# Terminal 2: Start frontend
echo "Starting frontend..."
py -m http.server 3000 &
FRONTEND_PID=$!

echo ""
echo "✅ Development server running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
wait
```

### Debugging

Enable verbose logging in `api.js`:

```javascript
// At the top of api.js:
const DEBUG = true;

// Then in functions:
if (DEBUG) console.log('Detailed Debug Info');
```

### Testing Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Try playing game - should work with localStorage only
5. Uncheck "Offline" - auto-sync should kick in!

## 🆘 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Check backend console for server errors
3. Check SQLite database: `sqlite3 backend/instance/app.db`
4. Try clearing localStorage: `localStorage.clear()`
5. Restart both frontend and backend

---

**Happy Gaming! 🐶**

Need help? See [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) for detailed troubleshooting.
