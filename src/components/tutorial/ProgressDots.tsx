/** "Lesson n of total" dots. */
export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="tut-dots" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`tut-dot${i + 1 < current ? ' done' : i + 1 === current ? ' now' : ''}`} />
      ))}
    </div>
  )
}
