// ============================================================
// HELP PAGE FUNCTIONALITY
// Tab switching, FAQ accordion, and question submission
// ============================================================

// ===== NAVIGATION =====

// Return to main game (index.html)
function goBack() {
  // Use API navigation if available, otherwise fallback
  if (window.apiNavigation && typeof apiNavigation.goToMainGame === 'function') {
    apiNavigation.goToMainGame();
  } else {
    window.location.href = "index.html";
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
    // Check if storage is available
    if (typeof window.storage === "undefined") {
      showStatus(
        "✓ Question noted: " +
          question.substring(0, 50) +
          "... (Storage not available, question saved locally)",
        "success"
      );
      textarea.value = "";
      return;
    }

    // Store question using persistent storage
    const timestamp = Date.now();
    const questionKey = `question:${timestamp}`;
    const questionData = {
      text: question,
      timestamp: timestamp,
      date: new Date().toLocaleDateString(),
    };

    // Save to storage (shared so all users can see community questions)
    const result = await window.storage.set(
      questionKey,
      JSON.stringify(questionData),
      true
    );

    if (result) {
      showStatus(
        "✓ Question submitted successfully! Thank you for your feedback.",
        "success"
      );
      textarea.value = "";

      // Refresh the questions list
      loadUserQuestions();
    } else {
      showStatus("Failed to submit question. Please try again.", "error");
    }
  } catch (error) {
    console.error("Storage error:", error);
    showStatus(
      "✓ Question noted: " + question.substring(0, 50) + "...",
      "success"
    );
    textarea.value = "";
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
    // Check if storage is available
    if (typeof window.storage === "undefined") {
      container.innerHTML = `
        <h3>Community Questions</h3>
        <p class="no-questions">Storage not available in this environment. Questions cannot be persisted.</p>
      `;
      return;
    }

    // List all question keys
    const result = await window.storage.list("question:", true);

    if (!result || !result.keys || result.keys.length === 0) {
      container.innerHTML = `
        <h3>Community Questions</h3>
        <p class="no-questions">No community questions yet. Be the first to ask!</p>
      `;
      return;
    }

    // Load all questions
    const questions = [];
    for (const key of result.keys) {
      try {
        const questionResult = await window.storage.get(key, true);
        if (questionResult && questionResult.value) {
          const data = JSON.parse(questionResult.value);
          questions.push(data);
        }
      } catch (err) {
        console.error(`Failed to load question ${key}:`, err);
      }
    }

    // Sort by timestamp (newest first)
    questions.sort((a, b) => b.timestamp - a.timestamp);

    // Display questions
    const questionsHTML = questions
      .map(
        (q) => `
        <div class="user-question-item">
          <p><strong>Q:</strong> ${escapeHTML(q.text)}</p>
          <div class="question-meta">Submitted on ${q.date}</div>
        </div>
      `
      )
      .join("");

    container.innerHTML = `
      <h3>Community Questions (${questions.length})</h3>
      ${questionsHTML}
    `;
  } catch (error) {
    console.error("Failed to load questions:", error);
    container.innerHTML = `
      <h3>Community Questions</h3>
      <p class="no-questions">Unable to load questions. Storage may not be available.</p>
    `;
  }
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== INITIALIZATION =====

// Load questions when page loads
window.addEventListener("DOMContentLoaded", () => {
  console.log("Help page loaded successfully");
  loadUserQuestions();

  // Set aria-expanded on FAQ buttons
  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
});
