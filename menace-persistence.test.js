import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const persistenceJs = fs.readFileSync(path.resolve(currentDir, './js/menace-persistence.js'), 'utf8')

function createStorage() {
  const store = {}
  return {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v)
    },
    removeItem: (k) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
    _store: store
  }
}

function loadPersistence(storage) {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="dis0">0</div><div id="dis1">0</div><div id="dis2">0</div></body></html>', {
    url: 'http://localhost'
  })
  global.window = dom.window
  global.document = dom.window.document
  global.localStorage = storage

  global.menace = {
    1: {
      boxes: { '000000000': [1, 1, 1, 1, 1, 1, 1, 1, 1] },
      orderedBoxes: [[], [], [], []],
      start: [8, 4, 2, 1],
      removesymm: true,
      incentives: [1, 3, -1],
      noBeads: 'reset'
    },
    2: {
      boxes: {},
      orderedBoxes: [[], [], [], []],
      start: [8, 4, 2, 1],
      removesymm: true,
      incentives: [1, 3, -1],
      noBeads: 'reset'
    }
  }
  global.plotdata = [0, 5]
  global.plotdata_menace2 = [0, 0]
  global.result_history = [1, 2]
  global.plot_cum_o = [0, 1]
  global.plot_cum_draw = [0, 0]
  global.plot_cum_x = [0, 1]
  global.role_events = []
  global.wins_each = [0, 1, 1]

  const script = new dom.window.Function(
    persistenceJs +
      '\n' +
      'global.menaceIsObject = menaceIsObject;\n' +
      'global.menaceIsArrayOfArrays = menaceIsArrayOfArrays;\n' +
      'global.menaceIsValidLoadedPlayerState = menaceIsValidLoadedPlayerState;\n' +
      'global.menaceMigratePlotStateFromV1 = menaceMigratePlotStateFromV1;\n' +
      'global.menaceTryLoadFromStorage = menaceTryLoadFromStorage;\n' +
      'global.menaceSaveStateToStorage = menaceSaveStateToStorage;\n' +
      'global.menaceApplyLoadedScoresToDom = menaceApplyLoadedScoresToDom;\n'
  )
  script.call(global)
}

describe('menace-persistence.js', () => {
  let storage

  beforeEach(() => {
    storage = createStorage()
    loadPersistence(storage)
  })

  describe('menaceIsObject', () => {
    it('accepts plain objects, rejects null and primitives', () => {
      expect(global.menaceIsObject({})).toBe(true)
      expect(global.menaceIsObject([])).toBe(true)
      expect(global.menaceIsObject(null)).toBe(false)
      expect(global.menaceIsObject(undefined)).toBe(false)
      expect(global.menaceIsObject(3)).toBe(false)
    })
  })

  describe('menaceIsArrayOfArrays', () => {
    it('validates nested arrays only', () => {
      expect(global.menaceIsArrayOfArrays([[], [1]])).toBe(true)
      expect(global.menaceIsArrayOfArrays([1, 2])).toBe(false)
      expect(global.menaceIsArrayOfArrays('x')).toBe(false)
    })
  })

  describe('menaceIsValidLoadedPlayerState', () => {
    it('accepts a complete engine snapshot', () => {
      expect(
        global.menaceIsValidLoadedPlayerState({
          boxes: {},
          orderedBoxes: [[], [], [], []],
          start: [8, 4, 2, 1],
          removesymm: true,
          incentives: [1, 3, -1],
          noBeads: 'pause'
        })
      ).toBe(true)
    })

    it('rejects invalid noBeads', () => {
      expect(
        global.menaceIsValidLoadedPlayerState({
          boxes: {},
          orderedBoxes: [[], [], [], []],
          start: [8, 4, 2, 1],
          removesymm: true,
          incentives: [1, 3, -1],
          noBeads: 'other'
        })
      ).toBe(false)
    })

    it('rejects missing or wrong-typed fields', () => {
      expect(
        global.menaceIsValidLoadedPlayerState({
          boxes: {},
          orderedBoxes: [[], 'not-array'],
          start: [8, 4, 2, 1],
          removesymm: true,
          incentives: [1, 3, -1]
        })
      ).toBe(false)
      expect(
        global.menaceIsValidLoadedPlayerState({
          boxes: {},
          orderedBoxes: [[], [], [], []],
          start: [8, 4, 2, 1],
          removesymm: 'yes',
          incentives: [1, 3, -1]
        })
      ).toBe(false)
      expect(global.menaceIsValidLoadedPlayerState(null)).toBe(false)
    })
  })

  describe('menaceMigratePlotStateFromV1', () => {
    it('fills derived series when upgrading from v1-shaped data', () => {
      global.plotdata = [0, 10, 20]
      global.plotdata_menace2 = []
      global.result_history = []
      global.wins_each = [2, 3, 5]
      global.plot_cum_o = [0]
      global.plot_cum_draw = [0]
      global.plot_cum_x = [0]
      global.role_events = [{ x: 0, side: 1, mode: 'm' }]

      global.menaceMigratePlotStateFromV1()

      expect(global.plotdata_menace2.length).toBe(global.plotdata.length)
      expect(global.result_history.length).toBe(global.plotdata.length - 1)
      expect(global.role_events).toEqual([])
      expect(global.plot_cum_o.length).toBe(global.plotdata.length)
    })
  })

  describe('menaceSaveStateToStorage / menaceTryLoadFromStorage', () => {
    it('round-trips v2 payload', () => {
      global.menace[1].start = [3, 4, 5, 6]
      global.menace[2].removesymm = false
      global.menace[1].noBeads = 'pause'
      global.menaceSaveStateToStorage()

      global.menace[1].start = [1, 1, 1, 1]
      global.menace[2].removesymm = true
      global.menace[1].noBeads = 'reset'

      expect(global.menaceTryLoadFromStorage()).toBe(true)
      expect(global.menace[1].start).toEqual([3, 4, 5, 6])
      expect(global.menace[2].removesymm).toBe(false)
      expect(global.menace[1].noBeads).toBe('pause')
      expect(global.plotdata).toEqual([0, 5])
    })

    it('returns false for missing key', () => {
      storage.clear()
      expect(global.menaceTryLoadFromStorage()).toBe(false)
    })

    it('returns false for invalid JSON', () => {
      storage.setItem('menace_app_state_v1', '{not json')
      expect(global.menaceTryLoadFromStorage()).toBe(false)
    })
  })

  describe('menaceApplyLoadedScoresToDom', () => {
    it('writes wins_each into dis0..dis2', () => {
      global.wins_each = [4, 5, 6]
      global.menaceApplyLoadedScoresToDom()
      expect(document.getElementById('dis0').textContent).toBe('4')
      expect(document.getElementById('dis1').textContent).toBe('5')
      expect(document.getElementById('dis2').textContent).toBe('6')
    })
  })
})
