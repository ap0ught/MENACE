/*************************************/
/* MENACE — matchboxes & learning    */
/* Builds positions, samples moves,  */
/* applies bead rewards after games. */
/*************************************/

/* s = move-phase index 0..3 into start[] and orderedBoxes[s]. */
function add_box(pos,n,s){
    menace[n]["orderedBoxes"][s].push(pos)
    menace[n]["boxes"][pos] = new_box(pos,n,menace[n]["start"][s])
}

/* Bead array for one matchbox: illegal cells and symmetry duplicates zeroed. */
function new_box(pos,n,start){
    var rots = find_all_rotations(pos)
    var box = array_fill(0,9,start)
    for(var i=0;i<9;i++){
        if(pos[i] != "0"){
            box[i] = 0
        }
    }
    if(menace[n]["removesymm"]){
        for(var i=1;i<rots.length;i++){
            var r = rotations[rots[i]]
            for(var j=0;j<9;j++){
                if(r[j]!=j){
                    box[Math.min(j,r[j])] = 0
                }
            }
        }
    }
    return box
}

/* Canonical position string for the current board (same rotation as get_menace_move). */
function menaceCanonicalPosFromBoard(boardArr){
    var pos = boardArr.join("")
    var which_rot = find_rotation(pos)
    return apply_rotation(pos,rotations[which_rot])
}

/* Phase index 0..3 into start[] / orderedBoxes for engine n before its next move. */
function menaceMovePhaseIndex(n, boardArr){
    if(n === 1){
        return count(boardArr, 1)
    }
    return count(boardArr, 2)
}

/* Rebuild one matchbox from configured starting beads for this turn (after empty-bead resign). */
function restoreMenaceMatchboxFromStartingBeads(n, boardArr){
    var pos = menaceCanonicalPosFromBoard(boardArr)
    var s = menaceMovePhaseIndex(n, boardArr)
    menace[n]["boxes"][pos] = new_box(pos, n, menace[n]["start"][s])
    update_box(pos, n)
    menaceScheduleSave()
}

/* DFS over partial games; registers canonical positions for the engine that moves next. */
function search_moves(b, n){
    var played = 10 - count(b,0)
    var move = 2 - played%2
    var other = 3 - move
    var minmove = 9
    for(var i=8;i>=0;i--){
        if(b[i] == move){
            minmove = i
        }
    }
    for(var i=0;i<minmove;i++){
        if(b[i]==0){
            var newboard = b.slice()
            newboard[i] = move
            if(n == other || n == "both"){
                if(winner(newboard) === false && rotation_is_max(newboard.join(""))){
                    add_box(newboard.join(""),other,Math.floor(played/2))
                }
            }
                if(played < 7){
                    search_moves(newboard,n)
                }
        }
    }
}

function order_boxes(n){
    //menace[n]["orderedBoxes"] = menace[n]["orderedBoxes"][0].concat(menace[n]["orderedBoxes"][1],menace[n]["orderedBoxes"][2],menace[n]["orderedBoxes"][3])
}

/* Clear learning for engine(s), rebuild all boxes from scratch, redraw UI, start a game. */
function reset_menace(n){
    playagain = true
    menaceLastBoxPos[1] = null
    menaceLastBoxPos[2] = null
    if(typeof renderMenaceMatchboxTrackBoxes === "function"){
        renderMenaceMatchboxTrackBoxes()
    }
    for(var i=1;i<=2;i++){
        if(n==i || n=="both"){
            menace[i]["orderedBoxes"] = [[],[],[],[]]
            menace[i]["boxes"] = {}
        }
    }
    if(n == 1 || n == "both"){
        plotdata = [0]
        plotdata_menace2 = [0]
        result_history = []
        plot_cum_o = [0]
        plot_cum_draw = [0]
        plot_cum_x = [0]
        role_events = []
        redraw_plot()
        updateStreakIndicator()
        wins_each = [0,0,0]
        for (var i=0;i<3;i++) {
            document.getElementById("dis"+i).textContent = String(wins_each[i])
        }

        add_box("000000000",1,0)
    }

    search_moves(array_fill(0,9,0),n)

    for(var i=1;i<=2;i++){
        if(n == i || n == "both"){
            order_boxes(i)
        }
    }
    showMenacePanels()
    if(typeof menaceRefreshOpenPopoutGrids === "function"){
        menaceRefreshOpenPopoutGrids()
    }
    new_game()
}

function update_set_r(n, doc){
    update_set(n, doc)
    reset_menace(n)
}

/* Read form fields into menace[n]; does not rebuild boxes until update_set_r. */
/* doc: optional root document (e.g. popout) — defaults to main document. */
function update_set(n, doc){
    var d = doc || document
    menace[n]["removesymm"] = (!d.getElementById("_"+n+"_includeall") || d.getElementById("_"+n+"_includeall").checked)
    if(n==1){
        menace[1]["start"][0] = parseInt(d.getElementById("im1").value, 10)
        menace[1]["start"][1] = parseInt(d.getElementById("im3").value, 10)
        menace[1]["start"][2] = parseInt(d.getElementById("im5").value, 10)
        menace[1]["start"][3] = parseInt(d.getElementById("im7").value, 10)
    }
    if(n==2){
        menace[2]["start"][0] = parseInt(d.getElementById("im2").value, 10)
        menace[2]["start"][1] = parseInt(d.getElementById("im4").value, 10)
        menace[2]["start"][2] = parseInt(d.getElementById("im6").value, 10)
        menace[2]["start"][3] = parseInt(d.getElementById("im8").value, 10)
    }
    menace[n]["incentives"][1] = parseInt(d.getElementById("_"+n+"_ic_w").value, 10)
    menace[n]["incentives"][0] = parseInt(d.getElementById("_"+n+"_ic_d").value, 10)
    menace[n]["incentives"][2] = -parseInt(d.getElementById("_"+n+"_ic_l").value, 10)
    var nb = d.getElementById("_"+n+"_no_beads")
    if(nb){
        menace[n]["noBeads"] = nb.value === "pause" ? "pause" : "reset"
    }
    if(typeof menaceScheduleSave === "function"){
        menaceScheduleSave()
    }
    hide_set(n, doc)
}

function box_add(pos,move,change,n){
    menace[n]["boxes"][pos][move] = Math.max(0,change+menace[n]["boxes"][pos][move])
    update_box(pos,n)
}

/* After each finished game, reinforce every (pos,move) recorded in menace[*].moves. */
function menace_add_beads(result){
    if((player_o === "m" || player_o === "h") && menace[1]["moves"].length){
        for(var i=0;i<menace[1]["moves"].length;i++){
            box_add(menace[1]["moves"][i][0],menace[1]["moves"][i][1],menace[1]["incentives"][result],1)
        }
    }
    if((player_x === "m" || player_x === "h") && menace[2]["moves"].length){
        for(var i=0;i<menace[2]["moves"].length;i++){
            box_add(menace[2]["moves"][i][0],menace[2]["moves"][i][1],menace[2]["incentives"][opposite_result(result)],2)
        }
    }
    update_totals(result)
}

/* Returns main-board index 0..8. Stores move in rotated canonical coordinates in moves[]. */
function get_menace_move(n){
    var inv_where = 0
    if(count(board,0) == 1){
        for(var i=0;i<9;i++){
            if(board[i] == 0){
                inv_where = i
            }
        }
        if(typeof setMenaceLastBoxUsed === "function"){
            setMenaceLastBoxUsed(n, menaceCanonicalPosFromBoard(board))
        }
    } else {
        var pos = board.join("")
        var which_rot = find_rotation(pos)
        var pos = apply_rotation(pos,rotations[which_rot])
        var plays = menace[n]["boxes"][pos]
        var where = make_move(plays)
        if(where == "resign"){return "resign"}
        var hl = document.getElementById("m"+n+"-"+pos+"-"+where)
        if(hl){ hl.style.color = "#FF0000" }
        inv_where = rotations[which_rot][where]
        menace[n]["moves"].push([pos,where])
        if(typeof setMenaceLastBoxUsed === "function"){
            setMenaceLastBoxUsed(n, pos)
        }
    }
    return inv_where
}

/* Human move: record in learner n’s trace (canonical pos + slot), mirroring get_menace_move(n). */
function recordHumanLearnerMove(engineId, boardBefore, realWhere){
    if(count(boardBefore,0) == 1){
        if(typeof setMenaceLastBoxUsed === "function"){
            setMenaceLastBoxUsed(engineId, menaceCanonicalPosFromBoard(boardBefore))
        }
        return
    }
    var posStr = boardBefore.join("")
    var which_rot = find_rotation(posStr)
    var posCanon = apply_rotation(posStr,rotations[which_rot])
    var whereCanon = -1
    for(var j=0;j<9;j++){
        if(rotations[which_rot][j] == realWhere){
            whereCanon = j
            break
        }
    }
    if(whereCanon < 0){ return }
    menace[engineId]["moves"].push([posCanon, whereCanon])
    var hl = document.getElementById("m"+engineId+"-"+posCanon+"-"+whereCanon)
    if(hl){ hl.style.color = "#FF0000" }
    if(typeof setMenaceLastBoxUsed === "function"){
        setMenaceLastBoxUsed(engineId, posCanon)
    }
}

function recordMenace2HumanMove(boardBefore, realWhere){
    recordHumanLearnerMove(2, boardBefore, realWhere)
}

/* Stochastic choice: index i with probability plays[i] / sum(plays). */
function make_move(plays){
    var total = 0
    for(var i=0;i<plays.length;i++){
        total += plays[i]
    }
    if(total == 0){
        return "resign"
    } else {
        var rnd = Math.floor(Math.random()*total)
        total = 0
        for(var i=0;i<plays.length;i++){
            total += plays[i]
            if(rnd < total){
                return i
            }
        }
    }
}
