import { describe, it, expect } from 'vitest'

// Paths are kept in variables so TypeScript does not try to resolve the untyped .mjs/.js files.
const SCRIPT = '../../../scripts/build-functions.mjs'
const BUNDLE = '../../../supabase/functions/_shared/engine.js'

describe('supabase/functions/_shared/engine.js', () => {
  it('matches a fresh build of src/lib/multiplayerAuthority.ts (run `node scripts/build-functions.mjs`)', async () => {
    const script = await import(/* @vite-ignore */ SCRIPT)
    expect(await script.isBundleUpToDate()).toBe(true)
  }, 30_000)

  it('runs a turn from the bundled engine', async () => {
    const engine = await import(/* @vite-ignore */ BUNDLE)
    const now = Date.now()
    const s = engine.buildInitialMultiplayerState([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 'standard', now)
    const r = engine.applyPlayerAction(s, 'a', { type: 'draw' }, now)
    expect(r.error).toBeUndefined()
    expect(r.state.players[0].hand.length).toBe(5)
    expect(engine.publicState(r.state).players[0].hand).toEqual([])
  })
})
