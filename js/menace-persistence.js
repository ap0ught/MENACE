/*************************************/
/* MENACE — localStorage persistence */
/*************************************/

var MENACE_STORAGE_KEY = "menace_app_state_v1"

function menaceIsObject(value){
    return value !== null && typeof value === "object"
}

function menaceIsArrayOfArrays(value){
    if(!Array.isArray(value)){ return false }
    for(var i=0;i<value.length;i++){
        if(!Array.isArray(value[i])){ return false }
    }
    return true
}

function menaceIsValidLoadedPlayerState(state){
    return menaceIsObject(state) &&
        menaceIsObject(state.boxes) &&
        menaceIsArrayOfArrays(state.orderedBoxes) &&
        Array.isArray(state.start) &&
        typeof state.removesymm === "boolean" &&
        Array.isArray(state.incentives)
}

var _menaceSaveTimer = null
function menaceScheduleSave(){
    if(_menaceSaveTimer){ clearTimeout(_menaceSaveTimer) }
    _menaceSaveTimer = setTimeout(menaceSaveStateToStorage, 500)
}

function menaceSaveStateToStorage(){
    _menaceSaveTimer = null
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
        if(
            !menaceIsValidLoadedPlayerState(o.m1) ||
            !menaceIsValidLoadedPlayerState(o.m2) ||
            !Array.isArray(o.plotdata) ||
            !Array.isArray(o.wins_each)
        ){
            return false
        }
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
