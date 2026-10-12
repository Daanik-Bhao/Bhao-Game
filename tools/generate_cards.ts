import { DECISION_CARDS, ACTION_CARDS, DEFENSE_CARDS, LEGENDARY_CARDS } from './src/data/cards'
import { LEVEL_SITUATION_CARDS } from './src/data/levelCards'
import fs from 'fs'
import path from 'path'

let md = '# Cards in Paisa War\n\n'

const processCards = (title: string, cards: any[]) => {
  md += `## ${title} (${cards.length} cards)\n\n`
  cards.forEach(card => {
    md += `### ${card.name} [${card.tier || 'common'}]\n`
    if (card.flavor) {
      md += `> ${card.flavor}\n\n`
    }
    if (card.options) {
      md += `**Options:**\n`
      card.options.forEach((opt: any) => {
        md += `- **${opt.label}**: ${opt.description}\n`
      })
      md += '\n'
    } else if (card.effect) {
      md += `**Effect:** ${JSON.stringify(card.effect)}\n\n`
    }
  })
}

processCards('Decision Cards', DECISION_CARDS)
processCards('Level Situation Cards', LEVEL_SITUATION_CARDS)
processCards('Action Cards', ACTION_CARDS)
processCards('Defense Cards', DEFENSE_CARDS)
processCards('Legendary Cards', LEGENDARY_CARDS)

const artifactPath = path.resolve(process.env.HOME || '', '.gemini/antigravity-ide/brain/04b80091-a3b9-4208-968a-ba1b97e866cb', 'card_list.md')
try {
  fs.writeFileSync(artifactPath, md)
  console.log('Successfully wrote card_list.md to artifact dir:', artifactPath)
} catch(e) {
  fs.writeFileSync('card_list.md', md)
  console.log('Wrote card_list.md locally')
}
