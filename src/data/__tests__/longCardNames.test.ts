import { describe, it, expect } from 'vitest'
import { ALL_CARDS } from '../cards'
import { BUILTIN_LIFE_EVENTS } from '../lifeEvents'

/**
 * Spec §A.2 q2 (P2 content task): hand cards are 70×104 (68×100 under 375 px) and names wrap
 * to at most 3 lines (12 px for long words / long names). These card names were measured in
 * Chrome (/__ux/cards, Baloo 2) and still need more than 3 lines, so each needs a shorter
 * `shortName` / `shortNameHi`. The name box clips instead of overlapping the value.
 * Measured at 390 px (29 en, 14 hi); at 360 px: 39 en, 105 hi.
 */
export const NEEDS_SHORTER_NAME_EN: string[] = [
  "Food Delivery Dependency",
  "Speculative Investment Tip",
  "Paid Upskilling Opportunity",
  "Fronting Money for a Group",
  "Paying for Ambience",
  "Negotiation Opportunity",
  "Lifestyle Inflation Temptation",
  "Social Media Investment Tip",
  "Rent Increase Notification",
  "Major Social Event Expense",
  "Late Night Online Shopping",
  "Missed Credit Card Payment",
  "Destination Wedding Invite",
  "Professional Certification",
  "Leaky Roof Emergency",
  "Hidden App Subscriptions",
  "Lottery Ticket Temptation",
  "Flight Upgrade Temptation",
  "Expensive City Relocation",
  "Unpaid Mental Health Break",
  "Bank Minimum Balance Penalty",
  "Bottle Service Peer Pressure",
  "High-Interest Payday Loan",
  "Skipping Routine Maintenance",
  "Premium Cybersecurity Software",
  "Extended Manufacturer Warranty",
  "The Ultimate Shield: \"Emergency Bailout\"",
  "The Compound Machine",
  "Double-Your-Money Scheme"
]

export const NEEDS_SHORTER_NAME_HI: string[] = [
  "बोनस में शामिल होना/हस्ताक्षर करना",
  "बजट से बाहर सामाजिक यात्रा",
  "दैनिक दोपहर के भोजन का ऑर्डर देना",
  "प्रमुख सामाजिक आयोजन व्यय",
  "वार्षिक बीमा नवीनीकरण",
  "आपातकालीन पशुचिकित्सक विधेयक",
  "टपकती छत का आपातकाल",
  "कम भुगतान किया गया कर आश्चर्य",
  "अवैतनिक मानसिक स्वास्थ्य ब्रेक",
  "पारिवारिक आपातकालीन सहायता",
  "एक व्यवसाय को बूटस्ट्रैपिंग करना",
  "प्रीमियम साइबर सुरक्षा सॉफ्टवेयर",
  "अंतिम ढाल: \"आपातकालीन राहत\"",
  "दिवालियापन ढाल (Bankruptcy Shield)"
]

describe('card names that need a shorter shortName (content task)', () => {
  it('the list only names real cards', () => {
    const titles = new Set([...ALL_CARDS, ...BUILTIN_LIFE_EVENTS].flatMap(c => [c.shortName || c.name, c.shortNameHi || c.nameHi || '']))
    for (const n of [...NEEDS_SHORTER_NAME_EN, ...NEEDS_SHORTER_NAME_HI]) expect(titles.has(n), n).toBe(true)
  })
  for (const n of NEEDS_SHORTER_NAME_EN) it.todo(`en: shorter shortName for "${n}"`)
  for (const n of NEEDS_SHORTER_NAME_HI) it.todo(`hi: shorter shortNameHi for "${n}"`)
})
