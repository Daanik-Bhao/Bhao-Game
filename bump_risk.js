const fs = require('fs');

function bumpRisk(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // We want to bump investRisk: 10, 15, etc to 30.
  // Actually, let's just replace `investRisk: \d+` with `investRisk: 30`
  // except if it's already higher than 30.
  
  content = content.replace(/investRisk:\s*(\d+)/g, (match, p1) => {
    const val = parseInt(p1, 10);
    if (val < 30) {
      // Return a random-ish risk between 30 and 40 for variety, or just 30
      return `investRisk: 30`; 
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

bumpRisk('./src/data/cards.ts');
bumpRisk('./src/data/levelCards.ts');
console.log('Bumped investRisk to 30 in data files');
