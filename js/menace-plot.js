/*************************************/
/* MENACE — multi-series learning      */
/* charts (canvas).                  */
/*************************************/

var PLOT_PAD_L = 46
var PLOT_PAD_R = 14
var PLOT_PAD_T = 34
var PLOT_PAD_B = 46

function update_plot(){
    redraw_plot()
}

function getPlotMode(){
    var el = document.getElementById("plot_mode")
    return el ? el.value : "beads"
}

function getRollingWindow(){
    var el = document.getElementById("plot_window")
    if(!el){ return 50 }
    var w = parseInt(el.value, 10)
    if(isNaN(w) || w < 3){ return 3 }
    if(w > 2000){ return 2000 }
    return w
}

function setPlotWindowControlsVisible(show){
    var w = document.getElementById("plot_window")
    var lab = document.getElementById("plot_window_label")
    if(w){ w.hidden = !show }
    if(lab){ lab.hidden = !show }
}

function buildRollingRates(side, win){
    var out = []
    var G = result_history.length
    out[0] = null
    for(var i=1;i<=G;i++){
        var start = Math.max(0, i - win)
        var cnt = 0
        var tot = 0
        for(var j=start;j<i;j++){
            tot++
            if(result_history[j] === side){
                cnt++
            }
        }
        out[i] = tot === 0 ? 0 : (100 * cnt / tot)
    }
    return out
}

function collectYsForLimits(mode){
    var ys = []
    if(plotdata.length < 1){ return [0] }
    if(mode === "beads"){
        for(var i=0;i<plotdata.length;i++){
            ys.push(plotdata[i])
            ys.push(plotdata_menace2[i])
        }
    } else if(mode === "wins"){
        for(var i=0;i<plot_cum_o.length;i++){
            ys.push(plot_cum_o[i])
            ys.push(plot_cum_draw[i])
            ys.push(plot_cum_x[i])
        }
    } else {
        var W = getRollingWindow()
        var rO = buildRollingRates(1, W)
        var rX = buildRollingRates(2, W)
        for(var i=1;i<rO.length;i++){
            if(rO[i] !== null){ ys.push(rO[i]) }
            if(rX[i] !== null){ ys.push(rX[i]) }
        }
        if(ys.length === 0){
            return [0, 100]
        }
    }
    return ys
}

function updateplotlimits(mode){
    var ys = collectYsForLimits(mode)
    ymin = arrmin(ys)
    ymax = arrmax(ys)
    if(mode === "rate"){
        ymin = 0
        ymax = 100
    } else {
        var pad = Math.max(1, (ymax - ymin) * 0.06)
        ymin -= pad
        ymax += pad
        if(ymin === ymax){
            ymin -= 1
            ymax += 1
        }
    }
    xmin = 0
    xmax = Math.max(20, plotdata.length + 15)
    xmax -= xmax % 10
    if(xmax <= xmin){
        xmax = xmin + 20
    }
}

function plotW(c){
    return c.width - PLOT_PAD_L - PLOT_PAD_R
}

function plotH(c){
    return c.height - PLOT_PAD_T - PLOT_PAD_B
}

function ytopx(c, _y){
    var h = plotH(c)
    return PLOT_PAD_T + h * (ymax - _y) / (ymax - ymin)
}

function xtopx(c, _x){
    var w = plotW(c)
    return PLOT_PAD_L + w * (_x - xmin) / (xmax - xmin)
}

function drawAxesAndTicks(c, ctx, mode){
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(xtopx(c, xmin), ytopx(c, ymax))
    ctx.lineTo(xtopx(c, xmin), ytopx(c, ymin))
    ctx.moveTo(xtopx(c, xmin), ytopx(c, 0))
    ctx.lineTo(xtopx(c, xmax), ytopx(c, 0))
    ctx.stroke()

    ctx.fillStyle = "#111"
    ctx.font = "11px sans-serif"
    for(var t=0;t<=5;t++){
        var y = ymin + (ymax - ymin) * t / 5
        ctx.textAlign = "right"
        ctx.fillText(mode === "rate" ? String(Math.round(y)) + "%" : String(Math.round(y)), xtopx(c, xmin) - 4, 4 + ytopx(c, y))
    }
    var xticks = 10
    for(var xi=1;xi<=xticks;xi++){
        var x = xmin + (xmax - xmin) * xi / xticks
        ctx.textAlign = "center"
        ctx.fillText(String(Math.round(x)), xtopx(c, x), ytopx(c, 0) + 12)
    }
}

function drawLegend(c, ctx, items){
    ctx.font = "11px sans-serif"
    var x0 = c.width - 12
    var y0 = 16
    for(var i=0;i<items.length;i++){
        var it = items[i]
        ctx.fillStyle = it.color
        ctx.fillRect(x0 - 100, y0 + i * 16 - 9, 10, 10)
        ctx.fillStyle = "#111"
        ctx.textAlign = "left"
        ctx.fillText(it.label, x0 - 86, y0 + i * 16)
    }
}

function roleModeLabel(m){
    return (m === "h") ? "Human" : (m === "r") ? "Random" : (m === "m") ? "MENACE" : (m === "p") ? "Perfect" : String(m)
}

function roleEventColor(mode, side){
    /* Match chart semantics: O is always blue; X is red in reinforcement mode, green otherwise. */
    if(side === 1){ return "#2563eb" }
    if(mode === "beads"){ return "#dc2626" }
    return "#16a34a"
}

function drawRoleEvents(c, ctx, mode){
    if(!role_events || !role_events.length){ return }
    ctx.save()
    ctx.font = "11px sans-serif"
    ctx.textAlign = "left"
    /* Avoid stacking too much text: stagger callouts by event index. */
    var baseY = PLOT_PAD_T + 8
    for(var i=0;i<role_events.length;i++){
        var ev = role_events[i]
        if(!ev || typeof ev.x !== "number"){ continue }
        if(ev.x < xmin || ev.x > xmax){ continue }
        var x = xtopx(c, ev.x)
        var color = roleEventColor(mode, ev.side)
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(x, PLOT_PAD_T)
        ctx.lineTo(x, c.height - PLOT_PAD_B)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = color
        var y = baseY + (i % 3) * 12
        var label = (ev.side === 1 ? "O: " : "X: ") + roleModeLabel(ev.mode)
        ctx.fillText(label, x + 4, y)
    }
    ctx.restore()
}

function strokeSeries(c, ctx, yarr, color){
    var first = -1
    for(var a=0;a<yarr.length;a++){
        if(yarr[a] !== null && yarr[a] !== undefined){
            first = a
            break
        }
    }
    if(first < 0){ return }
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.moveTo(xtopx(c, first), ytopx(c, yarr[first]))
    for(var i=first+1;i<yarr.length;i++){
        if(yarr[i] === null || yarr[i] === undefined){ continue }
        ctx.lineTo(xtopx(c, i), ytopx(c, yarr[i]))
    }
    ctx.stroke()
    ctx.fillStyle = color
    for(var j=0;j<yarr.length;j++){
        if(yarr[j] === null || yarr[j] === undefined){ continue }
        ctx.beginPath()
        ctx.arc(xtopx(c, j), ytopx(c, yarr[j]), 2.5, 0, 2 * Math.PI, false)
        ctx.fill()
    }
}

function redraw_plot(){
    var c = document.getElementById("plot_here")
    if(!c){ return }
    var ctx = c.getContext("2d")
    ctx.clearRect(0, 0, c.width, c.height)
    var mode = getPlotMode()
    setPlotWindowControlsVisible(mode === "rate")
    updateplotlimits(mode)

    drawAxesAndTicks(c, ctx, mode)
    drawRoleEvents(c, ctx, mode)

    ctx.save()
    ctx.translate(PLOT_PAD_L + plotW(c) / 2, 12)
    ctx.textAlign = "center"
    ctx.fillStyle = "#111"
    ctx.font = "12px sans-serif"
    if(mode === "beads"){
        ctx.fillText("Cumulative per-game reinforcement (outcome reward sum)", 0, 0)
    } else if(mode === "wins"){
        ctx.fillText("Cumulative draws, O wins, and X wins", 0, 0)
    } else {
        ctx.fillText("Rolling win rate (last N games)", 0, 0)
    }
    ctx.restore()

    ctx.textAlign = "center"
    ctx.fillStyle = "#333"
    ctx.font = "11px sans-serif"
    ctx.fillText("Games played (index)", xtopx(c, (xmin + xmax) / 2), c.height - 12)

    if(mode === "beads"){
        strokeSeries(c, ctx, plotdata, "#2563eb")
        strokeSeries(c, ctx, plotdata_menace2, "#dc2626")
        drawLegend(c, ctx, [
            { color: "#2563eb", label: "MENACE (O)" },
            { color: "#dc2626", label: "X learner (MENACE2 or Human)" }
        ])
    } else if(mode === "wins"){
        strokeSeries(c, ctx, plot_cum_draw, "#64748b")
        strokeSeries(c, ctx, plot_cum_o, "#2563eb")
        strokeSeries(c, ctx, plot_cum_x, "#16a34a")
        drawLegend(c, ctx, [
            { color: "#64748b", label: "Draws" },
            { color: "#2563eb", label: "O wins" },
            { color: "#16a34a", label: "X wins" }
        ])
    } else {
        if(result_history.length === 0){
            ctx.fillStyle = "#666"
            ctx.font = "13px sans-serif"
            ctx.textAlign = "center"
            ctx.fillText("Play at least one game to see win rates.", c.width / 2, c.height / 2)
        } else {
            var W = getRollingWindow()
            var rO = buildRollingRates(1, W)
            var rX = buildRollingRates(2, W)
            var arrO = []
            var arrX = []
            for(var k=0;k<rO.length;k++){
                arrO[k] = rO[k]
                arrX[k] = rX[k]
            }
            strokeSeries(c, ctx, arrO, "#2563eb")
            strokeSeries(c, ctx, arrX, "#16a34a")
            drawLegend(c, ctx, [
                { color: "#2563eb", label: "O win %" },
                { color: "#16a34a", label: "X win %" }
            ])
            ctx.textAlign = "left"
            ctx.font = "10px sans-serif"
            ctx.fillStyle = "#555"
            ctx.fillText("Window: " + W + " games", PLOT_PAD_L, c.height - 28)
        }
    }
}
