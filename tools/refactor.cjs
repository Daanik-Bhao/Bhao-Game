const fs = require('fs');
let code = fs.readFileSync('src/lib/gameEngine.ts', 'utf8');

// Replace wealth_change
code = code.replace(
  /players\[sourcePlayerIndex\] = \{ \.\.\.source, wealth: Math\.max\(0, newWealth\), wealthFloor: newFloor \}/g,
  "players = setPlayerWealth(players, sourcePlayerIndex, Math.max(0, newWealth), newFloor, ctx)"
);
code = code.replace(
  /players\[targetPlayerIndex\] = \{ \.\.\.target, wealth: Math\.max\(0, newWealth\), wealthFloor: newFloor \}/g,
  "players = setPlayerWealth(players, targetPlayerIndex, Math.max(0, newWealth), newFloor, ctx)"
);

// Replace wealth_pct
code = code.replace(
  /players\[sourcePlayerIndex\] = \{ \.\.\.source, wealth: clampWealth\(Math\.floor\(source\.wealth \* \(1 \+ pct\)\), source\.wealthFloor\) \}/g,
  "players = setPlayerWealth(players, sourcePlayerIndex, clampWealth(Math.floor(source.wealth * (1 + pct)), source.wealthFloor), source.wealthFloor, ctx)"
);
code = code.replace(
  /players\[targetPlayerIndex\] = \{ \.\.\.target, wealth: clampWealth\(Math\.floor\(target\.wealth \* \(1 \+ pct\)\), target\.wealthFloor\) \}/g,
  "players = setPlayerWealth(players, targetPlayerIndex, clampWealth(Math.floor(target.wealth * (1 + pct)), target.wealthFloor), target.wealthFloor, ctx)"
);

// Replace wealth_end_game
code = code.replace(
  /players\[sourcePlayerIndex\] = \{ \.\.\.source, wealth: clampWealth\(source\.wealth \+ doubled, source\.wealthFloor\) \}/g,
  "players = setPlayerWealth(players, sourcePlayerIndex, clampWealth(source.wealth + doubled, source.wealthFloor), source.wealthFloor, ctx)"
);

// Replace steal
code = code.replace(
  /players\[targetPlayerIndex\] = \{ \.\.\.target, wealth: Math\.max\(0, newWealth\), wealthFloor: newFloor \}\n\s+players\[sourcePlayerIndex\] = \{ \.\.\.source, wealth: source\.wealth \+ actualLoss \}/g,
  "players = setPlayerWealth(players, targetPlayerIndex, Math.max(0, newWealth), newFloor, ctx)\n      players = setPlayerWealth(players, sourcePlayerIndex, source.wealth + actualLoss, source.wealthFloor, ctx)"
);

// Replace attack_all_pct
code = code.replace(
  /return \{ \.\.\.p, wealth: Math\.max\(0, newWealth\), wealthFloor: newFloor \}/g,
  "return setPlayerWealth(players, i, Math.max(0, newWealth), newFloor, ctx)[i]"
);

// Callers of applyEffect
code = code.replace(
  /newState = applyEffect\(newState, card\.effect, playerIndex, i\)/g,
  "newState = applyEffect(newState, card.effect, playerIndex, i, { reason: card.name, desc: card.flavor || '', source: state.players[playerIndex].name })"
);

code = code.replace(
  /newState = applyEffect\(newState, card\.effect, playerIndex, targetIndex\)/g,
  "newState = applyEffect(newState, card.effect, playerIndex, targetIndex, { reason: card.name, desc: card.flavor || '', source: state.players[playerIndex].name })"
);

code = code.replace(
  /let newState = applyEffect\(state, scaledEffect, playerIndex, playerIndex\)/g,
  "let newState = applyEffect(state, scaledEffect, playerIndex, playerIndex, { reason: card.name, desc: card.flavor || '', source: state.players[playerIndex].name })"
);

// processPendingGains
code = code.replace(
  /i === playerIndex \? \{ \.\.\.p, wealth: Math\.max\(0, wealth\), pendingGains: remaining \} : p/g,
  "i === playerIndex ? { ...setPlayerWealth(state.players, playerIndex, Math.max(0, wealth), undefined, { reason: 'Pending Gains', desc: 'Gains have been processed.', source: 'System' })[playerIndex], pendingGains: remaining } : p"
);


fs.writeFileSync('src/lib/gameEngine.ts', code);
