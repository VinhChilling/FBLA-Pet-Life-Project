// ============================================================
// HELP PAGE FUNCTIONALITY
// Tab switching, FAQ accordion, and question submission
// ============================================================

// ===== NAVIGATION =====

// Return to main game or entrance
function goBack() {
  const hasSave =
    Boolean(localStorage.getItem("petGameSave")) ||
    Boolean(localStorage.getItem("petGameSave_slot1"));

  if (hasSave && window.apiNavigation && typeof apiNavigation.goToLoadGame === "function") {
    apiNavigation.goToLoadGame();
    return;
  }

  if (window.apiNavigation && typeof apiNavigation.goToEntrance === "function") {
    apiNavigation.goToEntrance();
  } else {
    window.location.href = "../entrance_page/entrance.html";
  }
}

// ===== TAB MANAGEMENT =====

// Switch between Game Guide and Q&A tabs
function switchTab(tabName) {
  // Update tab buttons
  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  // Update tab content
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((content) => {
    content.style.display = "none";
    content.classList.remove("active");
  });

  // Find which button was clicked
  const clickedButton = event ? event.target : null;

  // Activate selected tab
  if (clickedButton) {
    clickedButton.classList.add("active");
    clickedButton.setAttribute("aria-selected", "true");
  }

  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.style.display = "block";
    activeContent.classList.add("active");
  }
}

// ===== FAQ ACCORDION =====

// Toggle FAQ answer visibility
function toggleFAQ(button) {
  const answer = button.nextElementSibling;
  const isOpen = button.classList.contains("active");

  if (isOpen) {
    // Close this FAQ
    button.classList.remove("active");
    answer.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  } else {
    // Open this FAQ
    button.classList.add("active");
    answer.classList.add("open");
    button.setAttribute("aria-expanded", "true");
  }
}

// ===== QUESTION SUBMISSION =====

// Handle user question submission with storage
async function submitQuestion() {
  const textarea = document.getElementById("userQuestion");
  const statusDiv = document.getElementById("questionStatus");
  const question = textarea.value.trim();

  // Validate input
  if (!question) {
    showStatus("Please enter a question before submitting.", "error");
    return;
  }

  if (question.length < 10) {
    showStatus(
      "Please enter a more detailed question (at least 10 characters).",
      "error"
    );
    return;
  }

  try {
    const timestamp = Date.now();
    const questionData = {
      text: question,
      timestamp,
      date: new Date().toLocaleDateString(),
    };

    const existing = JSON.parse(localStorage.getItem("petLifeQuestions") || "[]");
    existing.unshift(questionData);
    localStorage.setItem("petLifeQuestions", JSON.stringify(existing.slice(0, 20)));

    showStatus("✓ Question submitted successfully! Thank you for your feedback.", "success");
    textarea.value = "";
    loadUserQuestions();
  } catch (error) {
    console.error("Storage error:", error);
    showStatus("Failed to submit question. Please try again.", "error");
  }
}

// Display status message
function showStatus(message, type) {
  const statusDiv = document.getElementById("questionStatus");
  statusDiv.textContent = message;
  statusDiv.className = `question-status ${type}`;

  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }
}

// ===== LOAD USER QUESTIONS =====

// Load and display community questions from storage
async function loadUserQuestions() {
  const container = document.getElementById("userQuestions");
  if (!container) return;

  try {
    const questions = JSON.parse(localStorage.getItem("petLifeQuestions") || "[]");

    if (!questions.length) {
      container.innerHTML = `
        <h3>Community Questions</h3>
        <p class="no-questions">No community questions yet. Be the first to ask!</p>
      `;
      return;
    }

    container.innerHTML = `
      <h3>Community Questions</h3>
      ${questions
        .map(
          (q) => `
        <div class="user-question">
          <p class="question-text">${escapeHtml(q.text)}</p>
          <span class="question-date">${q.date || ""}</span>
        </div>`,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error loading questions:", error);
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderEvolutionHelpStages() {
  const container = document.getElementById("evolutionStagesHelp");
  if (!container || typeof EVOLUTION_STAGES === "undefined") return;

  container.innerHTML = EVOLUTION_STAGES.map(
    (stage) => `
    <div class="rule-card">
      <h3>${stage.emoji} ${stage.name}</h3>
      <p>${stage.description}</p>
      <p><strong>Unlocks:</strong> Day ${stage.minDay}+ with ${stage.minHealth}+ health</p>
    </div>`,
  ).join("");
}

// ===== INITIALIZATION =====

window.addEventListener("DOMContentLoaded", () => {
  loadUserQuestions();
  renderEvolutionHelpStages();

  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
});
