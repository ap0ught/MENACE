/*************************************/
/* MENACE — play loop & main board   */
/* O moves first; each side has its  */
/* own opponent type.               */
/*************************************/

function nextPlayerIsO(){
    return count(board, 0) % 2 === 1
}

function hasAnyHuman(){
    return player_o === "h" || player_x === "h"
}

function hasAnyAi(){
    return player_o !== "h" || player_x !== "h"
}

function isPaused(){
    var el = document.getElementById("speed_slider")
    if(!el){ return false }
    var v = parseInt(el.value, 10)
    return isNaN(v) || v <= 0
}

/* null = paused (left); else delay in ms (right = faster). */
function getAutomationDelayMs(){
    if(isPaused()){ return null }
    var v = parseInt(document.getElementById("speed_slider").value, 10)
    return Math.max(10, 1000 - v)
}

function getInterMoveDelayMs(){
    var d = getAutomationDelayMs()
    if(d === null){ return null }
    return Math.max(5, Math.floor(d / 10))
}

/* When a timer is scheduled, remember fn so pausing can move it to automationResumePending. */
var automationTimeoutFn = null

function scheduleAutomation(fn, delayMs){
    if(automationTimeoutId !== null){
        window.clearTimeout(automationTimeoutId)
        automationTimeoutId = null
    }
    automationTimeoutFn = null
    if(delayMs === null){
        automationResumePending = fn
        return
    }
    automationResumePending = null
    automationTimeoutFn = fn
    automationTimeoutId = window.setTimeout(function () {
        automationTimeoutId = null
        automationTimeoutFn = null
        if(isPaused()){
            automationResumePending = fn
            return
        }
        automationResumePending = null
        fn()
    }, delayMs)
}

function resumeFromPauseIfNeeded(){
    if(isPaused()){
        if(automationTimeoutId !== null){
            window.clearTimeout(automationTimeoutId)
            automationTimeoutId = null
            /* Slider hit 0 before the next AI move ran — keep that move on the queue. */
            if(automationTimeoutFn){
                automationResumePending = automationTimeoutFn
                automationTimeoutFn = null
            }
        }
        return
    }
    if(!automationResumePending){ return }
    var fn = automationResumePending
    automationResumePending = null
    fn()
}

/* No beads in matchbox: pause speed slider and queue retry of this engine’s move after unpause. */
function pauseAutomationForMenaceRetry(engineNum){
    if(automationTimeoutId !== null){
        window.clearTimeout(automationTimeoutId)
        automationTimeoutId = null
    }
    automationTimeoutFn = null
    automationResumePending = function () {
        if(engineNum === 1){
            play_o_side()
        } else {
            play_x_side()
        }
    }
    var ss = document.getElementById("speed_slider")
    if(ss){
        ss.value = "0"
    }
    updateSpeedDisplay()
}

function scheduleAfterGame(fn){
    if(hasAnyHuman()){
        window.setTimeout(fn, 1000)
    } else {
        scheduleAutomation(fn, getAutomationDelayMs())
    }
}

function updateSpeedVisibility(){
    var sd = document.getElementById("speeddiv")
    if(!sd){ return }
    sd.style.display = hasAnyAi() ? "block" : "none"
}

/* Show raw slider value (0–1000) or Pause when at zero. */
function updateSpeedDisplay(){
    var ss = document.getElementById("speed_slider")
    var disp = document.getElementById("speed_slider_display")
    if(!ss || !disp){ return }
    var v = parseInt(ss.value, 10)
    disp.textContent = (isNaN(v) || v <= 0) ? "Pause" : String(v)
}

/* Empty cell on main grid; click buttons when either side can be human. */
function mainBoardCellClear(i){
    var td = document.getElementById("pos"+i)
    td.textContent = ""
    td.classList.remove("has-mark")
    if(player_o === "h" || player_x === "h"){
        var btn = document.createElement("button")
        btn.type = "button"
        btn.setAttribute("aria-label", "Play cell " + td.getAttribute("data-cell-n"))
        ;(function (idx) {
            btn.addEventListener("click", function () {
                play_human(idx)
            })
        })(i)
        td.appendChild(btn)
    }
}

function mainBoardCellPlacePiece(i, piecePlayerNum){
    var td = document.getElementById("pos"+i)
    td.textContent = pieces[piecePlayerNum]
    td.classList.add("has-mark")
}

function new_game(){
    if(playagain){
        menace[1]["moves"] = []
        menace[2]["moves"] = []
        board = [0,0,0,0,0,0,0,0,0]
        no_winner = true
        for(var i=0;i<9;i++){
            mainBoardCellClear(i)
        }
        continueGame()
    }
}

/* Human and MENACE both record moves for reinforcement; Random/Perfect do not (see menace_add_beads). */
function updatePlayerMatchboxTrackIndicators(){
    var t1 = document.getElementById("p1_matchbox_track")
    var t2 = document.getElementById("p2_matchbox_track")
    var trainO = player_o === "m" || player_o === "h"
    var trainX = player_x === "m" || player_x === "h"
    if(t1){
        t1.classList.toggle("is-training", trainO)
        t1.setAttribute(
            "aria-label",
            trainO
                ? "O: moves are recorded and reinforce the MENACE O matchboxes after each game."
                : "O: moves are not training matchboxes (Random or Perfect)."
        )
    }
    if(t2){
        t2.classList.toggle("is-training", trainX)
        t2.setAttribute(
            "aria-label",
            trainX
                ? "X: moves are recorded and reinforce the MENACE X matchboxes after each game."
                : "X: moves are not training matchboxes (Random or Perfect)."
        )
    }
}

function updatePlayerModeHelp(){
    var h1 = document.getElementById("p1_help")
    var h2 = document.getElementById("p2_help")
    var p1 = document.getElementById("p1picker")
    var p2 = document.getElementById("p2picker")
    if(h1 && p1){
        if(p1.value === "p"){
            h1.hidden = false
            h1.textContent = "Perfect: minimax (optimal play). With best play on both sides, tic-tac-toe is usually a draw; O cannot force a win against a perfect opponent."
        } else {
            h1.hidden = true
            h1.textContent = ""
        }
    }
    if(h2 && p2){
        if(p2.value === "p"){
            h2.hidden = false
            h2.textContent = "Perfect: minimax (optimal play). Second player can always force at least a draw against any opponent."
        } else {
            h2.hidden = true
            h2.textContent = ""
        }
    }
}

function syncPlayersFromPickers(){
    var p1 = document.getElementById("p1picker")
    var p2 = document.getElementById("p2picker")
    var oldO = player_o
    var oldX = player_x
    if(p1){ player_o = p1.value }
    if(p2){ player_x = p2.value }
    /* Log role-change annotations at the current game index. */
    if(player_o !== oldO){
        role_events.push({ x: plotdata.length - 1, side: 1, mode: player_o })
        menaceScheduleSave()
    }
    if(player_x !== oldX){
        role_events.push({ x: plotdata.length - 1, side: 2, mode: player_x })
        menaceScheduleSave()
    }
    updatePlayerModeHelp()
    updatePlayerMatchboxTrackIndicators()
    updateSpeedVisibility()
    updateHumanMoveControls()
    if(!human_turn){ return }
    if(nextPlayerIsO()){
        if(player_o !== "h"){
            human_turn = false
            continueGame()
        }
    } else {
        if(player_x !== "h"){
            human_turn = false
            continueGame()
        }
    }
}

function continueGame(){
    if(!playagain || !no_winner){ return }
    if(nextPlayerIsO()){
        play_o_side()
    } else {
        play_x_side()
    }
}

function play_o_side(){
    if(player_o === "h"){
        human_turn = true
        updateHumanMoveControls()
        return
    }
    human_turn = false
    var where
    if(player_o === "r"){
        where = get_random_move()
    } else if(player_o === "m"){
        where = get_menace_move(1)
    } else if(player_o === "p"){
        where = get_perfect_move_for_side(1)
    } else {
        return
    }
    if(where === "resign"){
        if(menace[1]["noBeads"] === "pause"){
            say("O cannot move — no beads in this matchbox. Automation paused.")
            pauseAutomationForMenaceRetry(1)
            return
        }
        restoreMenaceMatchboxFromStartingBeads(1, board)
        say("MENACE O: matchbox reset to starting beads; retrying move.")
        play_o_side()
        return
    }
    board[where] = 1
    mainBoardCellPlacePiece(where, 1)
    check_win()
    if(no_winner){
        scheduleAutomation(continueGame, getInterMoveDelayMs())
    }
}

function play_x_side(){
    if(player_x === "h"){
        human_turn = true
        updateHumanMoveControls()
        return
    }
    human_turn = false
    var where
    if(player_x === "r"){
        where = get_random_move()
    } else if(player_x === "m"){
        where = get_menace_move(2)
    } else if(player_x === "p"){
        where = get_perfect_move_for_side(2)
    } else {
        return
    }
    if(where === "resign"){
        if(menace[2]["noBeads"] === "pause"){
            say("X cannot move — no beads in this matchbox. Automation paused.")
            pauseAutomationForMenaceRetry(2)
            return
        }
        restoreMenaceMatchboxFromStartingBeads(2, board)
        say("MENACE X: matchbox reset to starting beads; retrying move.")
        play_x_side()
        return
    }
    board[where] = 2
    mainBoardCellPlacePiece(where, 2)
    check_win()
    if(no_winner){
        scheduleAutomation(continueGame, getInterMoveDelayMs())
    }
}

function displayNameForPlayerMode(side){
    var mode = side === 1 ? player_o : player_x
    if(mode === "m"){
        return side === 1 ? "MENACE O" : "MENACE X"
    }
    return whoA[mode]
}

function check_win(){
    var who_wins = winner(board)
    if(who_wins !== false){
        if(who_wins === 0){
            say("It's a draw.")
        }
        if(who_wins === 1){
            say(displayNameForPlayerMode(1) + " wins (O).")
        }
        if(who_wins === 2){
            say(displayNameForPlayerMode(2) + " wins (X).")
        }
        do_win(who_wins)
        human_turn = false
    }
}

/* Clear unused cells visually, apply learning, schedule next game. */
function do_win(who_wins){
    no_winner = false
    for(var i=0;i<9;i++){
        if(board[i] === 0){
            var tde = document.getElementById("pos"+i)
            tde.textContent = ""
            tde.classList.remove("has-mark")
        }
    }
    menace_add_beads(who_wins)
    menaceScheduleSave()
    scheduleAfterGame(new_game)
}

function play_human(where){
    if(!no_winner || !human_turn){
        return
    }
    if(board[where] !== 0){
        return
    }
    if(nextPlayerIsO()){
        if(player_o !== "h"){
            return
        }
        var boardBefore = board.slice()
        if(player_o === "h"){
            recordHumanLearnerMove(1, boardBefore, where)
        }
        human_turn = false
        board[where] = 1
        mainBoardCellPlacePiece(where, 1)
        check_win()
        if(no_winner){
            continueGame()
        }
        updateHumanMoveControls()
        return
    }
    if(player_x !== "h"){
        return
    }
    var boardBeforeO = board.slice()
    if(player_x === "h"){
        recordHumanLearnerMove(2, boardBeforeO, where)
    }
    human_turn = false
    board[where] = 2
    mainBoardCellPlacePiece(where, 2)
    check_win()
    if(no_winner){
        continueGame()
    }
    updateHumanMoveControls()
}

function updateHumanMoveControls(){
    var wrap = document.getElementById("human_move_wrap")
    var inp = document.getElementById("human_cell_input")
    if(!wrap || !inp){ return }
    var needHuman = false
    if(human_turn && no_winner){
        if(nextPlayerIsO() && player_o === "h"){ needHuman = true }
        if(!nextPlayerIsO() && player_x === "h"){ needHuman = true }
    }
    if(!needHuman){
        wrap.hidden = true
        inp.disabled = true
        return
    }
    wrap.hidden = false
    inp.disabled = false
    inp.focus()
}

function openCellNumbersMessage(){
    var nums = []
    for(var i = 0; i < 9; i++){
        if(board[i] === 0){ nums.push(CELL_NUM_FOR_BOARD_IDX[i]) }
    }
    nums.sort(function (a, b){ return a - b })
    return nums.length ? nums.join(", ") : "none"
}

function submitHumanCellInput(){
    var inp = document.getElementById("human_cell_input")
    if(!inp || inp.disabled){ return }
    var n = parseInt(inp.value, 10)
    if(isNaN(n) || n < 1 || n > 9){
        return
    }
    var idx = BOARD_IDX_FOR_CELL_NUM[n - 1]
    if(board[idx] !== 0){
        var occ = board[idx] === 1 ? "O" : "X"
        say("Cell " + n + " is already taken (" + occ + "). Open cells: " + openCellNumbersMessage() + ".")
        inp.value = ""
        return
    }
    if(!human_turn || !no_winner){
        return
    }
    if(nextPlayerIsO() && player_o !== "h"){
        return
    }
    if(!nextPlayerIsO() && player_x !== "h"){
        return
    }
    inp.value = ""
    play_human(idx)
}
