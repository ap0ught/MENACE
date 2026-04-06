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

/* Opponent for X: h human, r random, m second MENACE, p perfect minimax. */
var player = "h"
var whoA = {"h":"Human", "r":"Random", "m":"MENACE2", "p":"Perfect"}

/* Learning curve: one y-value per finished game (cumulative bead incentive sum). */
var plotdata = [0]
var xmin = 0
var xmax = 0
var ymin = 0
var ymax = 0

var playagain = true
/* wins_each[0]=draws, [1]=MENACE wins, [2]=opponent wins — matches dis0..dis2 in HTML. */
var wins_each = [0,0,0]
/* board[i] in {0,1,2}: empty, O (MENACE), X (opponent). Index i is 0..8 left-to-right, top to bottom. */
var board = [0,0,0,0,0,0,0,0,0]
var no_winner = true
var pieces = ["","\u25CB","\u00D7"]
/* Rolling log of recent messages (shown in list_here). */
var said = ["","","","","","","","","",""]
var human_turn = false
/* Typed cell 1..9 (7-9 top row, 1-3 bottom) → board index 0..8. */
var BOARD_IDX_FOR_CELL_NUM = [6,7,8,3,4,5,0,1,2]
