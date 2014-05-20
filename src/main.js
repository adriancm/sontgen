var labelType, useGradients, nativeTextSupport, animate, sog, ctrlEventObj = {};

/*var Log = {
 elem: false,
 write: function(text){
 if (!this.elem)
 this.elem = document.getElementById('log');
 this.elem.innerHTML = text;
 this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
 }
 };*/

function controlEvents(action) {

    $("#" + ctrlEventObj['selected']).css({"background": "linear-gradient(#444444, #2D2D2D) #333333"},{"border": "none"});
    ctrlEventObj['selected'] = action;
    ctrlEventObj['from'] = false;
    $("#" + action).css({"background": "linear-gradient(#444444, #767676) #333333", "border": "0 0 12px solid #22AADD"});
}

/**
 * Description
 * @method init
 * @return
 */
function init() {
    //init data

    //end

    sog = new sontgen('canvas');
    sog.fromJSON(json);

    sog.addEvent('onRightClick', function(elem, infoEvent, e) {
        alert("hola " + elem.id);
    });

    sog.addEvent('onClick', function(elem, eventInfo, e) {
        //$jit.util.event.stop(e);
        console.log(elem)
        if (elem) {
            switch (ctrlEventObj['selected']) {
                case 'viewonly':
                    if(elem.nodeFrom)
                        alert('This is an edge');
                    else
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

    sog.addEvent('onMouseEnter', function(elem, eventInfo, e) {
        sog.viz.canvas.getElement().style.cursor = 'pointer';
        sog.showTip(e.clientX, e.clientY, elem);
    });

    sog.addEvent('onMouseLeave', function(elem, eventInfo, e) {
        sog.hideTips();
        sog.viz.canvas.getElement().style.cursor = 'move';
    });

    sog.toJSON('graph');

    controlEvents('viewonly');
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}