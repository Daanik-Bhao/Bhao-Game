/** Renders a sentence with every ₹ amount in the tabular number font (optionally coloured). */
export function RupeeText({ text, tone }: { text: string; tone?: 'loss' | 'gain' }) {
  const parts = text.split(/([−-]?₹\s?[\d,.]+(?:\s?(?:lakh|crore|L|Cr|K|लाख|करोड़))?)/g)
  return (
    <>
      {parts.map((p, i) => (/₹/.test(p)
        ? <b key={i} className={`num${tone ? ` ${tone}` : ''}`}>{p}</b>
        : <span key={i}>{p}</span>))}
    </>
  )
}
