import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const utilsJs = fs.readFileSync(path.resolve(currentDir, './js/menace-utils.js'), 'utf8')
const rulesJs = fs.readFileSync(path.resolve(currentDir, './js/menace-rules.js'), 'utf8')

function loadRulesAndUtils() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  const script = new dom.window.Function(
    utilsJs +
      '\n' +
      rulesJs +
      '\n' +
      'global.apply_rotation = apply_rotation;\n' +
      'global.find_all_rotations = find_all_rotations;\n' +
      'global.find_rotation = find_rotation;\n' +
      'global.three = three;\n' +
      'global.winner = winner;\n' +
      'global.rotation_is_max = rotation_is_max;\n' +
      'global.opposite_result = opposite_result;\n' +
      'global.arrmin = arrmin;\n' +
      'global.arrmax = arrmax;\n' +
      'global.array_fill = array_fill;\n' +
      'global.count = count;\n'
  )
  script.call(global)
}

describe('menace-utils.js', () => {
  beforeEach(() => {
    loadRulesAndUtils()
  })

  describe('count', () => {
    it('counts matching values', () => {
      expect(global.count([0, 1, 0, 2, 0], 0)).toBe(3)
      expect(global.count([1, 1, 1], 1)).toBe(3)
      expect(global.count([], 0)).toBe(0)
    })
  })

  describe('arrmin / arrmax', () => {
    it('returns min and max', () => {
      expect(global.arrmin([3, 1, 4])).toBe(1)
      expect(global.arrmax([3, 1, 4])).toBe(4)
    })
  })

  describe('array_fill', () => {
    it('fills sparse indices from start to length-1', () => {
      const a = global.array_fill(0, 9, 7)
      expect(a.length).toBe(9)
      expect(a[0]).toBe(7)
      expect(a[8]).toBe(7)
    })
  })
})

describe('menace-rules.js', () => {
  beforeEach(() => {
    loadRulesAndUtils()
  })

  describe('three', () => {
    it('detects O win on top row', () => {
      expect(global.three('111000000')).toBe(1)
    })

    it('detects X win on main diagonal', () => {
      expect(global.three('200020002')).toBe(2)
    })

    it('returns 0 when no line yet', () => {
      expect(global.three('120000000')).toBe(0)
    })

    it('detects column and anti-diagonal wins', () => {
      expect(global.three('100100100')).toBe(1)
      expect(global.three('002020200')).toBe(2)
    })
  })

  describe('winner', () => {
    it('returns player id when someone wins', () => {
      expect(global.winner([1, 1, 1, 0, 2, 0, 0, 0, 0])).toBe(1)
      expect(global.winner([2, 1, 1, 1, 2, 0, 0, 0, 2])).toBe(2)
    })

    it('returns 0 for a full board draw', () => {
      expect(global.winner([1, 2, 1, 2, 1, 2, 2, 1, 2])).toBe(0)
    })

    it('returns false when game continues', () => {
      expect(global.winner([1, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(false)
    })

    it('detects middle column win', () => {
      expect(global.winner([0, 1, 0, 0, 1, 0, 0, 1, 0])).toBe(1)
    })
  })

  describe('opposite_result', () => {
    it('swaps 1 and 2, keeps draw', () => {
      expect(global.opposite_result(0)).toBe(0)
      expect(global.opposite_result(1)).toBe(2)
      expect(global.opposite_result(2)).toBe(1)
    })
  })

  describe('apply_rotation and find_all_rotations', () => {
    it('identity rotation leaves string unchanged', () => {
      const pos = '123456789'
      expect(global.apply_rotation(pos, [0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe(pos)
    })

    it('find_all_rotations returns symmetries that share the lex-max encoding', () => {
      const rots = global.find_all_rotations('000000000')
      expect(Array.isArray(rots)).toBe(true)
      expect(rots.length).toBeGreaterThan(0)
      expect(rots).toContain(0)
    })
  })

  describe('rotation_is_max', () => {
    it('is true for empty board canonical form', () => {
      expect(global.rotation_is_max('000000000')).toBe(true)
    })
  })

  describe('find_rotation', () => {
    it('returns one of the canonical rotations (deterministic with mocked random)', () => {
      const rots = global.find_all_rotations('000000000')
      vi.spyOn(Math, 'random').mockReturnValue(0)
      expect(rots).toContain(global.find_rotation('000000000'))
      Math.random.mockRestore()
    })
  })
})
