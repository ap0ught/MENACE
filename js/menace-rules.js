/*************************************/
/* MENACE — board geometry & outcomes */
/* Pure game logic: rotations, wins.  */
/*************************************/

/* Eight lines of tic-tac-toe as index triples into board/position string. */
var pwns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2]
]

/* Each row maps canonical cell index → index after that symmetry (pos is 9-char string). */
var rotations=[
    [0,1,2,3,4,5,6,7,8],
    [0,3,6,1,4,7,2,5,8],
    [6,3,0,7,4,1,8,5,2],
    [6,7,8,3,4,5,0,1,2],
    [8,7,6,5,4,3,2,1,0],
    [8,5,2,7,4,1,6,3,0],
    [2,5,8,1,4,7,0,3,6],
    [2,1,0,5,4,3,8,7,6]
]

function apply_rotation(pos,rot){
    var new_pos = ""
    for(var j=0;j<9;j++){
        new_pos += pos[rot[j]]
    }
    return new_pos
}

/* Among all rotated strings, pick those with maximal lexicographic string — canonical reps. */
function find_all_rotations(pos){
    var max = -1
    var max_rot = []
    for(var i=0;i<rotations.length;i++){
        var try_pos = apply_rotation(pos,rotations[i])
        if(try_pos > max){
            max = try_pos
            max_rot = []
        }
        if(try_pos == max){
            max_rot.push(i)
        }
    }
    return max_rot
}

/* Random tie-break among symmetries that yield the canonical (max) encoding. */
function find_rotation(pos){
    var max_rot = find_all_rotations(pos)
    return max_rot[Math.floor(Math.random()*max_rot.length)]
}

/* pos is "0"/"1"/"2" string; returns winner 1 or 2, or 0 if no three-in-a-row yet. */
function three(pos){
    for(var i=0;i<pwns.length;i++){
        if(pos[pwns[i][0]] != "0" && pos[pwns[i][0]] == pos[pwns[i][1]] && pos[pwns[i][1]] == pos[pwns[i][2]]){
            return parseInt(pos[pwns[i][0]])
        }
    }
    return 0
}

/* True if this board’s string is already the canonical rotation (identity in max set). */
function rotation_is_max(pos){
    var rots = find_all_rotations(pos)
    return rots[0] == 0
}

/* b is int array 0/1/2; returns false if ongoing, 0 draw, 1 or 2 winner. */
function winner(b){
    var pos = b.join("")
    var th = three(pos)
    if(th != 0){
        return th
    }
    if(count(b,0) == 0){
        return 0
    }
    return false
}

/* Swap win/loss for the other engine when both learn from the same game. Draw stays draw. */
function opposite_result(r){
    if(r==0){
        return 0
    }
    return 3-r
}
