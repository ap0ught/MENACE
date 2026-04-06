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
        if(e.target && e.target.id === "im1"){
            syncIm1SliderDisplay()
        }
    })
    var hci = document.getElementById("human_cell_input")
    hci.addEventListener("keydown", function (e) {
        if(e.key === "Enter"){
            e.preventDefault()
            submitHumanCellInput()
        }
    })
    hci.addEventListener("change", function () {
        submitHumanCellInput()
    })
    /* Build both engines’ matchboxes and kick off first game (MENACE opens). */
    reset_menace("both")
})
