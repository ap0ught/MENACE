# MENACE

**Machine Educable Noughts And Crosses Engine** — a browser-based tic-tac-toe demo where an AI learns by reinforcement, inspired by Donald Michie’s 1960 matchbox computer.

This repository is a self-contained **HTML + CSS + JavaScript** implementation (no build step, no npm dependencies). Open `index.html` in a web browser to play and watch the learner improve over many games.

The UI is hardened for a static page: **Content-Security-Policy** (no inline scripts), no `javascript:` URLs, delegated event handlers, and `textContent` for status text. See [SECURITY.md](SECURITY.md) for details.

## Background

In 1960, [Donald Michie](https://en.wikipedia.org/wiki/Donald_Michie) built the first MENACE from **304 matchboxes**, each encoding board positions and colored beads for legal moves. After each game, beads were added or removed so that winning moves were reinforced — an early form of reinforcement learning.

This program uses the same idea with **virtual matchboxes**: each position stores bead counts per move; MENACE samples a move proportional to beads, then updates counts after wins, draws, or losses.

## What you get

- **MENACE (O)** plays first and learns from experience.
- **Player X** can be:
  - **Human** — you click the board.
  - **Random** — uniform random legal moves.
  - **MENACE2** — a second independent learner (both sides learn).
  - **Perfect** — minimax optimal play (unbeatable).
- **Symmetry** — equivalent board rotations are normalized so the same “box” covers symmetric positions (optional setting per engine).
- **Stats** — win / draw / loss counts and a **canvas graph** of how bead totals in the first box evolve over games (a simple learning curve).

## Quick start

1. Clone or download this repository.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, etc.).

If your browser blocks local scripts when opening files directly, serve the folder instead, for example:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx --yes serve .
```

Then visit `http://localhost:8080` (or the URL your tool prints).

## Usage notes

- **MENACE** is always **noughts (O)**; the opponent is **crosses (X)**.
- For non-human opponents, use the **speed** slider to slow down or speed up automated games.
- Expand **Show MENACE’s settings** (and MENACE2’s when enabled) to change initial bead counts per move number, win/draw/loss incentives, symmetry handling, and to reset learning.

## Project layout


| File                      | Role                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `index.html`              | Document shell, CSP, links to assets                         |
| `styles.css`              | Layout and styling                                           |
| `js/menace-state.js`      | Shared globals (engines, board, scores, plot series)         |
| `js/menace-utils.js`      | Small array helpers (`count`, `arrmin`, …)                   |
| `js/menace-rules.js`      | Rotations, line wins, `winner` / `opposite_result`           |
| `js/menace-plot.js`       | Canvas learning curve                                        |
| `js/menace-ui-summary.js` | Status log and win-counter updates                           |
| `js/menace-ui-panel.js`   | Matchbox grid HTML, settings panel, delegated clicks         |
| `js/menace-engine.js`     | Matchbox build/search, bead updates, `get_menace_move`       |
| `js/menace-opponents.js`  | Random, perfect (minimax), and move helpers used by the loop |
| `js/menace-game.js`       | Main board, `new_game`, play loop, human input               |
| `js/menace-init.js`       | `DOMContentLoaded` wiring                                    |


Scripts load in that order (classic globals, no bundler).

## Further reading

- Matthew Scroggs’s article and original online version: [mscroggs.co.uk — MENACE](https://www.mscroggs.co.uk/menace)

## License and credits

- **Copyright** © 2018 Matthew Scroggs. Licensed under the [MIT License](LICENSE.txt).
- Implementation based on Michie’s MENACE concept; this README describes the code in **this** repo only.

