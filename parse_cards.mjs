import fs from 'fs'

const cardMdContent = fs.readFileSync('card.md', 'utf-8')
const lines = cardMdContent.split('\n')

const parsedCards = []
let parsingTable = false
let currentCategory = ''

for (const line of lines) {
  if (line.includes('SCHOOL LIFE')) currentCategory = 'School Life'
  else if (line.includes('COLLEGE DAYS')) currentCategory = 'College Days'
  else if (line.includes('FIRST JOB')) currentCategory = 'First Job'

  if (line.replace(/\s+/g, '').includes('|**#**|**💡CardName**|')) {
    parsingTable = true
    continue
  }
  if (parsingTable && line.startsWith('| ---')) continue
  if (parsingTable && line.trim() === '') {
     parsingTable = false
     continue
  }
  
  if (parsingTable && line.startsWith('|')) {
    const parts = line.split('|').map(p => p.trim())
    if (parts.length >= 8) {
      const id = parts[1].replace(/\*/g, '')
      if (!id.startsWith('S-')) {
        continue
      }
      
      const num = parseInt(id.split('-')[1])
      if (num > 58) {
        continue // We only need up to S-058 for first 3 levels
      }

      const name = parts[2].replace(/\*/g, '').replace('💡 ', '')
      const flavor = parts[3].replace(/_/g, '')
      const saveOutcomeRaw = parts[4]
      const investOutcomeRaw = parts[5]
      const spendOutcomeRaw = parts[6]
      const lesson = parts[7].replace(/_/g, '')
      
      const parseEffect = (outcome) => {
        const text = outcome.replace(/\*/g, '').replace(/\\/g, '')
        if (text === '-') return { type: 'wealth_change', value: 0, target: 'self' }
        const match = text.match(/[-+]\u20b9?([\d,]+)/) // Match +₹300 or -₹500 or +300
        let val = 0
        if (match) {
          val = parseInt(match[1].replace(/,/g, ''))
          if (text.includes('-')) val = -val
        } else if (text.toLowerCase().includes('save') && text.match(/([\d,]+)/)) {
           val = parseInt(text.match(/([\d,]+)/)[1].replace(/,/g, ''))
        }
        
        if (val === 0 && text.toLowerCase().includes('skip')) val = 0
        if (val === 0 && text.toLowerCase().includes('borrow')) val = -500 
        if (isNaN(val)) val = 0
        return { type: 'wealth_change', value: val, target: 'self' }
      }

      parsedCards.push({
        id: `dc_${id.toLowerCase()}`,
        name: name,
        type: 'decision',
        tier: 'common',
        flavor: flavor + (lesson ? ` (${lesson})` : ''),
        options: [
          { type: 'save', label: 'Save', description: saveOutcomeRaw.replace(/\*/g, '').replace(/\\/g, ''), effect: parseEffect(saveOutcomeRaw) },
          { type: 'invest', label: 'Invest', description: investOutcomeRaw.replace(/\*/g, '').replace(/\\/g, ''), effect: parseEffect(investOutcomeRaw) },
          { type: 'spend', label: 'Spend', description: spendOutcomeRaw.replace(/\*/g, '').replace(/\\/g, ''), effect: parseEffect(spendOutcomeRaw) }
        ]
      })
    }
  }
}

const fileContent = `import type { GameCard } from '../types/game'

export const LEVEL_SITUATION_CARDS: GameCard[] = ${JSON.stringify(parsedCards, null, 2)}
`

fs.writeFileSync('src/data/levelCards.ts', fileContent)
console.log(`Parsed ${parsedCards.length} cards and wrote to src/data/levelCards.ts`)
