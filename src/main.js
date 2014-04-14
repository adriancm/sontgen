var labelType, useGradients, nativeTextSupport, animate, sog, actionFlag;

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

    sog = new sontgen('canvas');
    sog.fromJSON(json);
    
    sog.addEvent('onRightClick', function(elem, infoEvent, e){ 
	   alert("hola "+elem.id); 
    });
    sog.addEvent('onClick', function(elem, eventInfo, e){
        //$jit.util.event.stop(e);
        console.log(elem)
        if (elem) {
            sog.viz.onClick(elem.id);    
        }
    });
    sog.toJSON('graph');
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}
