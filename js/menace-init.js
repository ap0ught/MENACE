/*************************************/
/* MENACE — wire DOM & start         */
/* Must load after all other scripts.*/
/*************************************/

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("p1picker").value = "m"
    document.getElementById("p2picker").value = "h"
    player_o = "m"
    player_x = "h"
    document.getElementById("speed_slider").value = "1000"
    updateSpeedDisplay()
    var p1 = document.getElementById("p1picker")
    var p2 = document.getElementById("p2picker")
    if(p1){
        p1.addEventListener("change", syncPlayersFromPickers)
    }
    if(p2){
        p2.addEventListener("change", syncPlayersFromPickers)
    }
    var ss = document.getElementById("speed_slider")
    if(ss){
        ss.addEventListener("input", function () {
            updateSpeedDisplay()
            resumeFromPauseIfNeeded()
        })
    }
    updateSpeedVisibility()
    updatePlayerModeHelp()
    document.addEventListener("click", onMenaceDelegatedClick)
    document.addEventListener("input", function (e) {
        var t = e.target
        if(t && t.type === "range" && t.classList.contains("menace-settings-slider")){
            syncMenaceSettingSliderDisplay(t)
        }
    })
    var hci = document.getElementById("human_cell_input")
    hci.addEventListener("input", function () {
        var digits = String(hci.value).replace(/[^1-9]/g, "")
        hci.value = digits.slice(0, 1)
        if(/^[1-9]$/.test(hci.value)){
            submitHumanCellInput()
        }
    })
    hci.addEventListener("keydown", function (e) {
        if(e.key === "Enter"){
            e.preventDefault()
            submitHumanCellInput()
        }
    })
    var pm = document.getElementById("plot_mode")
    if(pm){
        pm.addEventListener("change", function () {
            redraw_plot()
        })
    }
    var pw = document.getElementById("plot_window")
    if(pw){
        pw.addEventListener("input", function () {
            redraw_plot()
        })
        pw.addEventListener("change", function () {
            redraw_plot()
        })
    }
    if(menaceTryLoadFromStorage()){
        menaceApplyLoadedScoresToDom()
        redraw_plot()
        updateStreakIndicator()
        showMenacePanels()
        new_game()
    } else {
        reset_menace("both")
    }
    /* After layout, ensure keyboard focus is on the move field when it is active. */
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            updateHumanMoveControls()
        })
    })
})
