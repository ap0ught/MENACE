/*************************************/
/* MENACE — matchbox grid & settings */
/* Single combined panel: MENACE | MENACE2 */
/*************************************/

/* Mini-board cell ids are prefixed by engine n so both columns can coexist. */
function make_ox(pos,n){
    var pfx = "m"+n+"-"
    var output = "<div class='center'><table class='board'>"
    for(var i=0;i<9;i++){
        if(i%3 == 0){output+="<tr>"}
        output += "<td id='"+pfx+pos+"-"+i+"' class='p"+i
        if(pos[i] == 0){
            var beads = (menace[n]["boxes"][pos] && menace[n]["boxes"][pos][i] !== undefined) ? menace[n]["boxes"][pos][i] : 0
            output += " num'>"+beads+"</td>"
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
    var wrap = document.getElementById("m"+n+"_board_"+key)
    if(wrap){ wrap.innerHTML = make_ox(key,n) }
}

/* Clamp and sync a range input plus its paired _display span (id + "_display"). */
function setMenaceSliderValue(sliderId, value, min, max){
    var el = document.getElementById(sliderId)
    if(!el){ return }
    var v = Math.min(max, Math.max(min, value))
    el.value = String(v)
    var disp = document.getElementById(sliderId + "_display")
    if(disp){ disp.textContent = String(v) }
    var unit = document.getElementById(sliderId + "_unit")
    if(unit){ unit.textContent = v === 1 ? "bead" : "beads" }
}

/* Copy engine n state into the settings form (shown when user expands panel). */
function show_set(n){
    if(n==1){
        setMenaceSliderValue("im1", menace[1]["start"][0], 1, 20)
        setMenaceSliderValue("im3", menace[1]["start"][1], 1, 20)
        setMenaceSliderValue("im5", menace[1]["start"][2], 1, 20)
        setMenaceSliderValue("im7", menace[1]["start"][3], 1, 20)
    }
    if(n==2){
        setMenaceSliderValue("im2", menace[2]["start"][0], 1, 20)
        setMenaceSliderValue("im4", menace[2]["start"][1], 1, 20)
        setMenaceSliderValue("im6", menace[2]["start"][2], 1, 20)
        setMenaceSliderValue("im8", menace[2]["start"][3], 1, 20)
    }
    setMenaceSliderValue("_"+n+"_ic_w", menace[n]["incentives"][1], 0, 20)
    setMenaceSliderValue("_"+n+"_ic_d", menace[n]["incentives"][0], 0, 20)
    setMenaceSliderValue("_"+n+"_ic_l", -menace[n]["incentives"][2], 0, 20)
    document.getElementById("_"+n+"_includeall").checked = menace[n]["removesymm"]
    document.getElementById("_"+n+"_tweak_h").style.display = "block"
    document.getElementById("_"+n+"_tweak_s").style.display = "none"
}

function hide_set(n){
    document.getElementById("_"+n+"_tweak_h").style.display = "none"
    document.getElementById("_"+n+"_tweak_s").style.display = "block"
}

/* One engine column: title, settings toggle, sliders, matchbox grid. */
function buildMenaceColumnHTML(n){
    var menacename = n === 2 ? "MENACE2" : "MENACE"
    var output = "<div class='menace-panel menace-panel-col' data-menace-col='"+n+"'>"
    output += "<h3 class='menace-col-heading'>"+menacename+"</h3>"
    output += "<div id='_"+n+"_tweak_s' class='menace-tweak-reveal'><button type='button' data-menace-action='show-settings' data-menace-id='"+n+"' class='menace-linkish'>Settings &#x25BC;</button></div>"
    output += "<div class='menace_settings' id='_"+n+"_tweak_h'>"
    output += "<div class='menace-tweak-hide'><button type='button' data-menace-action='hide-settings' data-menace-id='"+n+"' class='menace-linkish'>&#x25B2; Hide settings</button></div>"
    output += "<div class='menace-settings-inner'>"
    output += "<div class='menace_settings_title'>Starting beads per turn</div>"
    if(n==1){
        var s = menace[1]["start"]
        output += menaceBeadSliderRow("im1", "1st move", s[0])
        output += menaceBeadSliderRow("im3", "3rd move", s[1])
        output += menaceBeadSliderRow("im5", "5th move", s[2])
        output += menaceBeadSliderRow("im7", "7th move", s[3])
    }
    if(n==2){
        var s2 = menace[2]["start"]
        output += menaceBeadSliderRow("im2", "2nd move", s2[0])
        output += menaceBeadSliderRow("im4", "4th move", s2[1])
        output += menaceBeadSliderRow("im6", "6th move", s2[2])
        output += menaceBeadSliderRow("im8", "8th move", s2[3])
    }
    output += "<label class='menace-checkbox-row'><input type='checkbox' id='_"+n+"_includeall'> Merge symmetric positions</label>"
    output += "<div class='menace_settings_title'>Bead rewards (per game)</div>"
    var ic = menace[n]["incentives"]
    output += menaceIncentiveSliderRow(n, "w", "Win", ic[1], 0, 20)
    output += menaceIncentiveSliderRow(n, "d", "Draw", ic[0], 0, 20)
    output += menaceIncentiveSliderRow(n, "l", "Lose", -ic[2], 0, 20)
    output += "<div class='menace-settings-actions'>"
    output += "<button type='button' class='menace-btn-solid' data-menace-action='update' data-menace-id='"+n+"'>Save settings</button>"
    output += "<button type='button' class='menace-btn-solid menace-btn-warn' data-menace-action='update-reset' data-menace-id='"+n+"'>Save &amp; reset "+menacename+"</button>"
    output += "</div></div></div>"
    var boxout = ""
    var numb = 0
    for(var move=0;move<menace[n]["orderedBoxes"].length;move++){
        var moven = move * 2 + n;
        var ord = menace[n]["orderedBoxes"][move]
        if(moven == 1){
            boxout += "<div class='menace-move-group'>1st move &middot; 1 box</div>";
        } else {
            var ordWord = ["","second","third","fourth","fifth","sixth","seventh","eighth","ninth"][moven-1] || ("move "+moven)
            boxout += "<div class='menace-move-group'>"+ordWord+" move &middot; "+ord.length+" boxes</div>";
        }
        var cols = 0
        boxout += "<div class='menace-moves-wrap'><table class='moves'>"
        for(var k=0;k<ord.length;k++){
            var key = ord[k]
            if(cols == 0){
                boxout += "<tr>"
            }
            cols += 1
            numb += 1
            boxout += "<td class='board' id='m"+n+"_board_"+key+"'>"+make_ox(key,n)+"</td>"
            if(cols == 7){
                boxout += "</tr>"
                cols = 0
            }
        }
        if(cols != 0){
            boxout += "</tr>"
        }
        boxout += "</table></div>"
    }
    output += "<p class='menace-matchbox-intro'><strong>"+numb+"</strong> matchboxes total</p>"
    output += boxout
    output += "</div>"
    return output
}

/* One bordered region: pop-out control + two columns (O learner | X learner). */
function showMenacePanels(){
    var root = document.getElementById("menace_panels_root")
    if(!root){ return }
    var html = "<div class='menace-combined-box'>"
    html += "<div class='menace-combined-toolbar'>"
    html += "<button type='button' data-menace-action='popout-panels' class='menace-popout-btn'>Pop out</button>"
    html += "</div>"
    html += "<div class='menace-two-columns'>"
    html += buildMenaceColumnHTML(1)
    html += buildMenaceColumnHTML(2)
    html += "</div></div>"
    root.innerHTML = html
}

function hide_menace(n){
    /* Legacy: both engines live in one host; clearing n only is unused. */
    if(n === 1 || n === 2){
        var root = document.getElementById("menace_panels_root")
        if(root){ root.innerHTML = "" }
    }
}

function openMenacePanelsPopup(){
    var host = document.getElementById("menace_panels_root")
    if(!host){ return }
    var cssUrl = new URL("styles.css", window.location.href).href
    var w = window.open("", "menaceMatchboxes", "width=1100,height=720,scrollbars=yes,resizable=yes")
    if(!w){ return }
    w.document.open()
    w.document.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>MENACE matchboxes</title>")
    w.document.write("<link rel=\"stylesheet\" href=\""+cssUrl+"\">")
    w.document.write("</head><body class=\"menace-popup-body\">")
    w.document.write(host.innerHTML)
    w.document.write("<p class=\"menace-popup-note\"><em>View only.</em> Use the main window to play and change settings; reopen this window to refresh the view.</p>")
    w.document.write("</body></html>")
    w.document.close()
}

/* id e.g. im1; value clamped 1..20 for initial HTML in show_menace. */
function menaceBeadSliderRow(id, label, v){
    v = Math.min(20, Math.max(1, v))
    return "<div class='menace-slider-row'><span class='menace-slider-label'>"+label+"</span><input type='range' min='1' max='20' step='1' class='slider menace-settings-slider' id='"+id+"' aria-label='"+label+"' value='"+v+"' /><span class='menace-slider-num' id='"+id+"_display'>"+v+"</span></div>"
}

/* kind: w | d | l — paired span id is _n_ic_w_display etc. */
function menaceIncentiveSliderRow(n, kind, label, v, min, max){
    v = Math.min(max, Math.max(min, v))
    var sid = "_"+n+"_ic_"+kind
    var unit = v === 1 ? "bead" : "beads"
    var tail
    if(kind === "l"){
        tail = "take <span id='"+sid+"_display'>"+v+"</span> <span class='menace-ic-unit' id='"+sid+"_unit'>"+unit+"</span>"
    } else {
        tail = "+<span id='"+sid+"_display'>"+v+"</span> <span class='menace-ic-unit' id='"+sid+"_unit'>"+unit+"</span>"
    }
    return "<div class='menace-slider-row menace-ic-row'><span class='menace-slider-label'>"+label+"</span><input type='range' min='"+min+"' max='"+max+"' step='1' class='slider menace-settings-slider' id='"+sid+"' aria-label='"+label+"' value='"+v+"' /><span class='menace-ic-value'>"+tail+"</span></div>"
}

function syncMenaceSettingSliderDisplay(el){
    if(!el || el.type !== "range" || !el.classList.contains("menace-settings-slider")){ return }
    var disp = document.getElementById(el.id + "_display")
    if(disp){ disp.textContent = el.value }
    var unit = document.getElementById(el.id + "_unit")
    if(unit){
        var nv = parseInt(el.value, 10)
        unit.textContent = nv === 1 ? "bead" : "beads"
    }
}

/* show_menace(n) kept as alias for single-column refresh — rebuilds full combined panel. */
function show_menace(n){
    showMenacePanels()
}

/* One listener for dynamically created settings buttons (CSP: no inline handlers). */
function onMenaceDelegatedClick(e) {
    var el = e.target.closest("[data-menace-action]")
    if (!el) return
    var action = el.getAttribute("data-menace-action")
    if (action === "popout-panels") {
        openMenacePanelsPopup()
        return
    }
    var id = parseInt(el.getAttribute("data-menace-id"), 10)
    if (id !== 1 && id !== 2) return
    if (action === "show-settings") show_set(id)
    else if (action === "hide-settings") hide_set(id)
    else if (action === "update") update_set(id)
    else if (action === "update-reset") update_set_r(id)
}
