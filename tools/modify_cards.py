import json

lines = []
with open('src/data/cards.ts', 'r') as f:
    lines = f.readlines()

def get_block_end(start_line):
    for i in range(start_line, len(lines)):
        if lines[i].startswith("  },"):
            return i
    return start_line

to_remove = [
    "def_premium_cybersecurity_software_171",
    "def_premium_travel_insurance_180",
    "def_comprehensive_pet_insurance_181",
    "def_diversified_portfolio_183",
    "def_extended_manufacturer_warranty_186",
    "def_home_security_cameras_196"
]

remove_indices = []
for i, line in enumerate(lines):
    for c in to_remove:
        if f'id: "{c}"' in line:
            start = i - 1 # the { line
            end = get_block_end(i)
            remove_indices.extend(range(start, end + 1))

# Keep only lines not in remove_indices
new_lines = [line for i, line in enumerate(lines) if i not in remove_indices]

# Now let's append the new decision cards to the end of DECISION_CARDS
decision_cards_str = """  {
    id: "dc_premium_cybersecurity_software_171",
    name: "Premium Cybersecurity Software",
    type: 'decision',
    tier: 'rare',
    flavor: "Cyber attacks are rising. You need to secure your digital wallets.",
    options: [
      { type: 'spend', label: 'Spend', description: "Use the free trial and get hacked.", effect: { type: 'wealth_pct', value: -20, target: 'self' } },
      { type: 'save', label: 'Save', description: "Use strong passwords but no premium software.", effect: { type: 'wealth_pct', value: 5, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Buy the premium software. It blocks a major attack instantly!", effect: { type: 'wealth_pct', value: 20, target: 'self' }, investRisk: 10, failEffect: { type: 'wealth_pct', value: -5, target: 'self' } },
    ],
  },
  {
    id: "dc_premium_travel_insurance_180",
    name: "Premium Travel Insurance",
    type: 'decision',
    tier: 'rare',
    flavor: "You are booking an expensive international trip.",
    options: [
      { type: 'spend', label: 'Spend', description: "Don't buy insurance, and your flight gets cancelled.", effect: { type: 'wealth_pct', value: -20, target: 'self' } },
      { type: 'save', label: 'Save', description: "Buy the basic trip cancellation coverage.", effect: { type: 'wealth_pct', value: 5, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Buy premium insurance. Your lost luggage results in a massive payout!", effect: { type: 'wealth_pct', value: 30, target: 'self' }, investRisk: 20, failEffect: { type: 'wealth_pct', value: -10, target: 'self' } },
    ],
  },
  {
    id: "dc_comprehensive_pet_insurance_181",
    name: "Comprehensive Pet Insurance",
    type: 'decision',
    tier: 'rare',
    flavor: "Your pet needs checkups. You are offered a premium health plan.",
    options: [
      { type: 'spend', label: 'Spend', description: "Decline the plan and get hit with unexpected vet bills.", effect: { type: 'wealth_pct', value: -15, target: 'self' } },
      { type: 'save', label: 'Save', description: "Set aside an emergency fund specifically for the pet.", effect: { type: 'wealth_pct', value: 5, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Buy the comprehensive plan. It covers a major surgery instantly!", effect: { type: 'wealth_pct', value: 25, target: 'self' }, investRisk: 20, failEffect: { type: 'wealth_pct', value: -10, target: 'self' } },
    ],
  },
  {
    id: "dc_diversified_portfolio_183",
    name: "Diversified Portfolio",
    type: 'decision',
    tier: 'epic',
    flavor: "You are reviewing your investments. A guru suggests putting everything in one stock.",
    options: [
      { type: 'spend', label: 'Spend', description: "Buy the guru's risky stock and it crashes.", effect: { type: 'wealth_pct', value: -30, target: 'self' } },
      { type: 'save', label: 'Save', description: "Keep your money in a low-yield savings account.", effect: { type: 'wealth_pct', value: 5, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Build a diversified portfolio. The market surges and you win big!", effect: { type: 'wealth_pct', value: 40, target: 'self' }, investRisk: 30, failEffect: { type: 'wealth_pct', value: -15, target: 'self' } },
    ],
  },
  {
    id: "dc_extended_manufacturer_warranty_186",
    name: "Extended Manufacturer Warranty",
    type: 'decision',
    tier: 'common',
    flavor: "You just bought an expensive appliance. The cashier offers a 5-year warranty.",
    options: [
      { type: 'spend', label: 'Spend', description: "Decline it. The appliance breaks the next week.", effect: { type: 'wealth_pct', value: -15, target: 'self' } },
      { type: 'save', label: 'Save', description: "Set aside the warranty cost in your emergency fund.", effect: { type: 'wealth_pct', value: 5, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Buy the warranty. The appliance is completely replaced with a newer model!", effect: { type: 'wealth_pct', value: 20, target: 'self' }, investRisk: 15, failEffect: { type: 'wealth_pct', value: -10, target: 'self' } },
    ],
  },
  {
    id: "dc_home_security_cameras_196",
    name: "Home Security Cameras",
    type: 'decision',
    tier: 'rare',
    flavor: "Your neighborhood has seen a spike in car vandalism. You consider installing high-definition security cameras.",
    options: [
      { type: 'spend', label: 'Spend', description: "Buy cheap dummy cameras that provide no actual security.", effect: { type: 'wealth_pct', value: -5, target: 'self' } },
      { type: 'save', label: 'Save', description: "Rely on standard locks and hope for the best.", effect: { type: 'wealth_pct', value: 2, target: 'self' } },
      { type: 'invest', label: 'Invest', description: "Buy the premium 4K cameras. They capture a thief instantly and you collect a massive reward!", effect: { type: 'wealth_pct', value: 15, target: 'self' }, investRisk: 15, failEffect: { type: 'wealth_pct', value: -10, target: 'self' } },
    ],
  },
]

export const ACTION_CARDS: GameCard[] = [
"""

final_text = "".join(new_lines)
final_text = final_text.replace("]\n\nexport const ACTION_CARDS: GameCard[] = [", decision_cards_str)

with open('src/data/cards.ts', 'w') as f:
    f.write(final_text)

