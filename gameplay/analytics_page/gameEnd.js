// ============================================================
// ADVANCED ANALYTICS DASHBOARD - Comprehensive Game Statistics
// ============================================================

// ===== GLOBAL VARIABLES =====
let gameStats = null;
let currentView = "overview";
let achievementSystem = null;
let isDemoMode = false;
let currentReportContent = "";
let performanceChart = null;
let financialChart = null;
let timeUsageChart = null;
let activityChart = null;
let sleepChart = null;

const DASHBOARD_ASSETS = {
  images: "../../images/",
  fonts: "../../fonts/",
};

const PET_IMAGES = {
  Dog: `${DASHBOARD_ASSETS.images}dog.png`,
  Cat: `${DASHBOARD_ASSETS.images}cat.png`,
  Dragon: `${DASHBOARD_ASSETS.images}dragon.png`,
};

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
 * Sample stats so the dashboard is usable even without a completed game.
 */
function createDemoGameStats() {
  const dailyStats = [];
  for (let day = 1; day <= 10; day += 1) {
    dailyStats.push({
      day,
      pet: {
        health: 70 + day * 2,
        energy: 65 + day,
        mood: day % 2 === 0 ? "Happy" : "Content",
      },
      player: {
        health: 75 + day,
        mood: 70 + day,
        currentPoints: day * 85,
      },
    });
  }

  return {
    pet: {
      name: "Fluffy",
      type: "Dog",
      mood: "Happy",
      energy: 82,
      health: 88,
      timesFed: 32,
      timesPlayed: 41,
      timesCleaned: 10,
      timesVisitedVet: 2,
      timesDoingChores: 8,
      evolutionStage: 2,
      evolutionHistory: [
        { stage: 0, day: 1 },
        { stage: 1, day: 3 },
        { stage: 2, day: 8 },
      ],
    },
    player: {
      name: "Player",
      currentPoints: 850,
      health: 85,
      mood: 80,
      coins: 42,
      expenses: 58,
      avgSleepHours: 7.5,
      timesWorked: 6,
      timesStudied: 4,
      timesExercised: 8,
      timesSlept: 10,
      timesRead: 5,
      timesHangout: 4,
    },
    finalDay: 11,
    endMessage: "Demo data — play a full game to see your real results!",
    dailyStats,
  };
}

function normalizeGameStats(stats) {
  if (stats.pet) {
    stats.pet.timesFed = stats.pet.timesFed || 0;
    stats.pet.timesPlayed = stats.pet.timesPlayed || 0;
    stats.pet.timesCleaned = stats.pet.timesCleaned || 0;
    stats.pet.timesVisitedVet = stats.pet.timesVisitedVet || 0;
    stats.pet.timesDoingChores = stats.pet.timesDoingChores || 0;
    stats.pet.health = stats.pet.health || 0;
    stats.pet.mood = stats.pet.mood || "Happy";
    stats.pet.energy = stats.pet.energy || 0;
    stats.pet.evolutionStage = stats.pet.evolutionStage ?? 0;
    stats.pet.evolutionHistory =
      stats.pet.evolutionHistory || [{ stage: 0, day: 1 }];
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

  if (!Array.isArray(stats.dailyStats)) stats.dailyStats = [];
  return stats;
}

/**
 * Load and validate game statistics from localStorage
 * @returns {Object|null} Game statistics object or null if not found
 */
function loadGameStats() {
  const savedStats = localStorage.getItem("gameEndStats");
  isDemoMode = false;

  if (!savedStats) {
    isDemoMode = true;
    gameStats = normalizeGameStats(createDemoGameStats());
    showDemoBanner(true);
    return gameStats;
  }

  try {
    gameStats = normalizeGameStats(JSON.parse(savedStats));
    showDemoBanner(false);
    return gameStats;
  } catch (error) {
    console.error("Invalid gameEndStats payload:", error);
    isDemoMode = true;
    gameStats = normalizeGameStats(createDemoGameStats());
    showDemoBanner(true);
    return gameStats;
  }
}

function showDemoBanner(show) {
  const banner = document.getElementById("demoBanner");
  if (banner) banner.style.display = show ? "block" : "none";
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
  const daysPlayed = Math.max(1, finalDay - 1);

  const mapMoodToScore = (mood) => {
    if (typeof mood === "number") return mood;
    const moodMap = {
      Happy: 90,
      Content: 80,
      Excited: 95,
      Healthy: 90,
      Sick: 40,
      Hungry: 50,
      Stressed: 45,
      Tired: 55,
    };
    return moodMap[mood] ?? 70;
  };

  let petHealthData = [];
  let petEnergyData = [];
  let playerHealthData = [];
  let playerMoodData = [];
  let scoreData = [];
  let sleepHours = [];

  if (Array.isArray(dailyStats) && dailyStats.length > 0) {
    petHealthData = dailyStats.map((d) => d.pet?.health ?? 0);
    petEnergyData = dailyStats.map((d) => d.pet?.energy ?? 0);
    playerHealthData = dailyStats.map((d) => d.player?.health ?? 0);
    playerMoodData = dailyStats.map((d) => mapMoodToScore(d.player?.mood ?? player.mood));
    scoreData = dailyStats.map((d) => d.player?.currentPoints ?? 0);
    sleepHours = dailyStats.map((d) => d.player?.lastSleepHours ?? (player.avgSleepHours || 0));
  } else {
    const playerMoodFinal = mapMoodToScore(player.mood);
    petHealthData = generateSimulatedData(daysPlayed, 45, 100, pet.health || 50);
    petEnergyData = generateSimulatedData(daysPlayed, 40, 100, pet.energy || 50);
    playerHealthData = generateSimulatedData(daysPlayed, 35, 100, player.health || 50);
    playerMoodData = generateSimulatedData(daysPlayed, 30, 100, playerMoodFinal);
    scoreData = generateSimulatedData(daysPlayed, 0, 150, player.currentPoints || 0);
    sleepHours = generateSimulatedData(daysPlayed, 5, 10, player.avgSleepHours || 7);
  }

  const activityCounts = {
    feeding: pet.timesFed || 0,
    playing: pet.timesPlayed || 0,
    cleaning: pet.timesCleaned || 0,
    vetVisits: pet.timesVisitedVet || 0,
    chores: pet.timesDoingChores || 0,
    exercise: player.timesExercised || 0,
    reading: player.timesRead || 0,
    todo: player.timesScheduled || 0,
    hangout: player.timesHangout || 0,
  };

  const timeUsage = {
    Play: activityCounts.playing * 1,
    Clean: activityCounts.cleaning * 2,
    "Vet Visit": activityCounts.vetVisits * 4,
    Chores: activityCounts.chores * 2,
    "Read Book": activityCounts.reading * 1,
    Exercise: activityCounts.exercise * 2,
    "Create To-Do": activityCounts.todo * 2,
    Hangout: activityCounts.hangout * 3,
  };

  const expenseBreakdown = {
    Feed: (pet.timesFed || 0) * 5,
    Clean: (pet.timesCleaned || 0) * 3,
    "Vet Visit": (pet.timesVisitedVet || 0) * 30,
    Shop: player.totalMoneySpent || 0,
  };

  const expectedExpense = Object.values(expenseBreakdown).reduce((sum, value) => sum + value, 0);
  if ((player.expenses || 0) > expectedExpense) {
    expenseBreakdown.Other = (player.expenses || 0) - expectedExpense;
  }

  return {
    health: petHealthData,
    energy: petEnergyData,
    playerHealth: playerHealthData,
    mood: playerMoodData,
    score: scoreData,
    sleepHours,
    activities: activityCounts,
    timeUsage,
    expenseBreakdown,
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
  if (days <= 0) return [final];

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

function setDashboardText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Switch between different analytics views
 * @param {string} viewName - View name to show
 */
function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.style.display = "none";
    view.classList.remove("active");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const selectedView = document.getElementById(`${viewName}View`);
  const selectedBtn = document.querySelector(`.tab-btn[data-view="${viewName}"]`);

  if (selectedView) {
    selectedView.style.display = "block";
    selectedView.classList.add("active");
  }

  if (selectedBtn) {
    selectedBtn.classList.add("active");
  }

  currentView = viewName;

  if (viewName === "performance") {
    initializePerformanceView();
  } else if (viewName === "achievements") {
    initializeAchievementsView();
  } else if (viewName === "reports") {
    initializeReportsView();
  }
}

/**
 * Display all statistics on the page
 */
function displayStats() {
  const stats = loadGameStats();
  if (!stats) return;

  const { pet, player, finalDay, endMessage } = stats;
  const metrics = calculateAdvancedMetrics(stats);
  achievementSystem = checkAchievements(stats);

  const daysPlayed = Math.max(0, (finalDay || 1) - 1);

  setDashboardText("endMessage", endMessage || "Game complete");
  setDashboardText("finalDay", daysPlayed);
  setDashboardText("playerPoints", player.currentPoints || 0);
  setDashboardText("petName", pet.name || "Unknown");
  setDashboardText("petType", pet.type || "Unknown");
  setDashboardText("playerName", player.name || "Player");
  setDashboardText("petHealth", pet.health || 0);
  setDashboardText("petEnergy", pet.energy || 0);
  setDashboardText("petMood", pet.mood || "Unknown");
  setDashboardText("playerHealth", player.health || 0);
  setDashboardText("playerMood", player.mood || 0);
  setDashboardText("playerCoins", player.coins || 0);
  setDashboardText(
    "avgSleep",
    `${(player.avgSleepHours || 0).toFixed(1)}h`,
  );

  setDashboardText("timesFed", pet.timesFed || 0);
  setDashboardText("timesPlayed", pet.timesPlayed || 0);
  setDashboardText("timesCleaned", pet.timesCleaned || 0);
  setDashboardText("feedCount", pet.timesFed || 0);
  setDashboardText("playCount", pet.timesPlayed || 0);
  setDashboardText("cleanCount", pet.timesCleaned || 0);
  setDashboardText("vetCount", pet.timesVisitedVet || 0);
  setDashboardText("workCount", player.timesWorked || 0);
  setDashboardText("studyCount", player.timesStudied || 0);
  setDashboardText("exerciseCount", player.timesExercised || 0);
  setDashboardText("sleepCount", player.timesSlept || 0);

  setDashboardText("overallGrade", metrics.overallGrade);
  setDashboardText("petCareRating", metrics.petCareRating);
  setDashboardText("selfCareRating", metrics.selfCareRating);

  const stage =
    typeof getEvolutionStage === "function"
      ? getEvolutionStage(pet.evolutionStage ?? 0)
      : null;
  setDashboardText(
    "finalEvolutionStage",
    stage ? `${stage.emoji} ${stage.name}` : "Egg",
  );

  if (typeof renderEvolutionJourney === "function") {
    renderEvolutionJourney(
      pet.evolutionHistory,
      "evolutionJourney",
      pet.type,
      PET_IMAGES,
    );
  }

  updatePetSummaryImage(pet.type, pet.evolutionStage ?? 0);

  generateAdvancedSummary(stats, metrics);
  initializeAchievementsView();
}

function updatePetSummaryImage(petType, stageId) {
  const container = document.getElementById("petSummaryImage");
  if (!container) return;

  if (typeof buildEvolutionImageHtml === "function") {
    container.innerHTML = buildEvolutionImageHtml(
      petType,
      stageId,
      PET_IMAGES,
      "pet-summary-img",
    );
  } else {
    container.innerHTML = `<img src="${PET_IMAGES[petType] || PET_IMAGES.Dog}" alt="${petType}" class="pet-summary-img">`;
  }
}

/**
 * Generate advanced performance summary
 * @param {Object} stats - Game statistics
 * @param {Object} metrics - Advanced metrics
 */
function generateAdvancedSummary(stats, metrics) {
  const { pet, player, finalDay } = stats;
  const summaryEl = document.getElementById("summaryText");
  if (!summaryEl) return;

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
  setDashboardText("avgDailyScore", metrics.avgDailyScore.toFixed(1));
  setDashboardText("peakDay", `Day ${Math.max(1, gameStats.finalDay - 1)}`);
  setDashboardText("improvementRate", metrics.improvementRate);
  setDashboardText("efficiencyScore", `${metrics.efficiencyRate.toFixed(1)}%`);
  setDashboardText("consistencyIndex", `${metrics.consistencyIndex.toFixed(1)}%`);

  const activities = chartData.activities;
  const totalActivities = Object.values(activities).reduce((sum, val) => sum + val, 0);
  setDashboardText("totalActivities", totalActivities);
  
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
  
  setDashboardText("mostFrequent", mostFrequent);
  setDashboardText("leastFrequent", leastFrequent);
  
  // Update progress bars
  updateProgressBar("feedingProgress", "feedingPercent", metrics.feedingConsistency);
  updateProgressBar("playingProgress", "playingPercent", metrics.playingConsistency);
  updateProgressBar("selfCareProgress", "selfCarePercent", metrics.selfCareConsistency);
  
  renderPerformanceChart(chartData);
  renderExpenseChart(gameStats);
  renderTimeUsageChart(gameStats);
  renderSleepChart(gameStats);
  renderActivityChart(gameStats);
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

function prepareCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 640));
  const height = Math.max(220, Math.floor(rect.height || canvas.clientHeight || 320));
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
}

/**
 * Draw simple charts
 * @param {Object} chartData - Chart data
 */
function drawSimpleCharts(chartData) {
  const performanceCanvas = document.getElementById("performanceChart");
  const ctx = prepareCanvas(performanceCanvas);
  if (ctx) {
    drawLineChart(ctx, chartData.health, chartData.mood, chartData.score);
  }
}

/**
 * Render the performance chart with Chart.js
 * @param {Object} chartData - Chart data
 */
function renderPerformanceChart(chartData) {
  const chartElement = document.getElementById("performanceChart");
  if (!chartElement) return;
  const mode = document.getElementById("performanceMode")?.value || "overall";
  const labels = Array.from({ length: Math.max(chartData.health.length, 1) }, (_, index) => `Day ${index + 1}`);
  const filteredLabels = labels.filter((_, index) => index !== 30);

  const colors = {
    health: { border: "#059669", background: "transparent" },
    energy: { border: "#facc15", background: "transparent" },
    mood: { border: "#f97316", background: "transparent" },
    playerHealth: { border: "#ec4899", background: "transparent" },
    score: { border: "#1d4ed8", background: "transparent" },
  };

  const trimDay31 = (data) => data.filter((_, index) => index !== 30);

  const formatPercentSeries = (data) => trimDay31(data).map((value) => Math.min(100, Math.max(0, Math.round(value))));
  
  // Calculate daily earned score as percentage of 100 max daily points
  const calculateDailyScorePercentage = (scoreData) => {
    const dailyEarned = [];
    let previousCumulative = 0;
    
    scoreData.forEach((cumulativeScore, index) => {
      if (index === 0) {
        // First day: earned = cumulative
        dailyEarned.push(Math.min(100, Math.max(0, cumulativeScore)));
      } else {
        // Subsequent days: earned = cumulative - previous cumulative
        const earned = cumulativeScore - previousCumulative;
        dailyEarned.push(Math.min(100, Math.max(0, earned)));
      }
      previousCumulative = cumulativeScore;
    });
    
    return trimDay31(dailyEarned);
  };

  let datasets = [];
  if (mode === "player") {
    datasets = [
      {
        label: "Player Health",
        data: formatPercentSeries(chartData.playerHealth),
        borderColor: colors.playerHealth.border,
        backgroundColor: colors.playerHealth.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Player Mood",
        data: formatPercentSeries(chartData.mood),
        borderColor: colors.mood.border,
        backgroundColor: colors.mood.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
    ];
  } else if (mode === "pet") {
    datasets = [
      {
        label: "Pet Health",
        data: formatPercentSeries(chartData.health),
        borderColor: colors.health.border,
        backgroundColor: colors.health.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Pet Energy",
        data: formatPercentSeries(chartData.energy),
        borderColor: colors.energy.border,
        backgroundColor: colors.energy.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
    ];
  } else {
    datasets = [
      {
        label: "Pet Health",
        data: formatPercentSeries(chartData.health),
        borderColor: colors.health.border,
        backgroundColor: colors.health.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Pet Energy",
        data: formatPercentSeries(chartData.energy),
        borderColor: colors.energy.border,
        backgroundColor: colors.energy.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Player Mood",
        data: formatPercentSeries(chartData.mood),
        borderColor: colors.mood.border,
        backgroundColor: colors.mood.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Player Health",
        data: formatPercentSeries(chartData.playerHealth),
        borderColor: colors.playerHealth.border,
        backgroundColor: colors.playerHealth.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Daily Score %",
        data: calculateDailyScorePercentage(chartData.score),
        borderColor: colors.score.border,
        backgroundColor: colors.score.background,
        tension: 0.35,
        pointRadius: 4,
        fill: false,
      },
    ];
  }

  if (performanceChart) {
    performanceChart.destroy();
    performanceChart = null;
  }

  if (typeof Chart !== "undefined") {
    const ctx = chartElement.getContext("2d");
    performanceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: filteredLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 16,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
            },
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        scales: {
          x: {
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
        },
      },
    });
  } else {
    drawSimpleCharts(chartData);
  }
}

/**
 * Render the financial breakdown chart with Chart.js
 * @param {Object} stats - Game statistics
 */
function renderExpenseChart(stats) {
  const chartElement = document.getElementById("financialChart");
  if (!chartElement) return;

  const chartData = generateChartData(stats);
  const expenseData = chartData.expenseBreakdown || {};
  const labels = Object.keys(expenseData).map((label) => label);
  const values = Object.values(expenseData);
  const backgroundColors = [
    "#2563eb",
    "#f59e0b",
    "#14b8a6",
    "#ef4444",
    "#8b5cf6",
    "#22c55e",
  ];

  if (financialChart) {
    financialChart.destroy();
    financialChart = null;
  }

  if (typeof Chart !== "undefined") {
    const ctx = chartElement.getContext("2d");
    financialChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Coins Spent",
            data: values,
            backgroundColor: labels.map((_, index) => backgroundColors[index % backgroundColors.length]),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: false,
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: $${context.parsed.y}`,
            },
          },
        },
      },
    });
  }
}

/**
 * Render the time usage chart with Chart.js
 * @param {Object} stats - Game statistics
 */
function renderTimeUsageChart(stats) {
  const chartElement = document.getElementById("timeUsageChart");
  if (!chartElement) return;

  const chartData = generateChartData(stats);
  const labels = Object.keys(chartData.timeUsage || {});
  const values = Object.values(chartData.timeUsage || {});

  if (timeUsageChart) {
    timeUsageChart.destroy();
    timeUsageChart = null;
  }

  if (typeof Chart !== "undefined") {
    const ctx = chartElement.getContext("2d");
    timeUsageChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Time Spent (hours)",
            data: values,
            backgroundColor: [
              "#1d4ed8",
              "#ef4444",
              "#a855f7",
              "#22c55e",
              "#14b8a6",
              "#facc15",
              "#ec4899",
              "#fb923c",
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}h`,
            },
          },
        },
      },
      plugins: [
        {
          id: "sliceLabels",
          afterDatasetsDraw(chart) {
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((sum, value) => sum + value, 0);
            if (total <= 0) return;

            const meta = chart.getDatasetMeta(0);
            meta.data.forEach((arc, index) => {
              const value = dataset.data[index];
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              if (percentage <= 0) return;

              const center = arc.getCenterPoint();
              const label = `${percentage}%`;

              chart.ctx.save();
              chart.ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
              chart.ctx.textAlign = "center";
              chart.ctx.textBaseline = "middle";
              chart.ctx.fillStyle = "#ffffff";
              chart.ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
              chart.ctx.lineWidth = 2;
              chart.ctx.strokeText(label, center.x, center.y);
              chart.ctx.fillText(label, center.x, center.y);
              chart.ctx.restore();
            });
          },
        },
      ],
    });
  }
}

function renderSleepChart(stats) {
  const chartElement = document.getElementById("sleepChart");
  if (!chartElement) return;

  const chartData = generateChartData(stats);
  const labels = Array.from({ length: Math.max(chartData.sleepHours.length, 1) }, (_, index) => `Day ${index + 1}`);
  const values = chartData.sleepHours.map((value) => Number(value) || 0);

  if (sleepChart) {
    sleepChart.destroy();
    sleepChart = null;
  }

  if (typeof Chart !== "undefined") {
    const ctx = chartElement.getContext("2d");
    sleepChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Sleep Hours",
            data: values,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.15)",
            tension: 0.35,
            pointRadius: 4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
          y: {
            beginAtZero: true,
            max: 12,
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}h`,
            },
          },
        },
      },
    });
  }
}

/**
 * Render the activity count chart with Chart.js
 * @param {Object} stats - Game statistics
 */
function renderActivityChart(stats) {
  const chartElement = document.getElementById("activityChart");
  if (!chartElement) return;

  const activities = generateChartData(stats).activities || {};
  const labels = Object.keys(activities).map((name) => name.charAt(0).toUpperCase() + name.slice(1));
  const values = Object.values(activities);
  const backgroundColors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#22c55e",
    "#f97316",
    "#8b5cf6",
  ];

  if (activityChart) {
    activityChart.destroy();
    activityChart = null;
  }

  if (!labels.length || values.every((value) => Number(value) === 0)) {
    if (chartElement.parentElement) {
      chartElement.parentElement.style.minHeight = "320px";
      chartElement.parentElement.innerHTML = '<div class="empty-chart-message">No activity counts available yet.</div>';
    }
    return;
  }

  if (typeof Chart !== "undefined") {
    const ctx = chartElement.getContext("2d");
    activityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Activity Count",
            data: values,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderRadius: 10,
            barPercentage: 0.7,
            categoryPercentage: 0.75,
            maxBarThickness: 64,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 40,
              minRotation: 30,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
            },
          },
        },
      },
    });
  }
}

/**
 * Draw line chart
 */
function drawLineChart(ctx, healthData, moodData, scoreData) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  drawAxes(ctx, padding, chartWidth, chartHeight);
  drawDataLine(ctx, healthData, "#10b981", padding, chartWidth, chartHeight);
  drawDataLine(ctx, moodData, "#f59e0b", padding, chartWidth, chartHeight);
  drawDataLine(ctx, scoreData, "#2563eb", padding, chartWidth, chartHeight);
}

/**
 * Draw data line
 */
function drawDataLine(ctx, data, color, padding, chartWidth, chartHeight) {
  if (!Array.isArray(data) || data.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const xStep = chartWidth / (data.length - 1);
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  data.forEach((value, index) => {
    const x = padding + index * xStep;
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
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
 * Generate achievement cards for the achievements tab
 */
function generateAchievementCards() {
  const container = document.getElementById("achievementCards");
  if (!container || !achievementSystem) return;

  const allAchievements = Object.values(ACHIEVEMENTS).flat();
  container.innerHTML = "";

  allAchievements.forEach((achievement) => {
    const isUnlocked = achievementSystem.unlocked.find(
      (a) => a.id === achievement.id,
    );
    const card = document.createElement("div");
    card.className = `achievement ${isUnlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <div class="achievement-info">
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
        <div class="achievement-rarity">${achievement.rarity}</div>
      </div>`;
    container.appendChild(card);
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
    description: `Started your journey with ${pet.name}`,
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
  const reportType = document.getElementById("reportType")?.value || "complete";
  const reportFormat = document.getElementById("reportFormat")?.value || "txt";

  if (!gameStats) return;

  const reportData = generateReportData(reportType, "all");
  const formattedReport = formatReport(reportData, reportFormat, reportType);

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
      
    case "performance":
      return {
        ...baseData,
        performance: calculateAdvancedMetrics(gameStats),
        charts: generateChartData(gameStats),
      };

    case "activities":
      return {
        ...baseData,
        activities: generateChartData(gameStats).activities,
      };

    case "achievements":
      return {
        ...baseData,
        achievements: achievementSystem,
      };

    case "complete":
      return {
        ...baseData,
        overview: calculateAdvancedMetrics(gameStats),
        achievements: achievementSystem,
        performance: generateChartData(gameStats),
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
  const outputFormat = format === "pdf" ? "txt" : format;
  switch (outputFormat) {
    case "json":
      return JSON.stringify(data, null, 2);

    case "csv":
      return formatAsCSV(data, type);

    case "txt":
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
  currentReportContent = report;
  const preview = document.getElementById("reportPreview");
  if (preview) {
    preview.innerHTML = `<pre class="report-preview-text">${escapeHtml(report)}</pre>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
    case "performance":
      report = generateExecutiveSummary();
      break;
    case "activities":
      report = generateDetailedAnalysis();
      break;
    case "achievements":
      report = generateAchievementsReport();
      break;
    case "summary":
      report = generateExecutiveSummary();
      break;
    case "detailed":
      report = generateDetailedAnalysis();
      break;
    case "comparison":
      report = generatePerformanceComparison();
      break;
    case "recommendations":
      report = generateRecommendations();
      break;
  }
  
  displayReportPreview(report);
  showReportActions();
}

/**
 * Generate achievements-focused report
 */
function generateAchievementsReport() {
  if (!gameStats || !achievementSystem) return "No achievement data available.";

  let report = `ACHIEVEMENT REPORT - Pet Life\n`;
  report += `=====================================\n\n`;
  report += `Completion Rate: ${achievementSystem.completionRate.toFixed(1)}%\n`;
  report += `Unlocked: ${achievementSystem.unlocked.length} / ${achievementSystem.total}\n`;
  report += `Rare Unlocked: ${achievementSystem.rare}\n\n`;

  report += `UNLOCKED ACHIEVEMENTS:\n`;
  if (!achievementSystem.unlocked.length) {
    report += `- None yet\n`;
  } else {
    achievementSystem.unlocked.forEach((a) => {
      report += `- ${a.icon} ${a.name} (${a.rarity}): ${a.description}\n`;
    });
  }

  return report;
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
  const reportContent =
    currentReportContent ||
    document.getElementById("reportPreview")?.textContent ||
    "";
  if (!reportContent.trim()) {
    alert("Generate a report first.");
    return;
  }

  const reportType = document.getElementById("reportType")?.value || "complete";
  let reportFormat = document.getElementById("reportFormat")?.value || "txt";
  if (reportFormat === "pdf") reportFormat = "txt";

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
  const reportContent =
    currentReportContent ||
    document.getElementById("reportPreview")?.textContent ||
    "";
  if (!reportContent.trim()) {
    alert("Generate a report first.");
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(reportContent)
      .then(() => alert("Report copied to clipboard! You can now paste and share it."))
      .catch(() => alert("Unable to copy report. Please copy manually."));
  } else {
    alert("Clipboard unavailable. Please copy the report manually.");
  }
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
  localStorage.removeItem("gameEndStats");
  if (window.apiNavigation && typeof apiNavigation.goToEntrance === "function") {
    apiNavigation.goToEntrance();
  } else {
    window.location.href = "../entrance_page/entrance.html";
  }
}

function viewHelp() {
  if (window.apiNavigation && typeof apiNavigation.goToHelp === "function") {
    apiNavigation.goToHelp();
  } else {
    window.location.href = "../help_page/help.html";
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
 * Wire dashboard controls and navigation
 */
function wireDashboardEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  document.getElementById("performanceMode")?.addEventListener("change", () => {
    if (!gameStats) return;
    renderPerformanceChart(generateChartData(gameStats));
  });

  document.getElementById("backBtn")?.addEventListener("click", () => {
    if (window.apiNavigation && typeof apiNavigation.goToEntrance === "function") {
      apiNavigation.goToEntrance();
    } else {
      window.location.href = "../entrance_page/entrance.html";
    }
  });

  document.getElementById("playAgainBtn")?.addEventListener("click", () => {
    localStorage.removeItem("gameEndStats");
    if (window.apiNavigation && typeof apiNavigation.goToEntrance === "function") {
      apiNavigation.goToEntrance();
    } else {
      window.location.href = "../entrance_page/entrance.html";
    }
  });

  document.getElementById("viewHelpBtn")?.addEventListener("click", () => {
    if (window.apiNavigation && typeof apiNavigation.goToHelp === "function") {
      apiNavigation.goToHelp();
    } else {
      window.location.href = "../help_page/help.html";
    }
  });

  document.getElementById("generateReportBtn")?.addEventListener("click", generateCustomReport);

  document.querySelectorAll(".quick-report-btn").forEach((btn) => {
    btn.addEventListener("click", () => generateQuickReport(btn.dataset.reportType));
  });

  document.querySelector("#reportActions .download-btn")?.addEventListener("click", downloadReport);
  document.querySelector("#reportActions .share-btn")?.addEventListener("click", shareReport);
  document.getElementById("exportAllBtn")?.addEventListener("click", exportAllData);
}

window.addEventListener("DOMContentLoaded", () => {
  wireDashboardEvents();
  try {
    displayStats();
    showView("overview");
  } catch (error) {
    console.error("Dashboard initialization error:", error);
  }
  initializeInteractions();
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
window.restartGame = restartGame;
window.viewHelp = viewHelp;
