/*************************************/
/* MENACE — non-human opponent moves */
/* All assume board[] is current.    */
/*************************************/

function get_random_move(){
    var choices = []
    for(var i=0;i<9;i++){
        if(board[i] == 0){
            choices.push(i)
        }
    }
    return choices[Math.floor(Math.random()*choices.length)]
}

/* Unbeatable play for the given side (1=O, 2=X). */
function get_perfect_move_for_side(side){
    return minimax(board, side).index
}

function get_perfect_move(){
    return get_perfect_move_for_side(2)
}

/* Classic negamax-style scores: X wants high, O low; terminal depth bonus for faster wins. */
function minimax(newboard, player) {
    var who_wins = winner(newboard)
    if(who_wins!==false){
        if(who_wins == 1){
            return { score: -(10 + count(newboard,0)) }
        } else if(who_wins == 2){
            return { score: 10 + count(newboard,0) }
        } else if(who_wins == 0){
            return { score: 0 }
        }
    }
    var choices = []
    for(var i=0;i<9;i++){
        if(newboard[i] == 0){
            choices.push(i)
        }
    }
    var moves = []
    for(var i=0;i<choices.length;i++){
        var move = {}
        move.index = choices[i]
        newboard[choices[i]] = player
        var result = minimax(newboard, 3-player)
        move.score = result.score
        newboard[choices[i]] = 0
        moves.push(move)
    }
    var bestMove = 0
    var bestScore = player == 1 ? 1000 : -1000
    for(var i=0;i<moves.length;i++) {
        if((player == 2 && moves[i].score > bestScore) || (player == 1 && moves[i].score < bestScore)) {
            bestScore = moves[i].score
            bestMove = i
        }
    }
    var bestMoves = []
    for(var i=0;i<moves.length;i++) {
        if(moves[i].score == bestScore) {
            bestMoves.push(i)
        }
    }
    return moves[bestMoves[Math.floor(Math.random() * bestMoves.length)]]
}
