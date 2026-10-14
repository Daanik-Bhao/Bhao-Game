import { describe, expect, it } from 'vitest'
import { AVATAR_OPTIONS, AVATAR_PRESETS, avatarValue, resolveAvatar } from '../avatarPresets'

describe('resolveAvatar', () => {
  it('resolves preset values', () => {
    for (const p of AVATAR_PRESETS) expect(resolveAvatar(avatarValue(p.id))).toBe(p)
    expect(AVATAR_OPTIONS).toHaveLength(AVATAR_PRESETS.length)
  })

  it('maps legacy hosted photo URLs onto the preset in the same slot', () => {
    expect(resolveAvatar('https://img.example.com/abc123/avatar1.jpg')).toBe(AVATAR_PRESETS[0])
    expect(resolveAvatar('https://img.example.com/xyz/avatar8.jpg')).toBe(AVATAR_PRESETS[7])
  })

  it('falls back to null (initial) for empty or unknown values', () => {
    expect(resolveAvatar(null)).toBeNull()
    expect(resolveAvatar('')).toBeNull()
    expect(resolveAvatar('/avatar/nope')).toBeNull()
    expect(resolveAvatar('https://example.com/me.png')).toBeNull()
    expect(resolveAvatar('https://example.com/avatar9.jpg')).toBeNull()
  })

  it('stored values pass the update_my_profile check (start with "/", <= 500 chars)', () => {
    for (const v of AVATAR_OPTIONS) {
      expect(v.startsWith('/')).toBe(true)
      expect(v.length).toBeLessThanOrEqual(500)
    }
  })
})
