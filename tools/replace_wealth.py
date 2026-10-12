import re

files = [
    'src/components/game/GameBoardDesktop.tsx',
    'src/components/game/GameBoardMobile.tsx',
    'src/pages/Game.tsx',
    'src/pages/MultiplayerGame.tsx',
    'src/pages/Dashboard.tsx'
]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Add import if not present
    if 'Wealth' not in content and '{formatWealth(' in content:
        if 'components/game' in f:
            content = content.replace("import { formatWealth", "import { Wealth } from '../Wealth';\nimport { formatWealth")
        else:
            content = content.replace("import { formatWealth", "import { Wealth } from '../components/Wealth';\nimport { formatWealth")
    
    # Replace cases like {formatWealth(p.wealth)}
    # Note: be careful about string interpolations like `${formatWealth(x)}` vs JSX `{formatWealth(x)}`
    
    # 1. JSX cases: {formatWealth(expr)} -> <Wealth amount={expr} />
    content = re.sub(r'\{formatWealth\(([^)]+)\)\}', r'<Wealth amount={\1} />', content)
    
    # 2. JSX cases with +/- prefixes
    # {effectVal >= 0 ? '+' : ''}{formatWealth(Math.abs(effectVal))}
    content = re.sub(r'\{([^}]+)\}\s*<Wealth amount=\{([^}]+)\} />', r'<Wealth amount={\2} showPlus={true} />', content)

    with open(f, 'w') as file:
        file.write(content)
