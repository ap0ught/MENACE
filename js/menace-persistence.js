/*************************************/
/* MENACE — localStorage persistence */
/*************************************/

var MENACE_STORAGE_KEY = "menace_app_state_v1"

function menaceMigratePlotStateFromV1(){
    var g = plotdata.length - 1
    plotdata_menace2 = []
    for(var i=0;i<plotdata.length;i++){
        plotdata_menace2[i] = 0
    }
    result_history = []
    plot_cum_o = [0]
    plot_cum_draw = [0]
    plot_cum_x = [0]
    if(g <= 0){
        return
    }
    for(var i=1;i<g;i++){
        plot_cum_o.push(Math.round(wins_each[1]*i/g))
        plot_cum_draw.push(Math.round(wins_each[0]*i/g))
        plot_cum_x.push(Math.round(wins_each[2]*i/g))
    }
    plot_cum_o.push(wins_each[1])
    plot_cum_draw.push(wins_each[0])
    plot_cum_x.push(wins_each[2])
}

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
            v: 2,
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
            plotdata_menace2: plotdata_menace2.slice(),
            result_history: result_history.slice(),
            plot_cum_o: plot_cum_o.slice(),
            plot_cum_draw: plot_cum_draw.slice(),
            plot_cum_x: plot_cum_x.slice(),
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
        if((o.v !== 1 && o.v !== 2) || !o.m1 || !o.m2){ return false }
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
        if(o.v === 2 &&
            Array.isArray(o.plotdata_menace2) &&
            Array.isArray(o.result_history) &&
            Array.isArray(o.plot_cum_o) &&
            Array.isArray(o.plot_cum_draw) &&
            Array.isArray(o.plot_cum_x) &&
            o.plotdata_menace2.length === o.plotdata.length &&
            o.result_history.length === o.plotdata.length - 1 &&
            o.plot_cum_o.length === o.plotdata.length &&
            o.plot_cum_draw.length === o.plotdata.length &&
            o.plot_cum_x.length === o.plotdata.length
        ){
            plotdata_menace2 = o.plotdata_menace2
            result_history = o.result_history
            plot_cum_o = o.plot_cum_o
            plot_cum_draw = o.plot_cum_draw
            plot_cum_x = o.plot_cum_x
        } else {
            menaceMigratePlotStateFromV1()
        }
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
