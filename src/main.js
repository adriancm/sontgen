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
            sog.editNode(elem.id, label, { $color: sog.viz.config.Node.color, iri: data.iri, namespace: data.namespace, literal: data.literal } );
        } else {
            sog.editEdge(elem.nodeFrom, elem.nodeTo, { name: label, $color: sog.viz.config.Edge.color,  iri: data.iri, namespace: data.namespace, literal: data.literal });
        }

    }
}

function resLitToogle(res){
    if(res){
        $('#literal')
            .attr('disabled', true)
            .parent().addClass('ui-state-disabled');
        $('#namespace')
            .removeAttr('disabled')
            .parent().removeClass('ui-state-disabled');
        $('#iri')
            .removeAttr('disabled')
            .parent().removeClass('ui-state-disabled');
    } else {
        $('#literal')
            .removeAttr('disabled')
            .parent().removeClass('ui-state-disabled');
        $('#namespace')
            .attr('disabled', true)
            .parent().addClass('ui-state-disabled');
        $('#iri')
            .attr('disabled', true)
            .parent().addClass('ui-state-disabled');
    }
}

function localRemoteToogle(local){
    if(local){
        $('#remote-file')
            .attr('disabled', true)
            .parent().addClass('ui-state-disabled');
        $('#local-file')
            .removeAttr('disabled')
            .parent().removeClass('ui-state-disabled');
    } else {
        $('#local-file')
            .attr('disabled', true)
            .parent().addClass('ui-state-disabled');
        $('#remote-file')
            .removeAttr('disabled')
            .parent().removeClass('ui-state-disabled');
    }
}

function openSelectedFile(inputs){
    var file;
    var local = false;
    inputs.each(function (){
        console.log(this);
        if (!this.disabled) {
            if(this.id == 'local-file'){
                local = true;
                file = this.files[0];
            } else {
                file = $(this).val();
            }
        }
    });
    sog.openFile(file, local);
    return true;
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
    sog.openFile('http://localhost/sontgen/res/data2.json');

    sog.addEvent('onRightClick', function(elem, infoEvent, e) {
        if(elem){
            ctrlEventObj['popup'] = elem;
            $('#resourceData').popup('open');//{ x: e.clientX+100, y: e.clientY+80, transition: 'pop', positionTo: 'origin'});
            var ns = ctrlEventObj['popup'].data.namespace;
            $('#namespace').val(ns?ns:'');
            var iri = ctrlEventObj['popup'].data.iri;
            $('#iri').val(iri?iri:'');
            var lit = ctrlEventObj['popup'].data.literal;
            $('#literal').val(lit?lit:'');
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
                    var fromnode = ctrlEventObj['from'];
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

    controlEvents('viewonly');
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}