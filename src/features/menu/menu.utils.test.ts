import { describe, expect, it } from 'vitest'
import { moveItem } from './menu.utils'

const items = [
  { id: 'a', categoryId: 'rice' },
  { id: 'x', categoryId: 'drinks' },
  { id: 'b', categoryId: 'rice' },
]
const ids = (list: typeof items) => list.map(({ id }) => id)

describe('moveItem', () => {
  it('swaps across other categories', () => {
    expect(ids(moveItem(items, 'b', -1))).toEqual(['b', 'x', 'a'])
  })

  it('stays put at the edge of a category', () => {
    expect(moveItem(items, 'a', -1)).toBe(items)
    expect(moveItem(items, 'b', 1)).toBe(items)
  })
})
