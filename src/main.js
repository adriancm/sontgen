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

function editElem(data){

    $('#resourceData').popup('close');
    var elem = ctrlEventObj['popup'];

    if((data.namespace && data.iri) || data.literal){
        if(!data.literal){
            var label = data.namespace+':'+data.iri;
        } else {
            var label = data.literal
        }

        if(sog.isNode(elem)){
            var a = sog.editNode(elem.id, label, { $color: sog.viz.config.Node.color, iri: data.iri, namespace: data.namespace, literal: data.literal } );
            console.log(a);
        } else {
            sog.editEdge(elem.nodeFrom, elem.nodeTo, { name: label, $color: sog.viz.config.Edge.color,  iri: data.iri, namespace: data.namespace, literal: data.literal });
        }
    }
}

function resOrLitToogle(res){
    if(res){
        $('#resourceInput').html('<div class="ui-input-text ui-body-a ui-corner-all ui-shadow-inset">'+
        '<input data-theme="a" placeholder="Namespace" id="namespace" name="text"></div>'+
        '<div class="ui-input-text ui-body-a ui-corner-all ui-shadow-inset"><input data-theme="a" placeholder="URI/IRI" id="iri" name="text"></div>'+
        '<button onclick="editElem({ namespace:$(\'#namespace\').val(), iri:$(\'#iri\').val()})" class="ui-btn ui-btn-b ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" type="submit">Edit</button></div>');
    } else {
        $('#resourceInput').html('<div class="ui-input-text ui-body-a ui-corner-all ui-shadow-inset">'+
        ' <input name="text" id="literal" placeholder="Literal" data-theme="a" ></div>' +
        '<button type="submit" class="ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check" onclick="editElem({literal:$(\'#literal\').val()})">Edit</button>');
    }
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
        if(elem){
            $('#resourceData').popup('open');//{ x: e.clientX+100, y: e.clientY+80, transition: 'pop', positionTo: 'origin'});
            ctrlEventObj['popup'] = elem;
        }
    });

    sog.addEvent('onClick', function(elem, eventInfo, e) {
        //$jit.util.event.stop(e);
        if (elem) {
            switch (ctrlEventObj['selected']) {
                case 'viewonly':
                    if(sog.isEdge(elem))
                        alert('This is an edge');
                    else{

                        sog.root(elem.id);
                    }
                    break;
                case 'addedge':
                    var fromnode = ctrlEventObj['from']
                    if(sog.isNode(elem)) {
                        if (fromnode){
                            sog.addEdge(elem, fromnode);
                            ctrlEventObj['from'] = false;
                            sog.cursor('pointer');

                        } else {
                            ctrlEventObj['from'] = elem;
                            sog.cursor('crosshair');
                        }
                    }
                    break;
                case 'trash':
                    if(sog.isEdge(elem))
                        sog.removeEdge(elem.nodeFrom.id,elem.nodeTo.id);
                    else
                        sog.removeNode(elem.id);
            }

        } else {
            ctrlEventObj['from'] = null
            sog.cursor('pointer');
        }
    });

    sog.addEvent('onMouseEnter', function(elem, eventInfo, e) {
        if(sog.cursor() != 'crosshair'){
            sog.cursor('pointer');
            sog.showTip(e.clientX, e.clientY, elem);
        }
    });

    sog.addEvent('onMouseLeave', function(elem, eventInfo, e) {
        if(sog.cursor() != 'crosshair'){
            sog.cursor('move');
            sog.hideTips();
        }
    });

    sog.addEvent('onDragStart', function(elem, eventInfo, e) {
        $jit.util.event.stop(e);
        if (elem) {
            node = elem;
        } else {
            node = false;
        }
        console.log("Drag: " + elem.id);

    });

    sog.addEvent('onDragMove', function(elem, eventInfo, e) {
        var pos = eventInfo.getPos();
        elem.pos.setc(pos.x, pos.y);
        sog.viz.plot();
    });

    sog.toJSON('graph');

    controlEvents('viewonly');
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}