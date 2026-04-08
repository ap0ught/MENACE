import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const utilsJs = fs.readFileSync(path.resolve(currentDir, './js/menace-utils.js'), 'utf8')
const rulesJs = fs.readFileSync(path.resolve(currentDir, './js/menace-rules.js'), 'utf8')
const opponentsJs = fs.readFileSync(path.resolve(currentDir, './js/menace-opponents.js'), 'utf8')

function loadOpponents() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  const script = new dom.window.Function(
    utilsJs +
      '\n' +
      rulesJs +
      '\n' +
      opponentsJs +
      '\n' +
      'global.get_random_move = get_random_move;\n' +
      'global.get_perfect_move_for_side = get_perfect_move_for_side;\n' +
      'global.get_perfect_move = get_perfect_move;\n' +
      'global.minimax = minimax;\n' +
      'global.count = count;\n' +
      'global.winner = winner;\n'
  )
  script.call(global)
}

describe('menace-opponents.js', () => {
  beforeEach(() => {
    loadOpponents()
    global.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  })

  describe('get_random_move', () => {
    it('returns an empty cell index', () => {
      global.board = [1, 0, 0, 0, 0, 0, 0, 0, 0]
      vi.spyOn(Math, 'random').mockReturnValue(0)
      expect(global.get_random_move()).toBe(1)
      Math.random.mockRestore()
    })

    it('returns the only empty cell', () => {
      global.board = [1, 1, 1, 1, 1, 1, 1, 1, 0]
      expect(global.get_random_move()).toBe(8)
    })
  })

  describe('get_perfect_move_for_side', () => {
    it('takes winning move for O when a row can be completed', () => {
      global.board = [1, 1, 0, 0, 0, 0, 0, 0, 0]
      expect(global.get_perfect_move_for_side(1)).toBe(2)
    })

    it('blocks X from completing the top row', () => {
      global.board = [2, 2, 0, 0, 1, 0, 0, 0, 0]
      expect(global.get_perfect_move_for_side(1)).toBe(2)
    })

    it('takes winning move for X', () => {
      global.board = [2, 2, 0, 0, 1, 0, 0, 0, 0]
      expect(global.get_perfect_move_for_side(2)).toBe(2)
    })

    it('blocks O fork or win threat (center control)', () => {
      global.board = [1, 0, 0, 0, 2, 0, 0, 0, 0]
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const m = global.get_perfect_move_for_side(1)
      Math.random.mockRestore()
      expect([1, 3, 5, 7]).toContain(m)
    })
  })

  describe('get_perfect_move', () => {
    it('delegates to X (side 2)', () => {
      global.board = [2, 2, 0, 0, 1, 0, 0, 0, 0]
      expect(global.get_perfect_move()).toBe(2)
    })
  })

  describe('minimax', () => {
    it('scores finished O win negatively', () => {
      const b = [1, 1, 1, 2, 2, 0, 0, 0, 0]
      const r = global.minimax(b, 2)
      expect(r.score).toBeLessThan(0)
    })

    it('scores finished X win positively', () => {
      const b = [2, 2, 2, 1, 1, 0, 0, 0, 0]
      const r = global.minimax(b, 1)
      expect(r.score).toBeGreaterThan(0)
    })

    it('scores draw as zero', () => {
      const b = [1, 2, 1, 2, 1, 2, 2, 1, 2]
      const r = global.minimax(b, 1)
      expect(r.score).toBe(0)
    })
  })
})
