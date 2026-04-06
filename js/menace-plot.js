/*************************************/
/* MENACE — learning curve canvas    */
/* plotdata[i] = y after game i.     */
/*************************************/

/* Fast path: if axis bounds unchanged, append one point; else full redraw. */
function update_plot(){
    var oldlimits = [xmin,xmax,ymin,ymax]
    updateplotlimits()
    if(xmin == oldlimits[0] && xmax == oldlimits[1] && ymin == oldlimits[2] && ymax == oldlimits[3]){
        draw_point(plotdata.length-1)
    } else {
        redraw_plot()
    }
}

function redraw_plot(){
    var c=document.getElementById("plot_here")
    var ctx=c.getContext("2d")
    ctx.clearRect(0, 0, c.width, c.height)
    updateplotlimits()
    for(var i=0;i<=5;i++){
        var y = ymin + (ymax-ymin)*i/5
        ctx.textAlign = "right"
        ctx.fillText(y, xtopx(0)-2, 4+ytopx(y))
    }
    ctx.fillText(0, xtopx(0)-2, 4+ytopx(0))
    for(var i=1;i<=10;i++){
        var x = xmin + (xmax-xmin)*i/10
        ctx.textAlign = "center"
        ctx.fillText(x, xtopx(x), ytopx(0)+10)
    }
    ctx.beginPath()
    ctx.moveTo(xtopx(0),ytopx(ymax))
    ctx.lineTo(xtopx(0),ytopx(ymin))
    ctx.moveTo(xtopx(xmin),ytopx(0))
    ctx.lineTo(xtopx(xmax),ytopx(0))
    ctx.stroke()
    ctx.save()
    ctx.translate(220, 150)
    ctx.rotate(-Math.PI/2)
    ctx.textAlign = "center"
    ctx.fillText("Change in number of bead in first box", 0, -205)
    ctx.fillText("(3\xD7wins + losses - draws)", 0, -194)
    ctx.restore()
    ctx.textAlign = "right"
    ctx.fillText("Number of games", xtopx(xmax), ytopx(0)+20)
    for(var i=0;i<plotdata.length;i++){
        draw_point(i)
    }
}

function draw_point(i){
    var c=document.getElementById("plot_here")
    var ctx=c.getContext("2d")
    ctx.beginPath()
    ctx.arc(xtopx(i), ytopx(plotdata[i]), 3, 0, 2 * Math.PI, false)
    ctx.fillStyle = '#FF0000'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#000000'
    ctx.stroke()
    ctx.fillStyle = '#000000'
}

function ytopx(_y){
    return 5+290*(_y-ymax)/(ymin-ymax)
}

function xtopx(_x){
    return 40+390*(_x-xmin)/(xmax-xmin)
}

/* Pad ranges to tidy tick marks; x extends past last game for margin. */
function updateplotlimits(){
    ymin = arrmin(plotdata)
    ymin -= 10 + ymin % 10
    ymin = Math.min(-10,ymin)
    ymax = arrmax(plotdata) + 10
    ymax -= ymax % 10
    xmin = 0
    xmax = plotdata.length + 20
    xmax -= xmax % 20
}
