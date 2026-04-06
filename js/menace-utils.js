/*************************************/
/* MENACE — small array helpers      */
/* No DOM; safe to use from any file.*/
/*************************************/

function arrmin(arr){
    var out = arr[0]
    for(var i=1;i<arr.length;i++){
        out = Math.min(out,arr[i])
    }
    return out
}

function arrmax(arr){
    var out = arr[0]
    for(var i=1;i<arr.length;i++){
        out = Math.max(out,arr[i])
    }
    return out
}

/* Fills out[start]..out[length-1] with value (sparse array, matches original). */
function array_fill(start,length,value){
    var out = []
    for(var i=start;i<length;i++){
        out[i]=value
    }
    return out
}

function count(arr, value){
    var out = 0
    for(var i=0;i<arr.length;i++){
        if(arr[i] == value){out++}
    }
    return out
}
