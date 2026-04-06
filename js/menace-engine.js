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
                if(winner(newboard) === false && rotation_is_max(newboard)){
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
    for(var i=1;i<=2;i++){
        if(n==i || n=="both"){
            menace[i]["orderedBoxes"] = [[],[],[],[]]
            menace[i]["boxes"] = {}
        }
    }
    if(n == 1 || n == "both"){
        plotdata = [0]
        update_plot()
        redraw_plot()
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
    show_menace(1)
    if(player=="m"){
        show_menace(2)
    }
    new_game()
}

function update_set_r(n){
    update_set(n)
    reset_menace(n)
}

/* Read form fields into menace[n]; does not rebuild boxes until update_set_r. */
function update_set(n){
    menace[n]["removesymm"] = (!document.getElementById("_"+n+"_includeall") || document.getElementById("_"+n+"_includeall").checked)
    if(n==1){
        menace[1]["start"][0] = parseInt(document.getElementById("im1").value)
        menace[1]["start"][1] = parseInt(document.getElementById("im3").value)
        menace[1]["start"][2] = parseInt(document.getElementById("im5").value)
        menace[1]["start"][3] = parseInt(document.getElementById("im7").value)
    }
    if(n==2){
        menace[2]["start"][0] = parseInt(document.getElementById("im2").value)
        menace[2]["start"][1] = parseInt(document.getElementById("im4").value)
        menace[2]["start"][2] = parseInt(document.getElementById("im6").value)
        menace[2]["start"][3] = parseInt(document.getElementById("im8").value)
    }
    menace[n]["incentives"][1] = parseInt(document.getElementById("_"+n+"_ic_w").value)
    menace[n]["incentives"][0] = parseInt(document.getElementById("_"+n+"_ic_d").value)
    menace[n]["incentives"][2] = -parseInt(document.getElementById("_"+n+"_ic_l").value)
    hide_set(n)
}

function box_add(pos,move,change,n){
    menace[n]["boxes"][pos][move] = Math.max(0,change+menace[n]["boxes"][pos][move])
    update_box(pos,n)
}

/* After each finished game, reinforce every (pos,move) recorded in menace[*].moves. */
function menace_add_beads(result){
    for(var i=0;i<menace[1]["moves"].length;i++){
        box_add(menace[1]["moves"][i][0],menace[1]["moves"][i][1],menace[1]["incentives"][result],1)
    }
    if(player=="m"){
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
    } else {
        var pos = board.join("")
        var which_rot = find_rotation(pos)
        var pos = apply_rotation(pos,rotations[which_rot])
        var plays = menace[n]["boxes"][pos]
        var where = make_move(plays)
        if(where == "resign"){return "resign"}
        document.getElementById(pos+"-"+where).style.color = "#FF0000"
        var inv_where = rotations[which_rot][where]
        menace[n]["moves"].push([pos,where])
    }
    return inv_where
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
