import { ALL_CARDS } from './src/data/cards';
import { LEVEL_SITUATION_CARDS } from './src/data/levelCards';

const allDecisions = ALL_CARDS.filter(c => c.type === 'decision');
const standardIds = allDecisions.map(c => c.id);

// We need 36 per level, 5 overlap.
// Level 1: 15 from LEVEL_SITUATION_CARDS (0-14) + 21 standard
// Level 2: 5 from L1 + 20 from LEVEL_SITUATION_CARDS (15-34) + 11 standard
// Level 3: 5 from L2 + 23 from LEVEL_SITUATION_CARDS (35-57) + 8 standard
// Level 4: 5 from L3 + 31 standard

let sIdx = 0;

const l1_sit = LEVEL_SITUATION_CARDS.slice(0, 15).map(c => c.id);
const l1_std = standardIds.slice(sIdx, sIdx + 21);
sIdx += 21;
const l1 = [...l1_sit, ...l1_std];

const l2_overlap = l1.slice(-5);
const l2_sit = LEVEL_SITUATION_CARDS.slice(15, 35).map(c => c.id);
const l2_std = standardIds.slice(sIdx, sIdx + 11);
sIdx += 11;
const l2 = [...l2_overlap, ...l2_sit, ...l2_std];

const l3_overlap = l2.slice(-5);
const l3_sit = LEVEL_SITUATION_CARDS.slice(35, 58).map(c => c.id);
const l3_std = standardIds.slice(sIdx, sIdx + 8);
sIdx += 8;
const l3 = [...l3_overlap, ...l3_sit, ...l3_std];

const l4_overlap = l3.slice(-5);
// L4 has no situation cards left right now, wait, LEVEL_SITUATION_CARDS has 83 total. 
// We used up to index 57 (58 cards). So there are 83 - 58 = 25 campaign cards left for level 4!
const l4_sit = LEVEL_SITUATION_CARDS.slice(58, 83).map(c => c.id); // 25 cards
const l4_std = standardIds.slice(sIdx, sIdx + 6); // We need 31 total, 25 are sit, so 6 standard.
sIdx += 6;
const l4 = [...l4_overlap, ...l4_sit, ...l4_std];

console.log(`Level 1 length: ${l1.length}`);
console.log(`Level 2 length: ${l2.length}`);
console.log(`Level 3 length: ${l3.length}`);
console.log(`Level 4 length: ${l4.length}`);

import fs from 'fs';
fs.writeFileSync('level_ids.json', JSON.stringify({l1, l2, l3, l4}, null, 2));

