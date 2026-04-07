/*************************************/
/* MENACE — shared application state */
/* Loaded first; other scripts assume  */
/* these globals exist.              */
/*************************************/

/* Two learners: 1 = MENACE (O), 2 = MENACE2 when enabled (X).
   boxes[posString] = array of 9 bead counts (legal moves only, after symmetry).
   orderedBoxes[0..3] = position keys grouped by move number (1st/2nd/… in that engine).
   start[0..3] = initial beads for 1st, 3rd, 5th, 7th moves (engine 1) or 2nd/4th/6th/8th (engine 2).
   incentives indexed by game result code used in update_totals (see menace-ui-summary). */
var menace = {
 1:{
    "boxes":{},
    "orderedBoxes":[],
    "start":[8,4,2,1],
    "removesymm":true,
    "incentives":[1,3,-1],
    "moves":[],
    "player":1},
 2:{
    "boxes":{},
    "orderedBoxes":[],
    "start":[8,4,2,1],
    "removesymm":true,
    "incentives":[1,3,-1],
    "moves":[],
    "player":2}
}

/* O (player 1) and X (player 2): h human, r random, m MENACE learner for that side (eng 1 for O, eng 2 for X), p perfect. */
var player_o = "m"
var player_x = "h"
var whoA = {"h":"Human", "r":"Random", "m":"MENACE", "p":"Perfect"}
/* When automation is paused (speed slider at 0), next callback to run after unpause. */
var automationResumePending = null

/* Learning curve: cumulative per-game outcome reward (one step per game; same convention as before). */
var plotdata = [0]
/* MENACE2 / Human X learner — same cumulative reward; flat when X is Random or Perfect (no training). */
var plotdata_menace2 = [0]
/* Per finished game: 0 draw, 1 MENACE win, 2 opponent win — used for rolling win rate. */
var result_history = []
/* After each game, running totals (length matches plotdata). */
var plot_cum_o = [0]
var plot_cum_draw = [0]
var plot_cum_x = [0]
var xmin = 0
var xmax = 0
var ymin = 0
var ymax = 0

var playagain = true
/* wins_each[0]=draws, [1]=O wins, [2]=X wins — matches dis0..dis2 in HTML. */
var wins_each = [0,0,0]
/* board[i] in {0,1,2}: empty, O, X. Index i is 0..8 left-to-right, top to bottom. */
var board = [0,0,0,0,0,0,0,0,0]
var no_winner = true
var pieces = ["","\u25CB","\u00D7"]
/* Rolling log of recent messages (shown in list_here). */
var said = ["","","","","","","","","",""]
var human_turn = false
/* Typed cell 1..9 (7-9 top row, 1-3 bottom) → board index 0..8. */
var BOARD_IDX_FOR_CELL_NUM = [6,7,8,3,4,5,0,1,2]
