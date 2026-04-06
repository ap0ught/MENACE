/*************************************/
/* MENACE — localStorage persistence */
/*************************************/

var MENACE_STORAGE_KEY = "menace_app_state_v1"

function menaceSaveStateToStorage(){
    try{
        var payload = {
            v: 1,
            m1: {
                boxes: menace[1].boxes,
                orderedBoxes: menace[1].orderedBoxes,
                start: menace[1].start.slice(),
                removesymm: menace[1].removesymm,
                incentives: menace[1].incentives.slice()
            },
            m2: {
                boxes: menace[2].boxes,
                orderedBoxes: menace[2].orderedBoxes,
                start: menace[2].start.slice(),
                removesymm: menace[2].removesymm,
                incentives: menace[2].incentives.slice()
            },
            plotdata: plotdata.slice(),
            wins_each: wins_each.slice()
        }
        localStorage.setItem(MENACE_STORAGE_KEY, JSON.stringify(payload))
    }catch(e){}
}

function menaceTryLoadFromStorage(){
    try{
        var raw = localStorage.getItem(MENACE_STORAGE_KEY)
        if(!raw){ return false }
        var o = JSON.parse(raw)
        if(o.v !== 1 || !o.m1 || !o.m2){ return false }
        menace[1].boxes = o.m1.boxes
        menace[1].orderedBoxes = o.m1.orderedBoxes
        menace[1].start = o.m1.start
        menace[1].removesymm = o.m1.removesymm
        menace[1].incentives = o.m1.incentives
        menace[2].boxes = o.m2.boxes
        menace[2].orderedBoxes = o.m2.orderedBoxes
        menace[2].start = o.m2.start
        menace[2].removesymm = o.m2.removesymm
        menace[2].incentives = o.m2.incentives
        plotdata = o.plotdata
        wins_each = o.wins_each
        return true
    }catch(e){
        return false
    }
}

function menaceApplyLoadedScoresToDom(){
    for (var i=0;i<3;i++) {
        document.getElementById("dis"+i).textContent = String(wins_each[i])
    }
}
