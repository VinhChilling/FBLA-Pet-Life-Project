// ============================================================
// ADVANCED ANALYTICS DASHBOARD - Comprehensive Game Statistics
// ============================================================

// ===== GLOBAL VARIABLES =====
let gameStats = null;
let currentView = 'overview';
let achievementSystem = null;

// ===== ACHIEVEMENT SYSTEM =====
const ACHIEVEMENTS = {
  petCare: [
    { id: 'first_feed', name: 'First Meal', description: 'Feed your pet for the first time', icon: '🍖', rarity: 'common' },
    { id: 'perfect_feeding', name: 'Perfect Feeding', description: 'Feed pet 3+ times daily for 7 days', icon: '⭐', rarity: 'rare' },
    { id: 'play_master', name: 'Play Master', description: 'Play with pet 4+ times daily for 7 days', icon: '🎾', rarity: 'rare' },
    { id: 'clean_freak', name: 'Clean Freak', description: 'Clean pet daily for 7 days', icon: '✨', rarity: 'uncommon' },
    { id: 'vet_regular', name: 'Regular Vet Visits', description: 'Visit vet every week for 4 weeks', icon: '🏥', rarity: 'uncommon' },
    { id: 'pet_survivor', name: 'Pet Survivor', description: 'Keep pet alive for 30 days', icon: '🛡️', rarity: 'epic' }
  ],
  selfCare: [
    { id: 'first_exercise', name: 'First Workout', description: 'Exercise for the first time', icon: '🏃', rarity: 'common' },
    { id: 'bookworm', name: 'Bookworm', description: 'Read 10 times', icon: '📚', rarity: 'uncommon' },
    { id: 'social_butterfly', name: 'Social Butterfly', description: 'Hang out with friends 10 times', icon: '👥', rarity: 'uncommon' },
    { id: 'self_care_champion', name: 'Self-Care Champion', description: 'Exercise, read, and hang out in one day', icon: '🏆', rarity: 'rare' },
    { id: 'sleep_master', name: 'Sleep Master', description: 'Average 8+ hours sleep for 7 days', icon: '😴', rarity: 'rare' },
    { id: 'wellness_guru', name: 'Wellness Guru', description: 'Maintain 80+ health and mood for 14 days', icon: '🧘', rarity: 'epic' }
  ],
  financial: [
    { id: 'first_chores', name: 'Hard Worker', description: 'Complete your first chore', icon: '💪', rarity: 'common' },
    { id: 'money_saver', name: 'Money Saver', description: 'Have 50+ coins at any point', icon: '💰', rarity: 'uncommon' },
    { id: 'chore_master', name: 'Chore Master', description: 'Complete 20 chores', icon: '🧹', rarity: 'rare' },
    { id: 'frugal_living', name: 'Frugal Living', description: 'Spend less than 100 coins in 7 days', icon: '💸', rarity: 'uncommon' },
    { id: 'wealth_builder', name: 'Wealth Builder', description: 'Accumulate 100+ coins', icon: '💎', rarity: 'rare' },
    { id: 'financial_wizard', name: 'Financial Wizard', description: 'End game with 100+ coins', icon: '🪄', rarity: 'epic' }
  ],
  timeManagement: [
    { id: 'early_bird', name: 'Early Bird', description: 'Complete all daily tasks before noon', icon: '🌅', rarity: 'uncommon' },
    { id: 'time_master', name: 'Time Master', description: 'Use time efficiently (less than 4 hours wasted)', icon: '⏰', rarity: 'rare' },
    { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all daily tasks in one day', icon: '✅', rarity: 'rare' },
    { id: 'consistency_king', name: 'Consistency King', description: 'Maintain routine for 14 days', icon: '👑', rarity: 'epic' },
    { id: 'speed_runner', name: 'Speed Runner', description: 'Reach day 15 in under 10 minutes', icon: '⚡', rarity: 'epic' },
    { id: 'efficiency_expert', name: 'Efficiency Expert', description: 'Achieve 90%+ daily completion rate', icon: '📊', rarity: 'legendary' }
  ]
};

// ===== DATA ANALYSIS MODULES =====

/**
 * Load and validate game statistics from localStorage
 * @returns {Object|null} Game statistics object or null if not found
 */
function loadGameStats() {
  const savedStats = localStorage.getItem("gameEndStats");

  if (!savedStats) {
    // No stats found - redirect back to game
    if (window.apiNavigation && typeof apiNavigation.goToMainGame === 'function') {
      apiNavigation.goToMainGame();
    } else {
      window.location.href = "index.html";
    }
    return null;
  }

  const stats = JSON.parse(savedStats);
  console.log("Loaded game stats:", stats);
  
  // Ensure all required fields exist with proper defaults
  if (stats.pet) {
    stats.pet.timesFed = stats.pet.timesFed || 0;
    stats.pet.timesPlayed = stats.pet.timesPlayed || 0;
    stats.pet.timesCleaned = stats.pet.timesCleaned || 0;
    stats.pet.timesVisitedVet = stats.pet.timesVisitedVet || 0;
    stats.pet.timesDoingChores = stats.pet.timesDoingChores || 0;
    stats.pet.health = stats.pet.health || 0;
    stats.pet.mood = stats.pet.mood || "Happy";
    stats.pet.energy = stats.pet.energy || 0;
  }
  
  if (stats.player) {
    stats.player.timesWorked = stats.player.timesWorked || 0;
    stats.player.timesStudied = stats.player.timesStudied || 0;
    stats.player.timesExercised = stats.player.timesExercised || 0;
    stats.player.timesSlept = stats.player.timesSlept || 0;
    stats.player.timesRead = stats.player.timesRead || 0;
    stats.player.timesHangout = stats.player.timesHangout || 0;
    stats.player.health = stats.player.health || 0;
    stats.player.mood = stats.player.mood || 0;
    stats.player.coins = stats.player.coins || 0;
    stats.player.expenses = stats.player.expenses || 0;
    stats.player.avgSleepHours = stats.player.avgSleepHours || 7;
    stats.player.currentPoints = stats.player.currentPoints || 0;
  }
  
  gameStats = stats;
  return stats;
}

/**
 * Calculate advanced performance metrics
 * @param {Object} stats - Game statistics
 * @returns {Object} Advanced metrics
 */
function calculateAdvancedMetrics(stats) {
  const { pet, player, finalDay } = stats;
  const daysPlayed = finalDay - 1;
  
  // Calculate efficiency rate
  const totalPossibleChores = daysPlayed * 2; // Assuming 2 chores per day max
  const actualChores = pet.timesDoingChores || 0;
  const efficiencyRate = totalPossibleChores > 0 ? (actualChores / totalPossibleChores) * 100 : 0;
  
  // Calculate self-care score
  const totalSelfCare = (player.timesExercised || 0) + (player.timesHangout || 0) + (player.timesRead || 0);
  const selfCareScore = daysPlayed > 0 ? (totalSelfCare / daysPlayed) * 10 : 0;
  
  // Calculate consistency indices
  const feedingConsistency = daysPlayed > 0 ? ((pet.timesFed || 0) / (daysPlayed * 3)) * 100 : 0;
  const playingConsistency = daysPlayed > 0 ? ((pet.timesPlayed || 0) / (daysPlayed * 4)) * 100 : 0;
  const selfCareConsistency = daysPlayed > 0 ? (totalSelfCare / (daysPlayed * 3)) * 100 : 0;
  
  // Calculate grades
  const overallGrade = calculateGrade(player.currentPoints, daysPlayed);
  const petCareRating = calculatePetCareRating(pet, daysPlayed);
  const selfCareRating = calculateSelfCareRating(player, daysPlayed);
  
  return {
    efficiencyRate: Math.min(100, efficiencyRate),
    selfCareScore: Math.min(100, selfCareScore),
    feedingConsistency: Math.min(100, feedingConsistency),
    playingConsistency: Math.min(100, playingConsistency),
    selfCareConsistency: Math.min(100, selfCareConsistency),
    overallGrade,
    petCareRating,
    selfCareRating,
    avgDailyScore: daysPlayed > 0 ? player.currentPoints / daysPlayed : 0,
    improvementRate: calculateImprovementRate(player, daysPlayed),
    consistencyIndex: (feedingConsistency + playingConsistency + selfCareConsistency) / 3
  };
}

/**
 * Calculate letter grade based on performance
 * @param {number} score - Total score
 * @param {number} days - Days played
 * @returns {string} Letter grade
 */
function calculateGrade(score, days) {
  const avgScore = days > 0 ? score / days : 0;
  if (avgScore >= 90) return 'A+';
  if (avgScore >= 85) return 'A';
  if (avgScore >= 80) return 'B+';
  if (avgScore >= 75) return 'B';
  if (avgScore >= 70) return 'C+';
  if (avgScore >= 65) return 'C';
  if (avgScore >= 60) return 'D';
  return 'F';
}

/**
 * Calculate pet care rating
 * @param {Object} pet - Pet statistics
 * @param {number} days - Days played
 * @returns {string} Rating
 */
function calculatePetCareRating(pet, days) {
  const feedingRate = days > 0 ? (pet.timesFed || 0) / (days * 3) : 0;
  const playingRate = days > 0 ? (pet.timesPlayed || 0) / (days * 4) : 0;
  const cleaningRate = days > 0 ? (pet.timesCleaned || 0) / days : 0;
  
  const avgRate = (feedingRate + playingRate + cleaningRate) / 3;
  
  if (avgRate >= 0.9) return 'Excellent';
  if (avgRate >= 0.8) return 'Great';
  if (avgRate >= 0.7) return 'Good';
  if (avgRate >= 0.6) return 'Fair';
  return 'Poor';
}

/**
 * Calculate self-care rating
 * @param {Object} player - Player statistics
 * @param {number} days - Days played
 * @returns {string} Rating
 */
function calculateSelfCareRating(player, days) {
  const exerciseRate = days > 0 ? (player.timesExercised || 0) / days : 0;
  const readingRate = days > 0 ? (player.timesRead || 0) / days : 0;
  const socialRate = days > 0 ? (player.timesHangout || 0) / days : 0;
  
  const avgRate = (exerciseRate + readingRate + socialRate) / 3;
  
  if (avgRate >= 0.8) return 'Excellent';
  if (avgRate >= 0.6) return 'Good';
  if (avgRate >= 0.4) return 'Fair';
  return 'Poor';
}

/**
 * Calculate improvement rate
 * @param {Object} player - Player statistics
 * @param {number} days - Days played
 * @returns {string} Improvement rate
 */
function calculateImprovementRate(player, days) {
  // Simplified calculation - in a real implementation, this would track daily scores
  const baseScore = days * 50; // Assuming 50 points per day baseline
  const actualScore = player.currentPoints;
  const improvement = ((actualScore - baseScore) / baseScore) * 100;
  
  if (improvement > 20) return 'Excellent';
  if (improvement > 10) return 'Good';
  if (improvement > 0) return 'Moderate';
  return 'Declining';
}

/**
 * Check and unlock achievements
 * @param {Object} stats - Game statistics
 * @returns {Object} Achievement results
 */
function checkAchievements(stats) {
  const { pet, player, finalDay } = stats;
  const daysPlayed = finalDay - 1;
  const unlockedAchievements = [];
  const totalAchievements = Object.values(ACHIEVEMENTS).flat();
  
  // Check pet care achievements
  if (pet.timesFed > 0) unlockAchievement('first_feed', unlockedAchievements);
  if (daysPlayed >= 7 && (pet.timesFed || 0) >= daysPlayed * 3) unlockAchievement('perfect_feeding', unlockedAchievements);
  if (daysPlayed >= 7 && (pet.timesPlayed || 0) >= daysPlayed * 4) unlockAchievement('play_master', unlockedAchievements);
  if (daysPlayed >= 7 && (pet.timesCleaned || 0) >= daysPlayed) unlockAchievement('clean_freak', unlockedAchievements);
  if (daysPlayed >= 28 && (pet.timesVisitedVet || 0) >= 4) unlockAchievement('vet_regular', unlockedAchievements);
  if (daysPlayed >= 30) unlockAchievement('pet_survivor', unlockedAchievements);
  
  // Check self-care achievements
  if (player.timesExercised > 0) unlockAchievement('first_exercise', unlockedAchievements);
  if ((player.timesRead || 0) >= 10) unlockAchievement('bookworm', unlockedAchievements);
  if ((player.timesHangout || 0) >= 10) unlockAchievement('social_butterfly', unlockedAchievements);
  // Add more self-care checks as needed
  
  // Check financial achievements
  if ((pet.timesDoingChores || 0) > 0) unlockAchievement('first_chores', unlockedAchievements);
  if (player.coins >= 50) unlockAchievement('money_saver', unlockedAchievements);
  if ((pet.timesDoingChores || 0) >= 20) unlockAchievement('chore_master', unlockedAchievements);
  if (player.coins >= 100) unlockAchievement('wealth_builder', unlockedAchievements);
  if (player.coins >= 100) unlockAchievement('financial_wizard', unlockedAchievements);
  
  const rareAchievements = unlockedAchievements.filter(a => a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary');
  const completionRate = (unlockedAchievements.length / totalAchievements.length) * 100;
  
  return {
    unlocked: unlockedAchievements,
    total: totalAchievements.length,
    rare: rareAchievements.length,
    completionRate
  };
}

/**
 * Unlock an achievement
 * @param {string} achievementId - Achievement ID
 * @param {Array} unlocked - Array of unlocked achievements
 */
function unlockAchievement(achievementId, unlocked) {
  const allAchievements = Object.values(ACHIEVEMENTS).flat();
  const achievement = allAchievements.find(a => a.id === achievementId);
  if (achievement && !unlocked.find(a => a.id === achievementId)) {
    unlocked.push(achievement);
  }
}

/**
 * Draw chart axes
 */
function drawAxes(ctx, padding, width, height) {
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + height);
  ctx.lineTo(padding + width, padding + height);
  ctx.lineTo(padding, padding);
  ctx.stroke();
}

/**
 * Generate performance chart data
 * @param {Object} stats - Game statistics
 * @returns {Object} Chart data
 */
function generateChartData(stats) {
  const { pet, player, finalDay, dailyStats } = stats;
  const daysPlayed = finalDay - 1;
  
  // Generate simulated daily data (in a real implementation, this would use actual daily tracking)
  const healthData = generateSimulatedData(daysPlayed, 50, 100, pet.health || 50);
  const moodData = generateSimulatedData(daysPlayed, 30, 100, player.mood || 50);
  const scoreData = generateSimulatedData(daysPlayed, 0, 150, player.currentPoints || 0);
  
  return {
    health: healthData,
    mood: moodData,
    score: scoreData,
    activities: {
      feeding: pet.timesFed || 0,
      playing: pet.timesPlayed || 0,
      cleaning: pet.timesCleaned || 0,
      exercise: player.timesExercised || 0,
      reading: player.timesRead || 0,
      hanging: player.timesHangout || 0
    }
  };
}

/**
 * Generate simulated data for charts
 * @param {number} days - Number of days
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} final - Final value
 * @returns {Array} Simulated data array
 */
function generateSimulatedData(days, min, max, final) {
  const data = [];
  const range = max - min;
  
  for (let i = 0; i <= days; i++) {
    const progress = i / days;
    const baseValue = min + (range * progress);
    const variation = (Math.random() - 0.5) * (range * 0.2);
    const value = Math.max(min, Math.min(max, baseValue + variation));
    data.push(Math.round(value));
  }
  
  // Ensure final value matches
  data[data.length - 1] = final;
  return data;
}

// ===== UI FUNCTIONS =====

/**
 * Switch between different analytics views
 * @param {string} viewName - View name to show
 */
function showView(viewName) {
  console.log('showView called with:', viewName); // Debug line
  
  // Hide all views
  document.querySelectorAll('.analytics-view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected view
  const selectedView = document.getElementById(viewName + 'View');
  const selectedBtn = document.getElementById(viewName + 'Btn');
  
  console.log('Selected view element:', selectedView); // Debug line
  console.log('Selected button element:', selectedBtn); // Debug line
  
  if (selectedView) {
    selectedView.classList.add('active');
  } else {
    console.error('View element not found:', viewName + 'View');
  }
  
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  } else {
    console.error('Button element not found:', viewName + 'Btn');
  }
  
  currentView = viewName;
  
  // Initialize view-specific content
  if (viewName === 'performance') {
    initializePerformanceView();
  } else if (viewName === 'achievements') {
    initializeAchievementsView();
  } else if (viewName === 'reports') {
    initializeReportsView();
  }
}

/**
 * Display all statistics on the page
 */
function displayStats() {
  const stats = loadGameStats();
  if (!stats) return;
  
  console.log("Displaying stats:", stats);

  const { pet, player, finalDay, endMessage } = stats;
  
  // Update header
  document.getElementById("endMessage").textContent = endMessage;
  
  // Determine if it's a win or loss
  const isWin = endMessage.includes("Congratulations");
  document.getElementById("endTitle").textContent = isWin
    ? "🎉 Victory! Advanced Analytics Dashboard"
    : "💔 Game Over - Performance Analysis";

  // Calculate advanced metrics
  const metrics = calculateAdvancedMetrics(stats);
  
  // Pet Statistics
  document.getElementById("petName").textContent = pet.name || "Unknown";
  document.getElementById("petType").textContent = pet.type || "Unknown";
  document.getElementById("petHealth").textContent = pet.health || 0;
  document.getElementById("petEnergy").textContent = pet.energy || 0;
  document.getElementById("petMood").textContent = pet.mood || "Unknown";

  // Player Statistics
  document.getElementById("daysSurvived").textContent = finalDay - 1;
  document.getElementById("playerHealth").textContent = player.health || 0;
  document.getElementById("playerMood").textContent = player.mood || 0;
  document.getElementById("finalScore").textContent = player.currentPoints || 0;
  document.getElementById("avgSleep").textContent = (player.avgSleepHours || 0).toFixed(1) + " hours";

  // Financial Report
  document.getElementById("coinsRemaining").textContent = "$" + (player.coins || 0);
  document.getElementById("totalExpenses").textContent = "$" + (player.expenses || 0);
  document.getElementById("choresCount").textContent = pet.timesDoingChores || 0;
  document.getElementById("efficiencyRate").textContent = metrics.efficiencyRate.toFixed(1) + "%";

  // Pet Care Activities
  document.getElementById("timesFed").textContent = pet.timesFed || 0;
  document.getElementById("timesPlayed").textContent = pet.timesPlayed || 0;
  document.getElementById("timesCleaned").textContent = pet.timesCleaned || 0;
  document.getElementById("vetVisits").textContent = pet.timesVisitedVet || 0;

  // Player Activities
  document.getElementById("timesExercised").textContent = player.timesExercised || 0;
  document.getElementById("timesHangout").textContent = player.timesHangout || 0;
  document.getElementById("timesRead").textContent = player.timesRead || 0;
  document.getElementById("selfCareScore").textContent = metrics.selfCareScore.toFixed(0);

  // Performance Metrics
  document.getElementById("overallGrade").textContent = metrics.overallGrade;
  document.getElementById("petCareRating").textContent = metrics.petCareRating;
  document.getElementById("selfCareRating").textContent = metrics.selfCareRating;

  // Generate summary
  generateAdvancedSummary(stats, metrics);
  
  // Initialize achievements
  achievementSystem = checkAchievements(stats);
  console.log("Achievement system:", achievementSystem);
}

/**
 * Generate advanced performance summary
 * @param {Object} stats - Game statistics
 * @param {Object} metrics - Advanced metrics
 */
function generateAdvancedSummary(stats, metrics) {
  const { pet, player, finalDay } = stats;
  const summaryEl = document.getElementById("summaryText");

  let summary = "";
  
  // Performance overview
  if (metrics.overallGrade === 'A+' || metrics.overallGrade === 'A') {
    summary += `🏆 Outstanding performance! You achieved an ${metrics.overallGrade} grade with ${player.currentPoints} total points. `;
  } else if (metrics.overallGrade === 'B+' || metrics.overallGrade === 'B') {
    summary += `👏 Good performance! You earned a ${metrics.overallGrade} grade with ${player.currentPoints} points. `;
  } else {
    summary += `📈 You completed ${finalDay - 1} days with ${player.currentPoints} points (${metrics.overallGrade} grade). `;
  }

  // Pet care analysis
  summary += `Pet care was ${metrics.petCareRating.toLowerCase()} with ${pet.timesFed || 0} feeds, ${pet.timesPlayed || 0} play sessions, and ${pet.timesCleaned || 0} cleanings. `;
  
  // Self-care analysis
  summary += `Self-care was ${metrics.selfCareRating.toLowerCase()} (${metrics.selfCareScore.toFixed(0)}% score). `;
  
  // Efficiency analysis
  if (metrics.efficiencyRate >= 80) {
    summary += `Excellent time management with ${metrics.efficiencyRate.toFixed(1)}% efficiency. `;
  } else if (metrics.efficiencyRate >= 60) {
    summary += `Good time management at ${metrics.efficiencyRate.toFixed(1)}% efficiency. `;
  } else {
    summary += `Time management could improve (${metrics.efficiencyRate.toFixed(1)}% efficiency). `;
  }

  // Financial analysis
  if (player.coins > 50) {
    summary += `Strong financial performance with $${player.coins} remaining. `;
  } else if (player.coins > 0) {
    summary += `Financial management was adequate with $${player.coins} remaining. `;
  } else {
    summary += `Financial challenges were faced during gameplay. `;
  }

  // Consistency analysis
  if (metrics.consistencyIndex >= 80) {
    summary += `Highly consistent routine (${metrics.consistencyIndex.toFixed(1)}% consistency index). `;
  } else {
    summary += `Routine consistency was ${metrics.consistencyIndex.toFixed(1)}%. `;
  }

  summaryEl.textContent = summary;
}

/**
 * Initialize performance view with charts
 */
function initializePerformanceView() {
  if (!gameStats) return;
  
  const chartData = generateChartData(gameStats);
  const metrics = calculateAdvancedMetrics(gameStats);
  
  // Update statistical analysis
  document.getElementById("avgDailyScore").textContent = metrics.avgDailyScore.toFixed(1);
  document.getElementById("peakDay").textContent = `Day ${Math.floor(Math.random() * (gameStats.finalDay - 1)) + 1}`;
  document.getElementById("improvementRate").textContent = metrics.improvementRate;
  document.getElementById("efficiencyScore").textContent = metrics.efficiencyRate.toFixed(1) + "%";
  document.getElementById("consistencyIndex").textContent = metrics.consistencyIndex.toFixed(1) + "%";
  
  // Update activity distribution
  const activities = chartData.activities;
  const totalActivities = Object.values(activities).reduce((sum, val) => sum + val, 0);
  document.getElementById("totalActivities").textContent = totalActivities;
  
  // Find most and least frequent activities
  let mostFrequent = 'Feeding';
  let leastFrequent = 'Vet Visits';
  let maxCount = 0;
  let minCount = Infinity;
  
  Object.entries(activities).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (count < minCount && count > 0) {
      minCount = count;
      leastFrequent = name.charAt(0).toUpperCase() + name.slice(1);
    }
  });
  
  document.getElementById("mostFrequent").textContent = mostFrequent;
  document.getElementById("leastFrequent").textContent = leastFrequent;
  
  // Update progress bars
  updateProgressBar("feedingProgress", "feedingPercent", metrics.feedingConsistency);
  updateProgressBar("playingProgress", "playingPercent", metrics.playingConsistency);
  updateProgressBar("selfCareProgress", "selfCarePercent", metrics.selfCareConsistency);
  
  // Draw charts (simplified version - in production would use Chart.js or similar)
  drawSimpleCharts(chartData);
}

/**
 * Update progress bar
 * @param {string} barId - Progress bar element ID
 * @param {string} textId - Progress text element ID
 * @param {number} percentage - Progress percentage
 */
function updateProgressBar(barId, textId, percentage) {
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  
  if (bar && text) {
    bar.style.width = percentage + "%";
    text.textContent = percentage.toFixed(0) + "%";
  }
}

/**
 * Draw simple charts (placeholder implementation)
 * @param {Object} chartData - Chart data
 */
function drawSimpleCharts(chartData) {
  // This is a simplified implementation
  // In production, would use a proper charting library like Chart.js
  
  const performanceCanvas = document.getElementById("performanceChart");
  const activityCanvas = document.getElementById("activityChart");
  
  if (performanceCanvas) {
    const ctx = performanceCanvas.getContext("2d");
    drawLineChart(ctx, chartData.health, chartData.mood, chartData.score);
  }
  
  if (activityCanvas) {
    const ctx = activityCanvas.getContext("2d");
    drawBarChart(ctx, chartData.activities);
  }
}

/**
 * Draw line chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} healthData - Health data
 * @param {Array} moodData - Mood data
 * @param {Array} scoreData - Score data
 */
function drawLineChart(ctx, healthData, moodData, scoreData) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }
  
  // Draw health line
  drawDataLine(ctx, healthData, "#10b981", width, height);
  
  // Draw mood line
  drawDataLine(ctx, moodData, "#f59e0b", width, height);
}

/**
 * Draw data line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} data - Data array
 * @param {string} color - Line color
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawDataLine(ctx, data, color, width, height) {
  if (data.length < 2) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const xStep = width / (data.length - 1);
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  data.forEach((value, index) => {
    const x = index * xStep;
    const y = height - ((value - minValue) / range) * height;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
}

/**
 * Draw bar chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} activities - Activity data
 */
function drawBarChart(ctx, activities) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  const activityNames = Object.keys(activities);
  const activityValues = Object.values(activities);
  const maxValue = Math.max(...activityValues, 1);
  
  const barWidth = width / activityNames.length;
  const colors = ["#667eea", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  
  activityValues.forEach((value, index) => {
    const barHeight = (value / maxValue) * height * 0.8;
    const x = index * barWidth + barWidth * 0.1;
    const y = height - barHeight;
    
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
  });
}
/**
 * Initialize achievements view
 */
function initializeAchievementsView() {
  if (!achievementSystem) return;
  
  // Display achievements by category
  displayAchievementsByCategory('petCareAchievements', ACHIEVEMENTS.petCare, achievementSystem.unlocked);
  displayAchievementsByCategory('selfCareAchievements', ACHIEVEMENTS.selfCare, achievementSystem.unlocked);
  displayAchievementsByCategory('financialAchievements', ACHIEVEMENTS.financial, achievementSystem.unlocked);
  displayAchievementsByCategory('timeAchievements', ACHIEVEMENTS.timeManagement, achievementSystem.unlocked);
  
  // Update achievement statistics
  document.getElementById("totalAchievements").textContent = achievementSystem.unlocked.length;
  document.getElementById("rareAchievements").textContent = achievementSystem.rare;
  document.getElementById("achievementProgress").textContent = achievementSystem.completionRate.toFixed(0) + "%";
  document.getElementById("achievementBarFill").style.width = achievementSystem.completionRate + "%";
  
  // Generate milestones
  generateMilestones();
}

/**
 * Display achievements by category
 * @param {string} containerId - Container element ID
 * @param {Array} achievements - Achievement definitions
 * @param {Array} unlocked - Unlocked achievements
 */
function displayAchievementsByCategory(containerId, achievements, unlocked) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = "";
  
  achievements.forEach(achievement => {
    const isUnlocked = unlocked.find(a => a.id === achievement.id);
    const achievementEl = document.createElement("div");
    achievementEl.className = `achievement ${isUnlocked ? "unlocked" : "locked"}`;
    achievementEl.innerHTML = `
      <span>${achievement.icon}</span>
      <span>${achievement.name}</span>
      <span class="achievement-desc">${achievement.description}</span>
    `;
    container.appendChild(achievementEl);
  });
}

/**
 * Generate milestones based on game performance
 */
function generateMilestones() {
  if (!gameStats) return;
  
  const { pet, player, finalDay } = gameStats;
  const milestones = [];
  
  // Game milestones
  milestones.push({
    date: `Day 1`,
    description: "Started your journey with ${pet.name}",
    completed: true
  });
  
  if (finalDay > 7) {
    milestones.push({
      date: `Day 7`,
      description: "Completed first week",
      completed: true
    });
  }
  
  if (player.currentPoints > 1000) {
    milestones.push({
      date: `Day ${Math.min(finalDay - 1, 15)}`,
      description: "Reached 1000 points",
      completed: true
    });
  }
  
  if (pet.timesFed > 20) {
    milestones.push({
      date: `Day ${Math.min(finalDay - 1, 20)}`,
      description: "Fed pet 20+ times",
      completed: true
    });
  }
  
  if (finalDay >= 30) {
    milestones.push({
      date: `Day 30`,
      description: "Completed 30-day challenge",
      completed: true
    });
  }
  
  const milestoneList = document.getElementById("milestoneList");
  if (milestoneList) {
    milestoneList.innerHTML = "";
    milestones.forEach(milestone => {
      const milestoneEl = document.createElement("div");
      milestoneEl.className = `milestone ${milestone.completed ? "completed" : ""}`;
      milestoneEl.innerHTML = `
        <span class="milestone-date">${milestone.date}</span>
        <span class="milestone-description">${milestone.description}</span>
      `;
      milestoneList.appendChild(milestoneEl);
    });
  }
}

/**
 * Initialize reports view
 */
function initializeReportsView() {
  // Reports view is ready for user interaction
  console.log("Reports view initialized");
}

/**
 * Generate custom report based on user selection
 */
function generateCustomReport() {
  const reportType = document.getElementById("reportType").value;
  const reportFormat = document.getElementById("reportFormat").value;
  const dateRange = document.getElementById("dateRange").value;
  
  if (!gameStats) return;
  
  let reportData = generateReportData(reportType, dateRange);
  let formattedReport = formatReport(reportData, reportFormat, reportType);
  
  displayReportPreview(formattedReport);
  showReportActions();
}

/**
 * Generate report data based on type
 * @param {string} type - Report type
 * @param {string} range - Date range
 * @returns {Object} Report data
 */
function generateReportData(type, range) {
  if (!gameStats) return {};
  
  const { pet, player, finalDay } = gameStats;
  const baseData = {
    timestamp: new Date().toISOString(),
    reportType: type,
    dateRange: range,
    gameStats: gameStats
  };
  
  switch (type) {
    case 'comprehensive':
      return {
        ...baseData,
        overview: calculateAdvancedMetrics(gameStats),
        achievements: achievementSystem,
        performance: generateChartData(gameStats)
      };
      
    case 'petCare':
      return {
        ...baseData,
        petStats: {
          name: pet.name,
          type: pet.type,
          health: pet.health,
          energy: pet.energy,
          mood: pet.mood,
          timesFed: pet.timesFed,
          timesPlayed: pet.timesPlayed,
          timesCleaned: pet.timesCleaned,
          vetVisits: pet.timesVisitedVet
        }
      };
      
    case 'selfCare':
      return {
        ...baseData,
        playerStats: {
          name: player.name || "Player",
          health: player.health,
          mood: player.mood,
          avgSleep: player.avgSleepHours,
          timesExercised: player.timesExercised,
          timesRead: player.timesRead,
          timesHangout: player.timesHangout
        }
      };
      
    case 'financial':
      return {
        ...baseData,
        financialStats: {
          coins: player.coins,
          expenses: player.expenses,
          choresCompleted: pet.timesDoingChores,
          efficiencyRate: calculateAdvancedMetrics(gameStats).efficiencyRate
        }
      };
      
    case 'performance':
      return {
        ...baseData,
        performance: calculateAdvancedMetrics(gameStats),
        charts: generateChartData(gameStats)
      };
      
    default:
      return baseData;
  }
}

/**
 * Format report data
 * @param {Object} data - Report data
 * @param {string} format - Output format
 * @param {string} type - Report type
 * @returns {string} Formatted report
 */
function formatReport(data, format, type) {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
      
    case 'csv':
      return formatAsCSV(data, type);
      
    case 'txt':
      return formatAsText(data, type);
      
    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Format data as CSV
 * @param {Object} data - Report data
 * @param {string} type - Report type
 * @returns {string} CSV formatted data
 */
function formatAsCSV(data, type) {
  const { gameStats } = data;
  const { pet, player, finalDay } = gameStats;
  
  let csv = "Category,Metric,Value\n";
  
  // Basic stats
  csv += `Game,Days Survived,${finalDay - 1}\n`;
  csv += `Game,Final Score,${player.currentPoints}\n`;
  csv += `Pet,Name,${pet.name}\n`;
  csv += `Pet,Type,${pet.type}\n`;
  csv += `Pet,Health,${pet.health}\n`;
  csv += `Pet,Energy,${pet.energy}\n`;
  csv += `Pet,Mood,${pet.mood}\n`;
  csv += `Player,Health,${player.health}\n`;
  csv += `Player,Mood,${player.mood}\n`;
  csv += `Player,Avg Sleep,${player.avgSleepHours}\n`;
  csv += `Financial,Coins,${player.coins}\n`;
  csv += `Financial,Expenses,${player.expenses}\n`;
  
  return csv;
}

/**
 * Format data as text
 * @param {Object} data - Report data
 * @param {string} type - Report type
 * @returns {string} Text formatted data
 */
function formatAsText(data, type) {
  const { gameStats } = data;
  const { pet, player, finalDay } = gameStats;
  
  let text = `Pet Life Game Report\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `Report Type: ${type}\n`;
  text += `=====================================\n\n`;
  
  text += `Game Overview:\n`;
  text += `- Days Survived: ${finalDay - 1}\n`;
  text += `- Final Score: ${player.currentPoints}\n`;
  text += `- Pet Name: ${pet.name} (${pet.type})\n\n`;
  
  text += `Pet Statistics:\n`;
  text += `- Health: ${pet.health}\n`;
  text += `- Energy: ${pet.energy}\n`;
  text += `- Mood: ${pet.mood}\n`;
  text += `- Times Fed: ${pet.timesFed || 0}\n`;
  text += `- Times Played: ${pet.timesPlayed || 0}\n`;
  text += `- Times Cleaned: ${pet.timesCleaned || 0}\n`;
  text += `- Vet Visits: ${pet.timesVisitedVet || 0}\n\n`;
  
  text += `Player Statistics:\n`;
  text += `- Health: ${player.health}\n`;
  text += `- Mood: ${player.mood}\n`;
  text += `- Average Sleep: ${player.avgSleepHours.toFixed(1)} hours\n`;
  text += `- Times Exercised: ${player.timesExercised || 0}\n`;
  text += `- Times Read: ${player.timesRead || 0}\n`;
  text += `- Times Hung Out: ${player.timesHangout || 0}\n\n`;
  
  text += `Financial Summary:\n`;
  text += `- Coins Remaining: $${player.coins}\n`;
  text += `- Total Expenses: $${player.expenses}\n`;
  text += `- Chores Completed: ${pet.timesDoingChores || 0}\n`;
  
  return text;
}

/**
 * Display report preview
 * @param {string} report - Formatted report
 */
function displayReportPreview(report) {
  const preview = document.getElementById("reportPreview");
  if (preview) {
    preview.textContent = report;
  }
}

/**
 * Show report action buttons
 */
function showReportActions() {
  const actions = document.getElementById("reportActions");
  if (actions) {
    actions.style.display = "flex";
  }
}

/**
 * Generate quick report
 * @param {string} reportType - Quick report type
 */
function generateQuickReport(reportType) {
  if (!gameStats) return;
  
  let report = "";
  
  switch (reportType) {
    case 'summary':
      report = generateExecutiveSummary();
      break;
    case 'detailed':
      report = generateDetailedAnalysis();
      break;
    case 'comparison':
      report = generatePerformanceComparison();
      break;
    case 'recommendations':
      report = generateRecommendations();
      break;
  }
  
  displayReportPreview(report);
  showReportActions();
}

/**
 * Generate executive summary
 * @returns {string} Executive summary
 */
function generateExecutiveSummary() {
  if (!gameStats) return "";
  
  const { pet, player, finalDay } = gameStats;
  const metrics = calculateAdvancedMetrics(gameStats);
  
  let summary = `EXECUTIVE SUMMARY - Pet Life Performance Report\n`;
  summary += `================================================\n\n`;
  summary += `Player: ${player.name || "Anonymous"}\n`;
  summary += `Pet: ${pet.name} (${pet.type})\n`;
  summary += `Game Duration: ${finalDay - 1} days\n`;
  summary += `Final Score: ${player.currentPoints} points\n`;
  summary += `Overall Grade: ${metrics.overallGrade}\n\n`;
  
  summary += `KEY PERFORMANCE INDICATORS:\n`;
  summary += `• Pet Care Rating: ${metrics.petCareRating}\n`;
  summary += `• Self-Care Rating: ${metrics.selfCareRating}\n`;
  summary += `• Efficiency Rate: ${metrics.efficiencyRate.toFixed(1)}%\n`;
  summary += `• Consistency Index: ${metrics.consistencyIndex.toFixed(1)}%\n\n`;
  
  summary += `FINANCIAL OVERVIEW:\n`;
  summary += `• Final Balance: $${player.coins}\n`;
  summary += `• Total Expenses: $${player.expenses}\n`;
  summary += `• Chores Completed: ${pet.timesDoingChores || 0}\n\n`;
  
  summary += `ACHIEVEMENTS:\n`;
  summary += `• Total Unlocked: ${achievementSystem.unlocked.length}/${achievementSystem.total}\n`;
  summary += `• Rare Achievements: ${achievementSystem.rare}\n`;
  summary += `• Completion Rate: ${achievementSystem.completionRate.toFixed(1)}%\n\n`;
  
  summary += `RECOMMENDATIONS:\n`;
  if (metrics.petCareRating === 'Poor') {
    summary += `• Focus on consistent pet feeding and play\n`;
  }
  if (metrics.selfCareRating === 'Poor') {
    summary += `• Prioritize exercise, reading, and social activities\n`;
  }
  if (metrics.efficiencyRate < 60) {
    summary += `• Improve time management and chore efficiency\n`;
  }
  if (player.coins < 10) {
    summary += `• Focus on earning more coins through chores\n`;
  }
  
  return summary;
}

/**
 * Generate detailed analysis
 * @returns {string} Detailed analysis
 */
function generateDetailedAnalysis() {
  if (!gameStats) return "";
  
  const { pet, player, finalDay } = gameStats;
  const daysPlayed = finalDay - 1;
  
  let analysis = `DETAILED PERFORMANCE ANALYSIS - Pet Life\n`;
  analysis += `==========================================\n\n`;
  
  analysis += `GAME STATISTICS:\n`;
  analysis += `Duration: ${daysPlayed} days\n`;
  analysis += `Final Score: ${player.currentPoints} points\n`;
  analysis += `Average Daily Score: ${(player.currentPoints / daysPlayed).toFixed(1)} points\n\n`;
  
  analysis += `PET CARE ANALYSIS:\n`;
  analysis += `Feeding: ${pet.timesFed || 0} times (${((pet.timesFed || 0) / (daysPlayed * 3) * 100).toFixed(1)}% of recommended)\n`;
  analysis += `Playing: ${pet.timesPlayed || 0} times (${((pet.timesPlayed || 0) / (daysPlayed * 4) * 100).toFixed(1)}% of recommended)\n`;
  analysis += `Cleaning: ${pet.timesCleaned || 0} times (${((pet.timesCleaned || 0) / daysPlayed * 100).toFixed(1)}% consistency)\n`;
  analysis += `Vet Visits: ${pet.timesVisitedVet || 0} times\n`;
  analysis += `Final Pet Stats: Health ${pet.health}, Energy ${pet.energy}, Mood ${pet.mood}\n\n`;
  
  analysis += `PLAYER WELLNESS ANALYSIS:\n`;
  analysis += `Health: ${player.health}/100\n`;
  analysis += `Mood: ${player.mood}/100\n`;
  analysis += `Average Sleep: ${player.avgSleepHours.toFixed(1)} hours\n`;
  analysis += `Exercise Sessions: ${player.timesExercised || 0}\n`;
  analysis += `Reading Sessions: ${player.timesRead || 0}\n`;
  analysis += `Social Activities: ${player.timesHangout || 0}\n\n`;
  
  analysis += `FINANCIAL ANALYSIS:\n`;
  analysis += `Starting Coins: 10\n`;
  analysis += `Final Coins: ${player.coins}\n`;
  analysis += `Net Change: ${player.coins - 10} coins\n`;
  analysis += `Total Expenses: $${player.expenses}\n`;
  analysis += `Chores Completed: ${pet.timesDoingChores || 0}\n`;
  analysis += `Average Earnings per Chore: ${pet.timesDoingChores > 0 ? (player.coins - 10 + player.expenses) / (pet.timesDoingChores || 1) : 0} coins\n\n`;
  
  analysis += `TIME MANAGEMENT ANALYSIS:\n`;
  analysis += `Total Time Available: ${daysPlayed * 24} hours\n`;
  analysis += `Time Used on Chores: ${(pet.timesDoingChores || 0) * 2} hours\n`;
  analysis += `Time Used on Exercise: ${(player.timesExercised || 0) * 2} hours\n`;
  analysis += `Time Used on Reading: ${(player.timesRead || 0) * 1} hours\n`;
  analysis += `Time Used on Social: ${(player.timesHangout || 0) * 3} hours\n`;
  analysis += `Time Used on Pet Play: ${(pet.timesPlayed || 0) * 1} hours\n`;
  analysis += `Time Used on Pet Cleaning: ${(pet.timesCleaned || 0) * 2} hours\n`;
  analysis += `Time Used on Vet Visits: ${(pet.timesVisitedVet || 0) * 4} hours\n\n`;
  
  return analysis;
}

/**
 * Generate performance comparison
 * @returns {string} Performance comparison
 */
function generatePerformanceComparison() {
  if (!gameStats) return "";
  
  const { pet, player, finalDay } = gameStats;
  const metrics = calculateAdvancedMetrics(gameStats);
  
  let comparison = `PERFORMANCE COMPARISON ANALYSIS - Pet Life\n`;
  comparison += `============================================\n\n`;
  
  comparison += `PERFORMANCE RATINGS:\n`;
  comparison += `Overall Grade: ${metrics.overallGrade}\n`;
  comparison += `Pet Care: ${metrics.petCareRating}\n`;
  comparison += `Self-Care: ${metrics.selfCareRating}\n`;
  comparison += `Efficiency: ${metrics.efficiencyRate.toFixed(1)}%\n`;
  comparison += `Consistency: ${metrics.consistencyIndex.toFixed(1)}%\n\n`;
  
  comparison += `ACTIVITY COMPARISON:\n`;
  const activities = {
    'Feeding': pet.timesFed || 0,
    'Playing': pet.timesPlayed || 0,
    'Cleaning': pet.timesCleaned || 0,
    'Exercise': player.timesExercised || 0,
    'Reading': player.timesRead || 0,
    'Social': player.timesHangout || 0
  };
  
  Object.entries(activities)
    .sort(([,a], [,b]) => b - a)
    .forEach(([name, count], index) => {
      comparison += `${index + 1}. ${name}: ${count} times\n`;
    });
  
  comparison += `\nFINANCIAL COMPARISON:\n`;
  comparison += `Daily Average Income: ${((player.coins - 10 + player.expenses) / (finalDay - 1)).toFixed(2)} coins\n`;
  comparison += `Daily Average Expenses: ${(player.expenses / (finalDay - 1)).toFixed(2)} coins\n`;
  comparison += `Net Daily Profit: ${((player.coins - 10) / (finalDay - 1)).toFixed(2)} coins\n\n`;
  
  comparison += `ACHIEVEMENT COMPARISON:\n`;
  comparison += `Unlocked: ${achievementSystem.unlocked.length}/${achievementSystem.total}\n`;
  comparison += `Completion Rate: ${achievementSystem.completionRate.toFixed(1)}%\n`;
  comparison += `Rare Achievements: ${achievementSystem.rare}\n\n`;
  
  return comparison;
}

/**
 * Generate recommendations
 * @returns {string} Recommendations
 */
function generateRecommendations() {
  if (!gameStats) return "";
  
  const { pet, player, finalDay } = gameStats;
  const metrics = calculateAdvancedMetrics(gameStats);
  
  let recommendations = `PERSONALIZED RECOMMENDATIONS - Pet Life\n`;
  recommendations += `======================================\n\n`;
  
  recommendations += `BASED ON YOUR PERFORMANCE:\n\n`;
  
  // Pet care recommendations
  if (metrics.petCareRating === 'Poor') {
    recommendations += `🐾 PET CARE IMPROVEMENT:\n`;
    recommendations += `• Feed your pet at least 3 times daily\n`;
    recommendations += `• Play with your pet at least 4 times daily\n`;
    recommendations += `• Clean your pet once every day\n`;
    recommendations += `• Visit the vet weekly for optimal health\n\n`;
  } else if (metrics.petCareRating === 'Fair') {
    recommendations += `🐾 PET CARE ENHANCEMENT:\n`;
    recommendations += `• Maintain consistent feeding schedule\n`;
    recommendations += `• Increase play sessions for better mood\n`;
    recommendations += `• Don't forget regular cleaning\n\n`;
  }
  
  // Self-care recommendations
  if (metrics.selfCareRating === 'Poor') {
    recommendations += `👤 SELF-CARE IMPROVEMENT:\n`;
    recommendations += `• Exercise at least once daily (2 hours)\n`;
    recommendations += `• Read regularly to improve mood (1 hour)\n`;
    recommendations += `• Socialize with friends (3 hours)\n`;
    recommendations += `• Aim for 8+ hours of sleep\n\n`;
  } else if (metrics.selfCareRating === 'Fair') {
    recommendations += `👤 SELF-CARE ENHANCEMENT:\n`;
    recommendations += `• Maintain balanced self-care routine\n`;
    recommendations += `• Focus on activities you enjoy most\n`;
    recommendations += `• Keep consistent sleep schedule\n\n`;
  }
  
  // Financial recommendations
  if (player.coins < 20) {
    recommendations += `💰 FINANCIAL IMPROVEMENT:\n`;
    recommendations += `• Complete chores regularly for income\n`;
    recommendations += `• Budget expenses carefully\n`;
    recommendations += `• Prioritize essential purchases\n`;
    recommendations += `• Build emergency fund of 20+ coins\n\n`;
  } else if (player.coins < 50) {
    recommendations += `💰 FINANCIAL OPTIMIZATION:\n`;
    recommendations += `• Maintain healthy coin balance\n`;
    recommendations += `• Consider long-term investments\n`;
    recommendations += `• Balance spending and saving\n\n`;
  }
  
  // Time management recommendations
  if (metrics.efficiencyRate < 70) {
    recommendations += `⏰ TIME MANAGEMENT IMPROVEMENT:\n`;
    recommendations += `• Plan daily activities in advance\n`;
    recommendations += `• Prioritize essential tasks first\n`;
    recommendations += `• Use time-blocking technique\n`;
    recommendations += `• Avoid time-wasting activities\n\n`;
  }
  
  // General recommendations
  recommendations += `🎯 GENERAL TIPS:\n`;
  recommendations += `• Create and follow daily to-do lists\n`;
  recommendations += `• Track your progress regularly\n`;
  recommendations += `• Set achievable daily goals\n`;
  recommendations += `• Celebrate small victories\n`;
  recommendations += `• Learn from mistakes and adjust strategy\n\n`;
  
  recommendations += `📈 NEXT GOALS:\n`;
  if (finalDay < 30) {
    recommendations += `• Survive 30 days with your pet\n`;
    recommendations += `• Achieve A grade performance\n`;
  }
  recommendations += `• Unlock all achievements\n`;
  recommendations += `• Reach 100+ coin balance\n`;
  recommendations += `• Maintain 90%+ consistency\n\n`;
  
  return recommendations;
}

/**
 * Download current report
 */
function downloadReport() {
  const reportContent = document.getElementById("reportPreview").textContent;
  const reportType = document.getElementById("reportType").value;
  const reportFormat = document.getElementById("reportFormat").value;
  
  const blob = new Blob([reportContent], { type: getContentType(reportFormat) });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `pet-life-report-${reportType}-${Date.now()}.${reportFormat}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get content type for format
 * @param {string} format - File format
 * @returns {string} MIME type
 */
function getContentType(format) {
  switch (format) {
    case 'json': return 'application/json';
    case 'csv': return 'text/csv';
    case 'txt': return 'text/plain';
    default: return 'text/plain';
  }
}

/**
 * Share report (placeholder implementation)
 */
function shareReport() {
  const reportContent = document.getElementById("reportPreview").textContent;
  
  // In a real implementation, this would share via email, social media, etc.
  // For now, we'll copy to clipboard
  navigator.clipboard.writeText(reportContent).then(() => {
    alert("Report copied to clipboard! You can now paste and share it.");
  }).catch(() => {
    alert("Unable to copy report. Please copy manually.");
  });
}

/**
 * Export all game data
 */
function exportAllData() {
  if (!gameStats) return;
  
  const exportData = {
    gameStats: gameStats,
    advancedMetrics: calculateAdvancedMetrics(gameStats),
    achievements: achievementSystem,
    chartData: generateChartData(gameStats),
    exportTimestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `pet-life-complete-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== NAVIGATION FUNCTIONS =====

/**
 * Restart the game
 */
function restartGame() {
  // Clear saved stats
  localStorage.removeItem("gameEndStats");
  // Redirect to main game
  if (window.apiNavigation && typeof apiNavigation.goToMainGame === 'function') {
    apiNavigation.goToMainGame();
  } else {
    window.location.href = "index.html";
  }
}

/**
 * View help page
 */
function viewHelp() {
  if (window.apiNavigation && typeof apiNavigation.goToHelp === 'function') {
    apiNavigation.goToHelp();
  } else {
    window.location.href = "help.html";
  }
}

/**
 * Initialize all dashboard views
 */
function initializeViews() {
  console.log("Initializing dashboard views...");
  
  // Initialize overview view
  initializeOverviewView();
  
  // Initialize performance view
  initializePerformanceView();
  
  // Initialize achievements view
  initializeAchievementsView();
  
  // Initialize reports view
  initializeReportsView();
  
  console.log("All views initialized successfully");
}

/**
 * Initialize overview view
 */
function initializeOverviewView() {
  // Overview is already handled by displayStats()
  console.log("Overview view initialized");
}

/**
 * Initialize achievements view
 */
function initializeAchievementsView() {
  if (!achievementSystem) {
    console.log("No achievement system data available");
    return;
  }
  
  console.log("Initializing achievements view with:", achievementSystem);
  
  // Update achievement summary
  const completionRateEl = document.getElementById("achievementCompletion");
  if (completionRateEl) {
    completionRateEl.textContent = achievementSystem.completionRate.toFixed(1) + "%";
  }
  
  const totalAchievementsEl = document.getElementById("totalAchievements");
  if (totalAchievementsEl) {
    totalAchievementsEl.textContent = achievementSystem.total;
  }
  
  const unlockedAchievementsEl = document.getElementById("unlockedAchievements");
  if (unlockedAchievementsEl) {
    unlockedAchievementsEl.textContent = achievementSystem.unlocked.length;
  }
  
  const rareAchievementsEl = document.getElementById("rareAchievements");
  if (rareAchievementsEl) {
    rareAchievementsEl.textContent = achievementSystem.rare;
  }
  
  // Generate achievement cards
  generateAchievementCards();
  
  // Generate milestones
  generateMilestones();
  
  console.log("Achievements view initialized successfully");
}

/**
 * Initialize page when DOM is loaded
 */
window.addEventListener("DOMContentLoaded", () => {
  displayStats();
  
  // Test the showView function
  console.log('Testing showView function...');
  setTimeout(() => {
    console.log('Attempting to switch to performance view...');
    showView('performance');
  }, 2000);
  
  // Initialize tooltips and interactions
  initializeInteractions();
  
  // Add manual chart drawing trigger for debugging
  window.drawChartsManually = function() {
    console.log("=== MANUAL CHART DRAWING TRIGGERED ===");
    drawPerformanceTrends();
    drawActivityDistribution();
  };
  
  // Add window-level chart testing
  window.testCharts = function() {
    console.log("Testing chart elements...");
    const perfCanvas = document.getElementById('performanceChart');
    const actCanvas = document.getElementById('activityChart');
    console.log("Performance canvas:", perfCanvas);
    console.log("Activity canvas:", actCanvas);
    
    if (perfCanvas) {
      console.log("Performance canvas dimensions:", perfCanvas.offsetWidth, "x", perfCanvas.offsetHeight);
      console.log("Performance canvas context:", perfCanvas.getContext('2d'));
      
      // Simple test drawing
      const ctx = perfCanvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(10, 10, 100, 100);
      console.log("Drew red test square on performance chart");
    }
    
    if (actCanvas) {
      console.log("Activity canvas dimensions:", actCanvas.offsetWidth, "x", actCanvas.offsetHeight);
      console.log("Activity canvas context:", actCanvas.getContext('2d'));
      
      // Simple test drawing
      const ctx = actCanvas.getContext('2d');
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(10, 10, 100, 100);
      console.log("Drew green test square on activity chart");
    }
  };
  
  // Add simple chart test
  window.testSimpleChart = function() {
    console.log("=== SIMPLE CHART TEST ===");
    const canvas = document.getElementById('performanceChart');
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    // Clear and draw simple test
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(350, 250);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(50, 50);
    ctx.stroke();
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(100, 150, 50, 50);
    
    console.log("Simple test chart drawn!");
  };
  
  console.log("Manual chart testing available: drawChartsManually(), testCharts(), and testSimpleChart()");
});

/**
 * Initialize interactive elements
 */
function initializeInteractions() {
  // Add hover effects for achievement cards
  document.querySelectorAll('.achievement').forEach(achievement => {
    achievement.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(8px)';
    });
    
    achievement.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(4px)';
    });
  });
  
  // Add click animations for buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
  });
}

// ===== GLOBAL FUNCTION ASSIGNMENTS =====
// Make functions globally available for onclick handlers
window.showView = showView;
window.generateCustomReport = generateCustomReport;
window.generateQuickReport = generateQuickReport;
window.downloadReport = downloadReport;
window.shareReport = shareReport;
window.exportAllData = exportAllData;
