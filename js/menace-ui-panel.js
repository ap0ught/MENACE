/*************************************/
/* MENACE — matchbox grid & settings */
/* Injects HTML into _1_moves/_2_moves.*/
/*************************************/

/* pos: 9-char board key; n: engine 1 or 2. Renders mini-board with bead counts or marks. */
function make_ox(pos,n){
    var output = "<div class='center'><table class='board'>"
    for(var i=0;i<9;i++){
        if(i%3 == 0){output+="<tr>"}
        output += "<td id='"+pos+"-"+i+"' class='p"+i
        if(pos[i] == 0){
            output += " num'>"+menace[n]["boxes"][pos][i]+"</td>"
        } else {
            output += "'>"
            output += pieces[pos[i]]
            output += "</td>"
        }
        if(i%3 == 2){output+="</tr>"}
    }
    output += "</table></div>"
    return output
}

function update_box(key,n){
    document.getElementById("board"+key).innerHTML = make_ox(key,n)
}

/* Copy engine n state into the settings form (shown when user expands panel). */
function show_set(n){
    if(n==1){
        var firstBeads = menace[1]["start"][0]
        firstBeads = Math.min(20, Math.max(1, firstBeads))
        document.getElementById("im1").value = String(firstBeads)
        var im1d = document.getElementById("im1_display")
        if(im1d){ im1d.textContent = String(firstBeads) }
        document.getElementById("im3").value = menace[1]["start"][1]
        document.getElementById("im5").value = menace[1]["start"][2]
        document.getElementById("im7").value = menace[1]["start"][3]
    }
    if(n==2){
        document.getElementById("im2").value = menace[2]["start"][0]
        document.getElementById("im4").value = menace[2]["start"][1]
        document.getElementById("im6").value = menace[2]["start"][2]
        document.getElementById("im8").value = menace[2]["start"][3]
    }
    document.getElementById("_"+n+"_ic_w").value = menace[n]["incentives"][1]
    document.getElementById("_"+n+"_ic_d").value = menace[n]["incentives"][0]
    document.getElementById("_"+n+"_ic_l").value = -menace[n]["incentives"][2]
    document.getElementById("_"+n+"_includeall").checked = menace[n]["removesymm"]
    document.getElementById("_"+n+"_tweak_h").style.display = "block"
    document.getElementById("_"+n+"_tweak_s").style.display = "none"
}

function hide_set(n){
    document.getElementById("_"+n+"_tweak_h").style.display = "none"
    document.getElementById("_"+n+"_tweak_s").style.display = "block"
}

/* Rebuild entire side panel: settings block + all matchbox thumbnails in move groups. */
function show_menace(n){
    var menacename = "MENACE"
    if(n==2){
        menacename += "2"
    }
    var output = "<div class='menace-panel'>"
    output += "<div id='_"+n+"_tweak_s'><div class='center'><button type='button' data-menace-action='show-settings' data-menace-id='"+n+"'>&#x25BC; Show "+menacename+"'s settings &#x25BC;</button></div></div>"
    output += "<div class='menace_settings' id='_"+n+"_tweak_h'><div class='center'><button type='button' data-menace-action='hide-settings' data-menace-id='"+n+"'>&#x25B2; Hide "+menacename+"'s settings &#x25B2;</button></div>"
    output += "<div class='menace_settings_title'>Number of beads in each box before any games are played</div>"
    if(n==1){
        var im1v = Math.min(20, Math.max(1, menace[1]["start"][0]))
        output += "First Moves: <input type='range' min='1' max='20' step='1' class='slider' id='im1' aria-label='Beads for first moves' value='"+im1v+"' /> <span id='im1_display'>"+im1v+"</span><br />"
        output += "Third Moves: <input size=1 id='im3' /><br />"
        output += "Fifth Moves: <input size=1 id='im5' /><br />"
        output += "Seventh Moves: <input size=1 id='im7'><br />"
    }
    if(n==2){
        output += "Second Moves: <input size=1 id='im2' /><br />"
        output += "Fourth Moves: <input size=1 id='im4' /><br />"
        output += "Sixth Moves: <input size=1 id='im6' /><br />"
        output += "Eighth Moves: <input size=1 id='im8'><br />"
    }
    output += "<label><input type='checkbox' id='_"+n+"_includeall'>Treat symmetrically equivalent moves as if they are the same move</label><br />"
    output += "<div class='menace_settings_title'>Incentives</div>"
    output += "Win: Add <input size=1 id='_"+n+"_ic_w' /> beads<br/>"
    output += "Draw: Add <input size=1 id='_"+n+"_ic_d' /> beads<br/>"
    output += "Lose: Take <input size=1 id='_"+n+"_ic_l' /> beads"
    output += "<div class='menace_settings_title'>Update settings</div>"
    output += "To save these settings, press this button:"
    output += "<div><button type='button' class='menace-btn-solid' data-menace-action='update' data-menace-id='"+n+"'>Update "+menacename+"</button></div>"
    output += "<br />To save these settings and reset MENACE to their initial state before and games are played, press this button:"
    output += "<div><button type='button' class='menace-btn-solid' data-menace-action='update-reset' data-menace-id='"+n+"'>Update and reset "+menacename+"</button></div>"
    output += "<br /><div class='center'><button type='button' data-menace-action='hide-settings' data-menace-id='"+n+"'>&#x25B2; Hide "+menacename+"'s settings &#x25B2;</button></div>"
    output += "</div>"
    output += "<br />";
    var boxout = ""
    var numb = 0
    for(var move=0;move<menace[n]["orderedBoxes"].length;move++){
        var moven = move * 2 + n;
        if(moven == 1){
            boxout += "This box is for the first move:";
        } else {
            boxout += "These "+menace[n]["orderedBoxes"][move].length+" boxes are for the "
            if(moven == 2){boxout += "second"} else
            if(moven == 3){boxout += "third"} else
            if(moven == 4){boxout += "fourth"} else
            if(moven == 5){boxout += "fifth"} else
            if(moven == 6){boxout += "sixth"} else
            if(moven == 7){boxout += "seventh"} else
            if(moven == 8){boxout += "eighth"} else
            if(moven == 9){boxout += "ninth"}
            boxout += " move:"
        }
        boxout += "<br />";
        var cols = 0
        boxout += "<div class='center'><table class='moves'>"
        for(var k=0;k<menace[n]["orderedBoxes"][move].length;k++){
            var key = menace[n]["orderedBoxes"][move][k]
            if(cols == 0){
                boxout += "<tr>"
            }
            cols += 1
            numb += 1
            boxout += "<td class='board' id='board"+key+"'>"+make_ox(key,n)+"</td>"
            if(cols == 7){
                boxout += "</tr>"
                cols = 0
            }
        }
        if(cols != 0){
            boxout += "</tr>"
        }
        boxout += "</table></div><br /><br />"
    }
    output += "This box shows all " + numb + " matchboxes that make up "+menacename+".<br /><br />"
    output += boxout
    output += "<br /><br />";
    output += "</div>"
    document.getElementById("_"+n+"_moves").innerHTML = output
}

function hide_menace(n){
    document.getElementById("_"+n+"_moves").innerHTML = ""
}

function syncIm1SliderDisplay(){
    var el = document.getElementById("im1")
    var disp = document.getElementById("im1_display")
    if(el && disp){
        disp.textContent = el.value
    }
}

/* One listener for dynamically created settings buttons (CSP: no inline handlers). */
function onMenaceDelegatedClick(e) {
    var el = e.target.closest("[data-menace-action]")
    if (!el) return
    var id = parseInt(el.getAttribute("data-menace-id"), 10)
    if (id !== 1 && id !== 2) return
    var action = el.getAttribute("data-menace-action")
    if (action === "show-settings") show_set(id)
    else if (action === "hide-settings") hide_set(id)
    else if (action === "update") update_set(id)
    else if (action === "update-reset") update_set_r(id)
}
