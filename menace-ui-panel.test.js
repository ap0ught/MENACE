import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const panelJs = fs.readFileSync(path.resolve(currentDir, './js/menace-ui-panel.js'), 'utf8')

describe('menace-ui-panel.js', () => {
  let dom
  let window
  let document

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="menace_panels_root"></div></body></html>', {
      url: 'http://localhost'
    })
    window = dom.window
    document = window.document
    global.window = window
    global.document = document
    // global.navigator = window.navigator
    global.URL = window.URL

    // Mock globals needed by menace-ui-panel.js
    global.menace = {
      1: {
        boxes: {
          "000000000": [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        orderedBoxes: [["000000000"], [], [], []],
        start: [8, 4, 2, 1],
        removesymm: true,
        incentives: [1, 3, -1]
      },
      2: {
        boxes: {},
        orderedBoxes: [[], [], [], []],
        start: [8, 4, 2, 1],
        removesymm: true,
        incentives: [1, 3, -1]
      }
    }
    global.pieces = ["", "O", "X"]
    global.whoA = { "h": "Human", "r": "Random", "m": "MENACE", "p": "Perfect" }
    global.player_o = "m"
    global.player_x = "h"

    // Execute the script in the mocked global context
    const script = new window.Function(panelJs + "\n" + 
      "global.make_ox = make_ox;\n" +
      "global.setMenaceSliderValue = setMenaceSliderValue;\n" +
      "global.show_set = show_set;\n" +
      "global.hide_set = hide_set;\n" +
      "global.buildMenaceColumnHTML = buildMenaceColumnHTML;\n" +
      "global.showMenacePanels = showMenacePanels;\n" +
      "global.menaceBeadSliderRow = menaceBeadSliderRow;\n" +
      "global.menaceIncentiveSliderRow = menaceIncentiveSliderRow;\n" +
      "global.update_box = update_box;\n" +
      "global.syncMenaceSettingSliderDisplay = syncMenaceSettingSliderDisplay;\n"
    )
    script.call(global)
    
    // Bind functions to global for testing (simulating script loading)
    // In a real browser, these are global because they are declared with `function` at top level
    // In our JSDOM/Function execution, we might need to manually attach them if they are not seen.
    // However, since we used `script.call(global)`, and the functions are declared as `function name(){}`, 
    // they should be on the `global` object.
    
    // Let's explicitly check and attach them if needed, but the `Function` constructor with `call(global)`
    // might not work exactly as expected for function declarations in all environments.
    // A better way is to eval it in the context of the window or just use the global object.
  })

  describe('make_ox', () => {
    it('generates correct HTML for an empty board', () => {
      const html = global.make_ox("000000000", 1)
      expect(html).toContain("<table class='board'>")
      expect(html).toContain("id='m1-000000000-0'")
      expect(html).toContain("<span class='bead bead-0'") // move-color bead marker
      expect(html).toContain("<span class='bead-count'>1</span>") // bead count from menace[1].boxes["000000000"][0]
    })

    it('generates correct HTML with pieces', () => {
      // 100000000 means position 0 has piece 1 (O)
      const html = global.make_ox("100000000", 1)
      expect(html).toContain(">O</td>")
    })
    
    it('handles missing box data safely', () => {
      // 000000000 with engine 2 which has no boxes
      const html = global.make_ox("000000000", 2)
      expect(html).toContain("<span class='bead bead-0'")
      expect(html).toContain("<span class='bead-count'>0</span>")
    })
  })

  describe('setMenaceSliderValue', () => {
    it('updates slider value and display', () => {
      document.body.innerHTML = `
        <input type="range" id="test-slider" value="5">
        <span id="test-slider_display">5</span>
        <span id="test-slider_unit">beads</span>
      `
      global.setMenaceSliderValue("test-slider", 10, 1, 20)
      const el = document.getElementById("test-slider")
      const disp = document.getElementById("test-slider_display")
      expect(el.value).toBe("10")
      expect(disp.textContent).toBe("10")
    })

    it('clamps value to min/max', () => {
      document.body.innerHTML = '<input type="range" id="test-slider">'
      global.setMenaceSliderValue("test-slider", 25, 1, 20)
      expect(document.getElementById("test-slider").value).toBe("20")
      
      global.setMenaceSliderValue("test-slider", 0, 1, 20)
      expect(document.getElementById("test-slider").value).toBe("1")
    })

    it('updates unit text correctly', () => {
      document.body.innerHTML = `
        <input type="range" id="test-slider">
        <span id="test-slider_unit"></span>
      `
      global.setMenaceSliderValue("test-slider", 1, 1, 20)
      expect(document.getElementById("test-slider_unit").textContent).toBe("bead")
      
      global.setMenaceSliderValue("test-slider", 2, 1, 20)
      expect(document.getElementById("test-slider_unit").textContent).toBe("beads")
    })
  })

  describe('show_set', () => {
    it('populates settings for engine 1', () => {
      document.body.innerHTML = `
        <input id="im1"><span id="im1_display"></span>
        <input id="im3"><span id="im3_display"></span>
        <input id="im5"><span id="im5_display"></span>
        <input id="im7"><span id="im7_display"></span>
        <input id="_1_ic_w"><span id="_1_ic_w_display"></span>
        <input id="_1_ic_d"><span id="_1_ic_d_display"></span>
        <input id="_1_ic_l"><span id="_1_ic_l_display"></span>
        <input type="checkbox" id="_1_includeall">
        <div id="_1_tweak_h" style="display: none"></div>
        <div id="_1_tweak_s" style="display: block"></div>
      `
      global.show_set(1)
      expect(document.getElementById("im1").value).toBe("8")
      expect(document.getElementById("_1_ic_w").value).toBe("3")
      expect(document.getElementById("_1_tweak_h").style.display).toBe("block")
    })
  })

  describe('buildMenaceColumnHTML', () => {
    it('returns a string containing expected elements', () => {
      const html = global.buildMenaceColumnHTML(1)
      expect(html).toContain("MENACE")
      expect(html).toContain("data-menace-col='1'")
      expect(html).toContain("1st move")
      expect(html).toContain("matchboxes total")
    })
  })

  describe('showMenacePanels', () => {
    it('injects HTML into root element', () => {
      global.showMenacePanels()
      const root = document.getElementById("menace_panels_root")
      expect(root.innerHTML).toContain("menace-combined-box")
      expect(root.innerHTML).toContain("MENACE")
      expect(root.innerHTML).toContain("MENACE2")
    })
  })

  describe('syncMenaceSettingSliderDisplay', () => {
    it('updates display when slider changes', () => {
      document.body.innerHTML = `
        <input type="range" id="slider1" class="menace-settings-slider" value="15">
        <span id="slider1_display">0</span>
      `
      const slider = document.getElementById("slider1")
      global.syncMenaceSettingSliderDisplay(slider)
      expect(document.getElementById("slider1_display").textContent).toBe("15")
    })

    it('updates unit display correctly', () => {
      document.body.innerHTML = `
        <input type="range" id="slider2" class="menace-settings-slider" value="1">
        <span id="slider2_unit">beads</span>
      `
      const slider = document.getElementById("slider2")
      global.syncMenaceSettingSliderDisplay(slider)
      expect(document.getElementById("slider2_unit").textContent).toBe("bead")
    })
  })

  describe('menaceBeadSliderRow', () => {
    it('generates correct HTML', () => {
      const html = global.menaceBeadSliderRow("im1", "1st move", 8)
      expect(html).toContain("1st move")
      expect(html).toContain("id='im1'")
      expect(html).toContain("value='8'")
    })
  })

  describe('menaceIncentiveSliderRow', () => {
    it('generates correct HTML for wins', () => {
      const html = global.menaceIncentiveSliderRow(1, "w", "Win", 3, 0, 20)
      expect(html).toContain("Win")
      expect(html).toContain("id='_1_ic_w'")
      expect(html).toContain("+<span id='_1_ic_w_display'>3</span>")
    })

    it('generates correct HTML for losses', () => {
      const html = global.menaceIncentiveSliderRow(1, "l", "Lose", 1, 0, 20)
      expect(html).toContain("Lose")
      expect(html).toContain("take <span id='_1_ic_l_display'>1</span>")
    })
  })

  describe('update_box', () => {
    it('updates box content in DOM', () => {
      document.body.innerHTML = "<div id='m1_board_000000000'>old</div>"
      global.update_box("000000000", 1)
      expect(document.getElementById('m1_board_000000000').innerHTML).toContain("table")
      expect(document.getElementById('m1_board_000000000').innerHTML).toContain("board")
    })
  })
})
