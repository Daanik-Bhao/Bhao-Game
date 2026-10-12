const fs = require('fs');

const path = './src/data/levelCards.ts';
let content = fs.readFileSync(path, 'utf8');

// Extract the JSON array
const startIdx = content.indexOf('[');
const endIdx = content.lastIndexOf(']');
const arrayStr = content.substring(startIdx, endIdx + 1);

let cards;
try {
  // It's technically JS, so we might need to eval it if it's not strict JSON
  // Let's replace the export with an assignment and eval it
  eval(`cards = ${arrayStr}`);
} catch (e) {
  console.error("Failed to parse cards array", e);
  process.exit(1);
}

// 1. Add mentorInsights to all existing cards
cards = cards.map(card => {
  if (!card.mentorInsight) {
    if (card.options) {
      card.options.forEach(opt => {
        if (!opt.mentorInsight) {
          if (opt.type === 'save') opt.mentorInsight = "Saving builds the foundation of your wealth. A safe and reliable choice.";
          if (opt.type === 'spend') opt.mentorInsight = "Immediate gratification feels good now, but it delays your long-term goals.";
          if (opt.type === 'invest') opt.mentorInsight = "Investing puts your money to work. Risk is involved, but so is growth.";
        }
      });
    } else {
      card.mentorInsight = "Every financial decision shapes your future.";
    }
  }
  return card;
});

// 2. Refactor Level 2 cards (add Subscription traps, Red cards)
// Level 2 cards are 16 to 35. Let's modify a couple to be Red cards.
const l2Red1 = {
  id: "dc_s-034",
  name: "Latest Smartphone EMI",
  type: "red",
  tier: "epic",
  flavor: "Everyone has the new phone. You can get it on EMI!",
  debtAmount: 50000,
  interestRate: 0.12,
  tenorMonths: 6,
  mentorInsight: "Taking debt for a depreciating asset like a phone is a classic wealth trap.",
  options: [
    { type: 'spend', label: "Take EMI", description: "Get ₹50,000 now, pay EMI", effect: { type: 'wealth_change', value: 50000, target: 'self' }, mentorInsight: "You just took a loan for a phone. The interest will bleed your wealth." },
    { type: 'save', label: "Decline", description: "Use old phone", effect: { type: 'wealth_change', value: 0, target: 'self' }, mentorInsight: "Great discipline! Delaying gratification keeps you debt-free." }
  ]
};

const l2Red2 = {
  id: "dc_s-035",
  name: "Gym Annual Subscription",
  type: "red",
  tier: "rare",
  flavor: "Huge discount on annual gym membership if you pay via credit card EMI.",
  debtAmount: 20000,
  interestRate: 0.15,
  tenorMonths: 12,
  mentorInsight: "Subscription traps often look like discounts. Be careful with EMIs.",
  options: [
    { type: 'invest', label: "Take EMI", description: "Get ₹20,000 for gym", effect: { type: 'wealth_change', value: 20000, target: 'self' }, mentorInsight: "Fitness is good, but paying 15% interest for a gym you might not visit is bad." },
    { type: 'save', label: "Decline", description: "Workout at home", effect: { type: 'wealth_change', value: 0, target: 'self' }, mentorInsight: "Smart choice. You avoided a subscription trap." }
  ]
};

// Replace card 34 and 35 with our Red Cards
const idx34 = cards.findIndex(c => c.id === 'dc_s-034');
if (idx34 >= 0) cards[idx34] = l2Red1;
const idx35 = cards.findIndex(c => c.id === 'dc_s-035');
if (idx35 >= 0) cards[idx35] = l2Red2;

// 3. Create Level 4 (Grihastha Dharma) 25-card set
for (let i = 59; i <= 83; i++) {
  const id = `dc_s-${String(i).padStart(3, '0')}`;
  cards.push({
    id,
    name: `L4 Event ${i}`,
    type: "decision",
    tier: i % 5 === 0 ? "epic" : (i % 3 === 0 ? "rare" : "common"),
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    options: [
      { type: 'save', label: "Conservative", description: "Safe but slow", effect: { type: 'wealth_change', value: 50000, target: 'self' }, mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital." },
      { type: 'invest', label: "Aggressive", description: "High risk, high reward", effect: { type: 'wealth_change', value: 0, target: 'self' }, mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify." },
      { type: 'spend', label: "Lifestyle Up", description: "Enjoy the wealth", effect: { type: 'wealth_change', value: -100000, target: 'self' }, mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful." }
    ]
  });
}

// Write back to file
const newContent = `import type { GameCard } from '../types/game'\n\nexport const LEVEL_SITUATION_CARDS: GameCard[] = ${JSON.stringify(cards, null, 2)}`;
fs.writeFileSync(path, newContent, 'utf8');

console.log("Successfully updated levelCards.ts with Mentor Insights, Red Cards, and Level 4 cards.");
