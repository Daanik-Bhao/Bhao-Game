/**
 * Soft hyphens (U+00AD) at English syllable boundaries for card names, so a word that can't
 * fit a narrow card breaks as "Equip-ment" / "Diversi-fied" and never as "Equipm-ent".
 * Chrome has no hyphenation dictionary on every platform (and the Android WebView differs from
 * desktop), so the card name uses `hyphens: manual` with these points only.
 *
 * Rules (a small, predictable subset of English syllabification):
 *  - common suffixes split off first: -ing, -ment, -tion/-sion, -ness, -ship, -ful, -less;
 *  - between two vowel groups, the following consonant cluster keeps the longest valid onset
 *    (single consonant, digraph, or consonant + l/r blend): "Sub-scrip-tion", "Port-folio";
 *  - a word-final silent e / -ed (not after t/d) isn't a syllable;
 *  - at least 3 letters stay on each side of a break; words under 7 letters are left alone.
 * EXCEPTIONS overrides words the rules get wrong. Exported for tests.
 */

export const SHY = '\u00AD'
const MIN_SIDE = 3
const MIN_WORD = 7

/** Words the rules split badly: syllables separated by "-" (lowercase). */
const EXCEPTIONS: Record<string, string> = {
  insurance: 'in-sur-ance',
  microtransactions: 'micro-trans-ac-tions',
  microtransaction: 'micro-trans-ac-tion',
  whatsapp: 'whats-app',
  leveraged: 'lev-er-aged',
  rebalance: 're-bal-ance',
  rebalancing: 're-bal-anc-ing',
  delivery: 'de-liv-ery',
  secondary: 'sec-ond-ary',
  ombudsman: 'om-buds-man',
  ironclad: 'iron-clad',
  windfall: 'wind-fall',
  paycheck: 'pay-check',
  takeover: 'take-over',
  bailout: 'bail-out',
  burnout: 'burn-out',
  workout: 'work-out',
  checkup: 'check-up',
  startup: 'start-up',
  textbook: 'text-book',
  weekend: 'week-end',
  dashcam: 'dash-cam',
  smartphone: 'smart-phone',
  software: 'soft-ware',
  youtube: 'you-tube',
  telegram: 'tele-gram',
  lifestyle: 'life-style',
  passion: 'pas-sion',
  upcoming: 'up-com-ing',
  freelance: 'free-lance',
  antivirus: 'anti-virus',
  cybersecurity: 'cyber-secu-rity',
  furniture: 'fur-ni-ture',
  baggage: 'bag-gage',
  savings: 'sav-ings',
  experience: 'ex-pe-ri-ence',
  inheritance: 'in-her-i-tance',
  inflation: 'in-fla-tion',
  colleague: 'col-league',
  airport: 'air-port',
  doubler: 'dou-bler',
  trending: 'trend-ing',
  cameras: 'cam-eras',
  coverage: 'cov-er-age',
  industry: 'in-dus-try',
  designer: 'de-sign-er',
  manager: 'man-ag-er',
  upskilling: 'up-skill-ing',
  renewal: 're-new-al',
  retainer: 're-tain-er',
  trainer: 'train-er',
  floater: 'float-er',
  scalper: 'scalp-er',
  footage: 'foot-age',
  failure: 'fail-ure',
  valuables: 'valu-ables',
  bombarded: 'bom-bard-ed',
  extended: 'ex-tend-ed',
  trusted: 'trust-ed',
  unexpected: 'un-ex-pect-ed',
  problem: 'prob-lem',
  property: 'prop-er-ty',
  interest: 'in-ter-est',
  personal: 'per-son-al',
  professional: 'pro-fes-sion-al',
  severance: 'sev-er-ance',
  speculative: 'spec-u-la-tive',
  stationery: 'sta-tion-ery',
  charity: 'char-i-ty',
  credits: 'cred-its',
  guarantee: 'guar-an-tee',
}

const VOWEL = /[aeiouy]/
/** Consonant groups that start a syllable together (besides a single consonant). */
const ONSETS = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'wr', 'qu',
  'ch', 'sh', 'th', 'ph', 'wh', 'gh', 'chr', 'thr', 'shr', 'scr', 'spr', 'str', 'spl', 'sch',
])
const SUFFIXES = ['ing', 'ment', 'ments', 'tion', 'tions', 'sion', 'sions', 'ness', 'ship', 'ships', 'ful', 'less']

const isVowel = (w: string, i: number) => {
  const ch = w[i]
  if (ch === 'y') return i > 0 // "y" is a consonant only at the start of a word
  if (ch === 'u' && i > 0 && w[i - 1] === 'q') return false // "qu" is a consonant pair
  return VOWEL.test(ch)
}

/** Break offsets (characters before the break) for a lowercase word, rule-based. */
function ruleBreaks(w: string): number[] {
  // Suffix first: "spend|ing", "equip|ment", "vaca|tion" (doubled consonant splits: "plan|ning").
  for (const s of SUFFIXES) {
    if (w.length - s.length >= MIN_SIDE && w.endsWith(s)) {
      let cut = w.length - s.length
      const stem = w.slice(0, cut)
      if (s === 'ing' && /([bcdfgkmnprtvz])\1$/.test(stem)) cut -= 1
      // "-tion": the syllable is "-tion"; "-sion" after s ("pas|sion") is handled the same way
      return [...ruleBreaks(w.slice(0, cut)).filter(b => b < cut), cut]
    }
  }
  // Vowel groups (a silent final e / non-syllabic -ed don't count).
  let end = w.length
  if (/[^aeiouy]e$/.test(w) && !/[^aeiouy]le$/.test(w)) end -= 1
  else if (/[^aeiouytd]ed$/.test(w)) end -= 2
  const groups: Array<[number, number]> = []
  for (let i = 0; i < end; i++) {
    if (!isVowel(w, i)) continue
    const start = i
    while (i + 1 < end && isVowel(w, i + 1)) i++
    groups.push([start, i + 1])
  }
  const breaks: number[] = []
  for (let g = 0; g + 1 < groups.length; g++) {
    const cs = groups[g][1]
    const ce = groups[g + 1][0]
    const cluster = w.slice(cs, ce)
    if (cluster.length === 0) continue
    if (cluster === 'x') { breaks.push(ce); continue } // ex|am
    if (cluster === 'ck') { breaks.push(ce); continue } // check|up
    // Longest valid onset at the end of the cluster: "sub|scrip|tion", "port|folio", "mas|ter".
    let onset = 1
    for (let k = Math.min(3, cluster.length); k >= 2; k--) {
      if (ONSETS.has(cluster.slice(-k))) { onset = k; break }
    }
    breaks.push(ce - onset)
  }
  return breaks
}

function breaksFor(w: string): number[] {
  const lower = w.toLowerCase()
  const ex = EXCEPTIONS[lower]
  let pts: number[]
  if (ex) {
    pts = []
    let n = 0
    for (const part of ex.split('-').slice(0, -1)) { n += part.length; pts.push(n) }
  } else {
    pts = ruleBreaks(lower)
  }
  return pts.filter(p => p >= MIN_SIDE && w.length - p >= MIN_SIDE)
}

/** One Latin word with soft hyphens at its syllable points ("Retire-ment", with U+00AD as the "-"). */
export function hyphenateWord(w: string): string {
  if (w.length < MIN_WORD) return w
  const pts = new Set(breaksFor(w))
  let out = ''
  for (let i = 0; i < w.length; i++) {
    if (pts.has(i)) out += SHY
    out += w[i]
  }
  return out
}

/**
 * Card-name text with soft hyphens in long Latin words and a break opportunity (U+200B) after
 * "/" (so "Joining/Signing" can wrap after the slash). Other scripts are left untouched.
 */
export function hyphenateText(text: string): string {
  return text.replace(/[A-Za-z]+/g, hyphenateWord).replace(/\/(?=\S)/g, '/\u200B')
}
