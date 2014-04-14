var labelType, useGradients, nativeTextSupport, animate, sog, ctrlEventObj = {} ;

/*var Log = {
    elem: false,
    write: function(text){
	if (!this.elem) 
	    this.elem = document.getElementById('log');
	this.elem.innerHTML = text;
	this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};*/

function controlEvents(action){

    ctrlEventObj['selected'] = action;
    ctrlEventObj['from'] = false;
    $( "#"+action ).removeClass( "ui-btn-up-a" ).addClass( "ui-btn-down-a" );
}

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
            switch (ctrlEventObj['selected']){
                case 'viewonly': 
                    sog.viz.onClick(elem.id);
                    break;
                case 'addedge':
                    var fromnode = ctrlEventObj['from']
                    if (fromnode) {
                        sog.addEdge(fromnode, elem);
                        ctrlEventObj['from'] = false;
                    } else {
                        ctrlEventObj['from'] = elem;
                    }
                    break;
                case 'trash':
                    sog.remove(elem.id);
            } 
                
        }
    });
    sog.toJSON('graph');
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}
