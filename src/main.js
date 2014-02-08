var labelType, useGradients, nativeTextSupport, animate;

/*var Log = {
    elem: false,
    write: function(text){
	if (!this.elem) 
	    this.elem = document.getElementById('log');
	this.elem.innerHTML = text;
	this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};*/


/**
 * Description
 * @method init
 * @return 
 */
function init(){
    //init data
    
    //end

    var sog = new sontgen('canvas');
    console.log(sog);
    sog.fromJSON(json);
    //sog.viz.compute();
    //sog.viz.refresh();
    /*sog.addNode('prueba012','Una prueba',{});
    sog.addEdge(sog.getNode('prueba012'), sog.getNodeByName('Pearl Jam'));
    console.log(sog.getEdge('prueba012', sog.getNodeByName('Pearl Jam').id));
    sog.removeNode('prueba012');
    sog.viz.compute();*/
    //sog.viz.refresh();
    var prueba = sog.toJSON('graph');
    console.log(prueba);
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}
