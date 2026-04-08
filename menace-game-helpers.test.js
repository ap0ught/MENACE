import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const utilsJs = fs.readFileSync(path.resolve(currentDir, './js/menace-utils.js'), 'utf8')
const rulesJs = fs.readFileSync(path.resolve(currentDir, './js/menace-rules.js'), 'utf8')
const gameJs = fs.readFileSync(path.resolve(currentDir, './js/menace-game.js'), 'utf8')

function loadGameHelpers() {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>
      <div id="speeddiv"></div>
      <input type="range" id="speed_slider" min="0" max="1000" step="10" value="500" />
      <span id="speed_slider_display"></span>
    </body></html>`,
    { url: 'http://localhost' }
  )
  global.window = dom.window
  global.document = dom.window.document
  global.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  global.player_o = 'm'
  global.player_x = 'h'
  global.whoA = { h: 'Human', r: 'Random', m: 'MENACE', p: 'Perfect' }
  global.automationTimeoutId = null
  global.automationResumePending = null
  global.CELL_NUM_FOR_BOARD_IDX = [7, 8, 9, 4, 5, 6, 1, 2, 3]

  const script = new dom.window.Function(
    utilsJs +
      '\n' +
      rulesJs +
      '\n' +
      gameJs +
      '\n' +
      'global.nextPlayerIsO = nextPlayerIsO;\n' +
      'global.hasAnyHuman = hasAnyHuman;\n' +
      'global.hasAnyAi = hasAnyAi;\n' +
      'global.isPaused = isPaused;\n' +
      'global.getAutomationDelayMs = getAutomationDelayMs;\n' +
      'global.getInterMoveDelayMs = getInterMoveDelayMs;\n' +
      'global.displayNameForPlayerMode = displayNameForPlayerMode;\n' +
      'global.openCellNumbersMessage = openCellNumbersMessage;\n' +
      'global.count = count;\n'
  )
  script.call(global)
}

describe('menace-game.js helpers', () => {
  beforeEach(() => {
    loadGameHelpers()
    global.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    global.player_o = 'm'
    global.player_x = 'h'
  })

  describe('nextPlayerIsO', () => {
    it('is true when an odd number of cells remain empty', () => {
      global.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      expect(global.nextPlayerIsO()).toBe(true)
      global.board[0] = 1
      expect(global.nextPlayerIsO()).toBe(false)
    })
  })

  describe('hasAnyHuman / hasAnyAi', () => {
    it('detects human and AI configurations', () => {
      global.player_o = 'h'
      global.player_x = 'm'
      expect(global.hasAnyHuman()).toBe(true)
      expect(global.hasAnyAi()).toBe(true)

      global.player_o = 'r'
      global.player_x = 'p'
      expect(global.hasAnyHuman()).toBe(false)
      expect(global.hasAnyAi()).toBe(true)
    })
  })

  describe('displayNameForPlayerMode', () => {
    it('uses MENACE labels for learners', () => {
      global.player_o = 'm'
      global.player_x = 'm'
      expect(global.displayNameForPlayerMode(1)).toBe('MENACE O')
      expect(global.displayNameForPlayerMode(2)).toBe('MENACE X')
    })

    it('uses whoA for other modes', () => {
      global.player_o = 'p'
      expect(global.displayNameForPlayerMode(1)).toBe('Perfect')
    })
  })

  describe('openCellNumbersMessage', () => {
    it('lists cell numbers for empty squares', () => {
      global.board = [1, 0, 0, 0, 0, 0, 0, 0, 0]
      expect(global.openCellNumbersMessage()).toMatch(/8, 9/)
    })

    it('returns none when board is full', () => {
      global.board = [1, 2, 1, 2, 1, 2, 2, 1, 2]
      expect(global.openCellNumbersMessage()).toBe('none')
    })
  })

  describe('speed / automation', () => {
    it('isPaused when slider is 0', () => {
      document.getElementById('speed_slider').value = '0'
      expect(global.isPaused()).toBe(true)
    })

    it('getAutomationDelayMs returns null when paused', () => {
      document.getElementById('speed_slider').value = '0'
      expect(global.getAutomationDelayMs()).toBe(null)
    })

    it('getAutomationDelayMs scales speed slider', () => {
      document.getElementById('speed_slider').value = '1000'
      expect(global.getAutomationDelayMs()).toBe(10)
    })

    it('getInterMoveDelayMs floors automation delay / 10 with a minimum of 5', () => {
      document.getElementById('speed_slider').value = '1000'
      expect(global.getAutomationDelayMs()).toBe(10)
      expect(global.getInterMoveDelayMs()).toBe(5)
      document.getElementById('speed_slider').value = '500'
      expect(global.getInterMoveDelayMs()).toBe(50)
    })
  })
})
