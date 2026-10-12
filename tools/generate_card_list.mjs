import { readFileSync, writeFileSync } from 'fs'

// We will just read the TS file and parse it using regex for simplicity 
// since running ts-node might fail if not installed or due to ESM issues.

const fileContent = readFileSync('src/data/cards.ts', 'utf-8');

let markdown = '# All Cards in Paisa War\n\n';

const extractCards = (arrayName, title) => {
  markdown += `## ${title}\n\n`;
  const regex = new RegExp(`export const ${arrayName}: GameCard\\[\\] = \\[([\\s\\S]*?)\\];?\\n\\nexport`, 'g');
  // Since parsing the raw AST is hard, let's just use a simple state machine or regex to grab names and descriptions.
  
  // simpler way: grep through the file.
}

