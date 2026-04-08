/*************************************/
/* MENACE — status line & win totals */
/*************************************/

/* Oldest game left, newest right; drop from the left when over limit. */
var STREAK_MAX_CHARS = 50

function updateStreakIndicator(){
    var el = document.getElementById("streak_indicator")
    if(!el){ return }
    var slice = result_history
    if(slice.length > STREAK_MAX_CHARS){
        slice = result_history.slice(-STREAK_MAX_CHARS)
    }
    var out = []
    for(var i=0;i<slice.length;i++){
        var r = slice[i]
        if(r === 0){
            out.push("D")
        } else if(r === 1){
            out.push("0")
        } else if(r === 2){
            out.push("X")
        }
    }
    el.textContent = out.join("")
    el.title = "Oldest \u2192 newest: 0 = O won, X = X won, D = draw"
}

function say(stuff){
    var new_said = [stuff]
    for(var i=0;i<9;i++){
        new_said.push(said[i])
    }
    said = new_said
    document.getElementById("list_here").textContent = said.join("\n")
}

/* n is result index matching menace[1]["incentives"] usage in update_totals call chain. */
function update_totals(n){
    var prev1 = plotdata[plotdata.length-1]
    var prev2 = plotdata_menace2[plotdata_menace2.length-1]
    var d1 = 0
    var d2 = 0
    /* Keep reinforcement chart aligned with actual bead updates:
       only step for sides that recorded a trace this game. */
    if((player_o === "m" || player_o === "h") && menace[1]["moves"] && menace[1]["moves"].length){
        d1 = menace[1]["incentives"][n]
    }
    if((player_x === "m" || player_x === "h") && menace[2]["moves"] && menace[2]["moves"].length){
        d2 = menace[2]["incentives"][opposite_result(n)]
    }
    plotdata.push(prev1 + d1)
    plotdata_menace2.push(prev2 + d2)
    result_history.push(n)
    wins_each[n] += 1
    plot_cum_o.push(wins_each[1])
    plot_cum_draw.push(wins_each[0])
    plot_cum_x.push(wins_each[2])
    document.getElementById("dis"+n).textContent = String(wins_each[n])
    updateStreakIndicator()
    update_plot()
}
