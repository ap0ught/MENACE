/*************************************/
/* MENACE — status line & win totals */
/*************************************/

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
    plotdata.push(plotdata[plotdata.length-1]+menace[1]["incentives"][n])
    wins_each[n] += 1
    document.getElementById("dis"+n).textContent = String(wins_each[n])
    update_plot()
}
