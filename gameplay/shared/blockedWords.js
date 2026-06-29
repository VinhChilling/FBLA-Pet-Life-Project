// ============================================================
// BLOCKED WORDS / CONTENT FILTER
// Centralized profanity and content moderation lists
// ============================================================
// Note: Racial slurs are intentionally excluded from frontend.
// Server-side validation should handle full moderation.
// ============================================================

const BLOCKED_WORDS = {
  // General profanity (common mild to moderate)
  racialSlurs: [
    "nigger", "beaner", "nigga", "niggas", "ching", "chong",
  ],
  profanity: [
    "fuck", "fucking", "fucker", "fucked",
    "shit", "shitty",
    "bitch", "bitches",
    "asshole", "ass",
    "bastard",
    "damn",
    "dick", "dicks",
    "piss",
    "crap", "retard"
  ],

  // Sexual content
  sexual: [
    "sex", "porn", "porno", "nsfw",
    "nude", "nudes", "boob", "boobs",
    "tits", "penis", "vagina", "cum",
    "semen", "orgasm", "xxx",
  ],

  // Explicit / extreme violence
  extreme: [
    "rape", "rapist", "incest", "molest",
    "pedo", "pedophile", "bestiality",
  ],

  // Violence
  violence: [
    "kill", "killing", "murder", "suicide",
    "bomb", "terror", "terrorist",
  ],

  // Drugs
  drugs: [
    "cocaine", "heroin", "meth", "weed",
  ],
};

// Pattern-based checks (safe for frontend)
// These catch common variations without hardcoded offensive words
const PATTERN_CHECKS = [
  { regex: /nazi/i, label: "nazi ideology" },
  { regex: /hitler/i, label: "hitler references" },
];

// Flatten all blocked words into a single searchable array
function getAllBlockedWords() {
  return Object.values(BLOCKED_WORDS).flat();
}

// Export for use in script.js
// (In a real backend, this would be a server API call)
const BANNED_WORDS = getAllBlockedWords();
const HATE_PATTERNS = PATTERN_CHECKS.map(p => p.regex);
