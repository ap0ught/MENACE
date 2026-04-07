/*************************************/
/* MENACE — wire DOM & start         */
/* Must load after all other scripts.*/
/*************************************/

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("p2picker").value = "h"
    document.getElementById("speeddiv").style.display = "none"
    document.getElementById("p2picker").addEventListener("change", function () {
        setPlayer(this.value)
    })
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
    if(menaceTryLoadFromStorage()){
        menaceApplyLoadedScoresToDom()
        redraw_plot()
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
