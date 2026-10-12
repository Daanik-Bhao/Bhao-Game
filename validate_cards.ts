import { ALL_CARDS } from './src/data/cards';
import { LEVEL_SITUATION_CARDS } from './src/data/levelCards';

const errors = [];
const allCardsCombined = [...ALL_CARDS, ...LEVEL_SITUATION_CARDS];

// 1. Check for Duplicate IDs
const idMap = new Map();
allCardsCombined.forEach(card => {
  if (idMap.has(card.id)) {
    errors.push(`Duplicate ID found: ${card.id} (used in ${idMap.get(card.id).name} and ${card.name})`);
  }
  idMap.set(card.id, card);
});

// 2. Validate Decision Cards
allCardsCombined.filter(c => c.type === 'decision').forEach(card => {
  if (!card.options || card.options.length === 0) {
    errors.push(`Decision card missing options: ${card.id}`);
  } else {
    card.options.forEach(opt => {
      if (opt.investRisk && opt.investRisk > 0 && !opt.failEffect) {
        errors.push(`Decision card ${card.id} option ${opt.type} has risk but no failEffect.`);
      }
    });
  }
});

// 3. Validate Defense Cards
const actionCardNames = allCardsCombined.filter(c => c.type === 'action').map(c => c.name);
allCardsCombined.filter(c => c.type === 'defense').forEach(card => {
  if (card.effect?.type === 'block_card' && card.effect.blocks) {
    card.effect.blocks.forEach(block => {
      if (block !== 'any' && block !== 'Defense Effect:' && !actionCardNames.includes(block)) {
        errors.push(`Defense card ${card.id} blocks unknown action: "${block}"`);
      }
    });
  }
});

if (errors.length > 0) {
  console.log("Found Conflicts/Errors:");
  errors.forEach(e => console.log("- " + e));
} else {
  console.log("No conflicts found! The card catalog is structurally perfect.");
}
