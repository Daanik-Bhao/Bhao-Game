const fs = require('fs');
const path = './src/data/levelCards.ts';
let code = fs.readFileSync(path, 'utf8');

// We will use a regex approach to extract and reorder the options.
// Or actually, this is a large file (2800 lines). It might be safer to replace the empty invest descriptions first.
code = code.replace(/description:\s*"-",/g, 'description: "Invest for potential growth",');

fs.writeFileSync(path, code);
