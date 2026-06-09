/**
 * Pet evolution stages — shared across entrance, game, help, and analytics.
 * Visuals use CSS scale/filter on the base pet image (no separate sprite files).
 */
const EVOLUTION_STAGES = [
  {
    id: 0,
    name: "Egg",
    emoji: "🥚",
    minDay: 1,
    minHealth: 0,
    scale: 0.55,
    filter: "grayscale(30%) brightness(0.85)",
    description: "A tiny egg — nurture it to hatch!",
  },
  {
    id: 1,
    name: "Baby",
    emoji: "🐣",
    minDay: 1,
    minHealth: 40,
    scale: 0.7,
    filter: "brightness(1.05) saturate(1.1)",
    description: "Your pet has hatched and is full of wonder.",
  },
  {
    id: 2,
    name: "Juvenile",
    emoji: "🌱",
    minDay: 7,
    minHealth: 55,
    scale: 0.85,
    filter: "none",
    description: "Growing strong, curious, and playful.",
  },
  {
    id: 3,
    name: "Adult",
    emoji: "⭐",
    minDay: 15,
    minHealth: 65,
    scale: 1,
    filter: "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.25))",
    description: "Fully grown and thriving with your care.",
  },
  {
    id: 4,
    name: "Legendary",
    emoji: "👑",
    minDay: 25,
    minHealth: 75,
    scale: 1.12,
    filter: "drop-shadow(0 0 14px rgba(234, 179, 8, 0.7)) saturate(1.15)",
    description: "A legendary companion forged by dedication!",
  },
];

function getEvolutionStage(stageId) {
  const id = Number.isFinite(stageId) ? stageId : 0;
  return EVOLUTION_STAGES.find((s) => s.id === id) || EVOLUTION_STAGES[0];
}

function getEvolutionStageForDay(day, health = 100) {
  let best = EVOLUTION_STAGES[0];
  for (const stage of EVOLUTION_STAGES) {
    if (day >= stage.minDay && health >= stage.minHealth) {
      best = stage;
    }
  }
  return best;
}

function getNextEvolutionStage(currentStageId) {
  const next = EVOLUTION_STAGES.find((s) => s.id === currentStageId + 1);
  return next || null;
}

function buildEvolutionImageHtml(petType, stageId, imageMap, className = "pet-main-img") {
  const images = imageMap || {
    Dog: "../../images/dog.png",
    Cat: "../../images/cat.png",
    Dragon: "../../images/dragon.png",
  };
  const stage = getEvolutionStage(stageId);
  const src = images[petType] || images.Dog;
  return `<img src="${src}" alt="${petType} — ${stage.name}" class="${className} evolution-stage-${stage.id}" style="transform:scale(${stage.scale});filter:${stage.filter}">`;
}

function renderEvolutionBadge(stageId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const stage = getEvolutionStage(stageId);
  container.innerHTML = `<span class="evolution-badge" title="${stage.description}">${stage.emoji} ${stage.name}</span>`;
}

function renderEvolutionJourney(history, containerId, petType, imageMap) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reached = Array.isArray(history) && history.length
    ? history
    : [{ stage: 0, day: 1 }];

  container.innerHTML = EVOLUTION_STAGES.map((stage) => {
    const entry = reached.find((h) => h.stage === stage.id);
    const unlocked = Boolean(entry);
    const img = buildEvolutionImageHtml(
      petType || "Dog",
      stage.id,
      imageMap,
      "evolution-journey-img",
    );
    return `
      <div class="evolution-journey-item ${unlocked ? "unlocked" : "locked"}">
        <div class="evolution-journey-visual">${img}</div>
        <div class="evolution-journey-meta">
          <strong>${stage.emoji} ${stage.name}</strong>
          <span>${unlocked ? `Day ${entry.day}` : `Unlocks day ${stage.minDay}+`}</span>
        </div>
      </div>`;
  }).join("");
}

window.EVOLUTION_STAGES = EVOLUTION_STAGES;
window.getEvolutionStage = getEvolutionStage;
window.getEvolutionStageForDay = getEvolutionStageForDay;
window.getNextEvolutionStage = getNextEvolutionStage;
window.buildEvolutionImageHtml = buildEvolutionImageHtml;
window.renderEvolutionBadge = renderEvolutionBadge;
window.renderEvolutionJourney = renderEvolutionJourney;
