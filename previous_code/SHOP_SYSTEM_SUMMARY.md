# Shop System Implementation Summary

## Overview

The complete shop system has been implemented with three categories of upgrades: Food, Toys, and Add-ons. All features integrate seamlessly with the game mechanics.

## Food Shop (Tier-Based Cost & Energy)

- **Basic Food**: $2 - 5 energy (2.5 energy per dollar)
- **Premium Food**: $5 - 15 energy (3 energy per dollar)
- **Deluxe Food**: $8 - 28 energy (3.5 energy per dollar)
- **Gourmet Food**: $12 - 48 energy (4 energy per dollar)

**Value per Dollar Increases with Tier:**
Higher-priced foods give you better energy efficiency! Premium food costs more upfront but gives you more energy per dollar spent.

## Toy Shop (Play Requirement Reduction)

- **Basic Toy**: $5 - Requires 4 plays/day
- **Standard Toy**: $10 - Reduces to 3 plays/day
- **Premium Toy**: $15 - Reduces to 2 plays/day
- **Deluxe Toy**: $25 - Reduces to only 1 play/day

## Add-Ons (Schedule Feature)

- **To-Do Schedule**: $15 - Unlocks schedule button
  - Easy/Normal: Costs 1 hour per use
  - Hard: Costs 2 hours per use
  - Provides: +5 health, +15 mood

## How It Works

### Purchasing

1. Click **🛒 Shop** button to open sidebar
2. Browse items by category (Food, Toys, Add-ons)
3. Click **Buy** to purchase (if you have enough coins)
4. Owned items show **✓ Owned** (cannot repurchase)
5. Unaffordable items are disabled (grayed out)

### Upgrades Applied Immediately

- **Food Tier**: Changes cost of feeding pet & healing amount
- **Toy Tier**: Reduces daily play requirement in checkPetPlayRequirement()
- **Schedule Feature**: Enables schedule button & scheduling action

### Current Upgrades Display

The bottom of the shop shows:

- 🍖 Food: Current tier
- 🎾 Toy: Current tier
- 📅 Schedule: Locked/Unlocked

## Updated Scoring System

### Balanced Formula (100 point scale)

**Pet Care (0-35 points):**

- Feeding (10): ≥3 feeds per day
- Play/Toys (10): Scaled by toy tier requirement
- Health/Mood (10): Health ≥80 & Happy mood
- Cleaning (5): Cleaned once per week

**Player Care (0-35 points):**

- Sleep (10): ≥8 hours for full points
- Exercise (10): Exercised at least once
- Social (10): Hung out with friends
- Education (5): Read a book
- Health/Mood (5): Player health ≥80 & mood ≥75

**Efficiency (0-20 points):**

- Money Management (10): Coins saved ratio (ratio of unspent coins)
- Time Management (10): Hours productively used (18+ hours = full points)

## Penalties Breakdown

- Pet health <30: -20 points
- Player health <30: -20 points
- Complete neglect (no play/feed/clean): -10 points
- **Maximum penalty: -50 points per day**

**Final Score:** Capped at 100 points max per day

## Integration with Game Mechanics

### Feed Function

- Reads current food tier from FOOD_SHOP array
- Uses tier-appropriate cost
- Applies healing bonus if tier has healing value
- Shows error if insufficient coins

### Play Requirement Check

- Dynamically calculates required plays based on TOY_SHOP tier
- Pet mood decreases if plays < required amount
- Better toys reduce grind significantly

### Schedule Action

- Only available if hasScheduleFeature = true
- Costs time based on difficulty (1-2 hours)
- Provides health and mood boost
- Counts toward daily counters

## Player Data Structure

```javascript
player = {
  // ... existing fields ...

  // Shop system
  foodTier: "basic" | "premium" | "deluxe" | "gourmet",
  toyTier: "basic" | "standard" | "premium" | "deluxe",
  hasScheduleFeature: boolean,
  totalMoneySpent: number,
  hasScheduled: boolean, // daily flag
  timesScheduled: number, // lifetime counter
};
```

## Save/Load Support

All shop upgrades fully integrate with save/load system:

- Upgrades persist across sessions
- Schedule button shows correctly on load if unlocked
- Food/toy tiers remain active

## Testing Commands

Use Debug menu (Ctrl+Shift+C) to test:

```javascript
DEBUG.addCoins(100); // Add coins to test purchases
DEBUG.autoWin(); // Max all stats
DEBUG.resetGame(); // Clear all data
```

---

## Random Events System

Throughout the day, your pet may experience random events that require attention:

### 🤒 Random Sickness

Your pet catches a bug and loses 20 health! You'll get a notification and the pet's mood becomes "Sick". You'll need to visit the vet (costs $10 and 3 hours) to recover.

### 🍽️ Extra Hunger

Your pet gets extra hungry today! You'll need to feed it 2 more times than usual to keep their mood up. Watch your coin spending!

### ⚡ Extra Energy Need

Your pet is extra playful and needs more play sessions than usual. You'll need more play time to keep them entertained.

### Probability

Each day has a 75% chance of a random event:

- 25% chance of sickness
- 25% chance of extra hunger
- 25% chance of extra energy need
- 25% chance of no event

### Notifications

When events occur, you'll see a notification at the top of the screen alerting you to what's happening with your pet.

---
