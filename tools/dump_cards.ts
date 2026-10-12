import fs from 'fs';
import { ALL_CARDS } from './src/data/cards';
import { LEVEL_SITUATION_CARDS } from './src/data/levelCards';

function formatEffect(effect: any) {
  if (!effect) return 'None';
  if (effect.type === 'wealth_pct') return `Wealth: ${effect.value > 0 ? '+' : ''}${effect.value}%`;
  if (effect.type === 'wealth_change') return `Wealth: ${effect.value > 0 ? '+' : ''}₹${effect.value.toLocaleString()}`;
  if (effect.type === 'block_card') return `Blocks: ${effect.blocks?.join(', ')}`;
  if (effect.type === 'attack_all_pct') return `All lose ${effect.value}%`;
  if (effect.type === 'market_crash_player') return `Target loses ${effect.value}%`;
  return effect.type;
}

let md = `# Complete Card Catalog

This document contains a full list of all cards in the game.

## Multiplayer / Standard Cards (210 Cards)
These cards are used in the standard game mode.

| Name | Type | Tier | Effect / Features |
|---|---|---|---|
`;

ALL_CARDS.forEach(card => {
  let featureStr = '';
  if (card.type === 'decision') {
    featureStr = card.options?.map(o => `**${o.label}**: ${formatEffect(o.effect)}${o.investRisk ? ` (Risk: ${o.investRisk}%)` : ''}`).join(' <br> ') || '';
  } else {
    featureStr = formatEffect(card.effect);
  }
  md += `| ${card.name} | ${card.type.toUpperCase()} | ${card.tier.toUpperCase()} | ${featureStr} |\n`;
});

md += `

## Campaign Mode Exclusive Cards (83 Cards)
These decision cards are exclusive to Campaign Mode levels.

| Name | Level | Type | Tier | Effect / Features |
|---|---|---|---|---|
`;

LEVEL_SITUATION_CARDS.forEach(card => {
  const featureStr = card.options?.map(o => `**${o.label}**: ${formatEffect(o.effect)}${o.investRisk ? ` (Risk: ${o.investRisk}%)` : ''}`).join(' <br> ') || '';
  
  let level = "Unknown";
  const num = parseInt(card.id.replace('dc_s-', ''));
  if (num <= 15) level = "Level 1";
  else if (num <= 35) level = "Level 2";
  else if (num <= 58) level = "Level 3";
  else level = "Level 4";

  md += `| ${card.name} | ${level} | ${card.type.toUpperCase()} | ${card.tier.toUpperCase()} | ${featureStr} |\n`;
});

fs.writeFileSync('/Users/sagaragarwal/.gemini/antigravity-ide/brain/865a4d2f-aa03-4a3a-bd2b-14975b0ef2e4/card_catalog.md', md);
