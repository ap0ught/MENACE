/*************************************/
/* MENACE — play loop & main board   */
/* Turn order: MENACE (1) then X.    */
/*************************************/

/* Empty cell on main grid; adds a click button in human mode, CSS watermark label only otherwise. */
function mainBoardCellClear(i){
    var td = document.getElementById("pos"+i)
    td.textContent = ""
    td.classList.remove("has-mark")
    if(player == "h"){
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
        play_menace()
    }
}

function setPlayer(setTo){
    player = setTo
    document.getElementById("who").textContent = whoA[setTo]
    if(setTo!="h"){
        document.getElementById("speeddiv").style.display = "block"
    } else {
        document.getElementById("speeddiv").style.display = "none"
    }
    updateHumanMoveControls()
    /* If user switches away from human mid-turn, let the automaton move. */
    if(setTo!="h" && human_turn){
        play_opponent()
    }
}

function check_win(){
    var who_wins = winner(board)
    if(who_wins !== false){
        if(who_wins == 0){
            say("It's a draw.")
        }
        if(who_wins == 1){
            say("MENACE wins.")
        }
        if(who_wins == 2){
            say(whoA[player]+" wins.")
        }
        do_win(who_wins)
        human_turn = false
    }
}

/* Clear unused cells visually, apply learning, schedule next game (delay from speed slider if AI). */
function do_win(who_wins){
    no_winner = false
    for(var i=0;i<9;i++){
        if(board[i] == 0){
            var tde = document.getElementById("pos"+i)
            tde.textContent = ""
            tde.classList.remove("has-mark")
        }
    }
    menace_add_beads(who_wins)
    menaceScheduleSave()
    if(player == "h"){
        window.setTimeout(new_game, 1000)
    } else {
        var delay = Math.abs(parseInt(document.getElementById("speed_slider").value, 10))
        window.setTimeout(new_game, delay)
    }
}

function play_menace(){
    var where = get_menace_move(1)
    if(where=="resign"){
        if(count(board,0)==9){
            say("MENACE has run out of beads in the first box and refuses to play.")
            playagain = false
            return
        }
        do_win(2)
        say("MENACE resigns")
        return
    }
    board[where] = 1
    mainBoardCellPlacePiece(where, 1)
    check_win()
    if(no_winner){
        play_opponent()
    }
}

function play_opponent(){
    if(player == 'h'){
        human_turn = true
        updateHumanMoveControls()
        return
    }
    human_turn = false
    var where = undefined
    if(player == 'r'){
        where = get_random_move()
    } else if(player == 'm'){
        where = get_menace_move(2)
    } else if(player == 'p'){
        where = get_perfect_move()
    }
    if(where=="resign"){
        do_win(1)
        say("MENACE2 resigns")
        return
    }
    board[where] = 2
    mainBoardCellPlacePiece(where, 2)
    check_win()
    if(no_winner){
        /* Slight delay so the human can follow automated play. */
        var delay = Math.abs(parseInt(document.getElementById("speed_slider").value, 10))
        window.setTimeout(play_menace, delay / 10)
    }
}

function play_human(where){
    if(!no_winner || !human_turn || player !== "h"){
        return
    }
    if(board[where] !== 0){
        return
    }
    var boardBefore = board.slice()
    recordMenace2HumanMove(boardBefore, where)
    human_turn = false
    board[where] = 2
    mainBoardCellPlacePiece(where, 2)
    check_win()
    if(no_winner){
        play_menace()
    }
    updateHumanMoveControls()
}

function updateHumanMoveControls(){
    var wrap = document.getElementById("human_move_wrap")
    var inp = document.getElementById("human_cell_input")
    if(!wrap || !inp){ return }
    if(player !== "h"){
        wrap.hidden = true
        inp.disabled = true
        return
    }
    wrap.hidden = false
    inp.disabled = !human_turn || !no_winner
    if(!inp.disabled){
        inp.focus()
    }
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
        say("That cell is already taken.")
        return
    }
    if(!human_turn || player !== "h" || !no_winner){
        return
    }
    inp.value = ""
    play_human(idx)
}
