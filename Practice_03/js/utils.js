random = function(v){
    v = v || 1;
    if (v.length) for (i in v) v[i] = random(v[i]);
    else  v = v*(Math.random()<0.5?-Math.random():Math.random());
    return v;
}
