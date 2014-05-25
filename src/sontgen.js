var labelType, useGradients, nativeTextSupport, animate, moved = true,
    pressed, node = false;
var autoID = 0;

/// expand with color, background etc.
function drawTextBG(ctx, txt, font, x, y) {

    /// lets save current state as we make a lot of changes        
    ctx.save();

    /// set font
    ctx.font = font.family;

    /// draw text from top - makes life easier at the moment
    ctx.textBaseline = 'top';

    /// color for background
    ctx.fillStyle = '#222';

    /// get width of text
    var width = ctx.measureText(txt).width;

    /// draw background rect assuming height of font
    ctx.fillRect(x, y, width, parseInt(font, 10));

    /// text color
    ctx.fillStyle = font.color;

    /// draw text on top
    ctx.fillText(txt, x, y);

    /// restore original state
    ctx.restore();
}

/**
 * Create a new sontgen object.
 * @class sontgen
 * @param {} canvas
 * @param {} mode
 */
function sontgen(canvas, mode, view) {

    $jit.RGraph.Plot.EdgeTypes.implement({
        'labeled': {
            'render': function(adj, canvas) {
                this.edgeTypes.line.render.call(this, adj, canvas);
                var data = adj.data;
                if (data.labeltext) {
                    var ctx = canvas.getCtx();
                    var posFr = adj.nodeFrom.pos.getc(true);
                    var posTo = adj.nodeTo.pos.getc(true);
                    drawTextBG(ctx, data.labeltext, {
                        color: '#ccc',
                        family: 'sans'
                    }, (posFr.x + posTo.x) / 2, (posFr.y + posTo.y) / 2);
                    //ctx.fillStyle = "#ccc";
                    //ctx.fillText(data.labeltext, (posFr.x + posTo.x) / 2, (posFr.y + posTo.y) / 2);

                } // if data.labeltext
            }
        }
    });


    var that = this;
    /**
     * Description
     * @method sog_init
     * @return rgraph
     */
    var rgraph = new $jit.RGraph({
        //Where to append the visualization
        injectInto: canvas,
        //Optional: create a background canvas that plots
        //concentric circles.
        background: {
            CanvasStyles: {
                strokeStyle: '#222'
            }
        },
        //Add navigation capabilities:
        //zooming by scrolling and panning.
        Navigation: {
            enable: true,
            panning: 'avoid nodes',
            zooming: 60
        },
        //Set Node and Edge styles.
        Node: {
            overridable: true,
            color: 'purple',
            dim: 10
        },

        Edge: {
            overridable: true,
            color: 'green',
            lineWidth: 3,
            type: 'arrow',
            dim: 20

        },
        Label: {
            overridable: true,
            type: 'Native',
            color: '#fff',
            size: 10

        },
        Tips: {
            enable: true,
            type: 'Native',
            offsetX: 5,
            offsetY: 5,
            onShow: function(tip, node) {
                //var styles = "padding: 10px; background-color: white; border-radius: 5px; ";
                that.hideTips();
                tip.innerHTML = '<div class="tip">' +
                    "<h4>URI: <span>\"" + node.name + "\"</span></h4>" +
                    "<p>Descripción</p>" +
                    "</div>";
            }
        },
        Events: {
            enable: true,
            enableForEdges: true,
            type: 'Native',

            onDragEnd: function(elem, eventInfo, e) {
               /* $jit.util.event.stop(e);
                if (elem != undefined) {
                    rgraph.graph.addAdjacence(node, elem);
                } else {
                    var newNode = rgraph.graph.addNode({
                        'id': '_node' + autoID,
                        'name': '_node' + autoID,
                        'data': 'data'
                    });
                    autoID++;
                    rgraph.graph.addAdjacence(node, newNode);
                }


                console.log(elem.id);
                rgraph.fx.animate({
                    modes: [
                        'linear'
                    ],
                    duration: 700,
                    transition: $jit.Trans.Elastic.easeOut
                });
                rgraph.refresh();
                node = false;*/
            },
            //touch events  
            onTouchStart: function(node, eventInfo, e) {
                //stop the default event  
                $jit.util.event.stop(e);
            },
            onTouchMove: function(node, eventInfo, e) {
                //stop the default event  
                $jit.util.event.stop(e);
                var pos = eventInfo.getPos();
                node.pos.setc(pos.x, pos.y);
                rgraph.plot();
            },
            onTouchEnd: function(node, eventInfo, e) {
                //stop the default event  
                $jit.util.event.stop(e);
                rgraph.compute('end');
                rgraph.fx.animate({
                    modes: [
                        'linear'
                    ],
                    duration: 700,
                    transition: $jit.Trans.Elastic.easeOut
                });
            }
        },

        levelDistance: 200,
        //iterations: 100,
        fps: 30,
        duration: 1500

    });

    this.viz = rgraph;
    this.canvas = canvas;
    this.mode = mode;
    this.view = view;

    console.log(rgraph);
}


sontgen.prototype.fromJSON = function(file) {
    //var that = this;
    this.viz.loadJSON(file);

    /*var superNode = this.viz.graph.addNode({'id':'_superNode','name':'_superNode'});
      //trigger small animation
      var joined = false;*/
    console.log(this.viz.compute);
    this.viz.compute('end');
    this.viz.fx.animate({
        modes: ['polar'],
        duration: 1000
    });
    //end
    /*this.viz.computeIncremental({
    iter: 20,
    property: 'end',
    onStep: function(perc) {
        console.log("loading " + perc + "%");
    },
    onComplete: function() {
        console.log("done");
        that.viz.animate();
    }
});*/
};

sontgen.prototype.toJSON = function(type) {

    return this.viz.toJSON(type);
};

sontgen.prototype.loadFile = function(path){

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported. Please upgrade your browser.');
    }
};

sontgen.prototype.addNode = function(name, data) {

    var n = this.viz.graph.addNode({
        'id': '_n_' + autoID,
        'name': name,
        'data': data
    });
    autoID++;
    this.animate('Elastic', 'easeOut');
    return n;
};

sontgen.prototype.addEdge = function(node, node2, data) {

    var e = this.viz.graph.addAdjacence(node, node2, data);
    this.animate('Elastic', 'easeOut');
    return e;
};

sontgen.prototype.removeNode = function(id) {

    if (this.getNode(id)) {
        this.viz.graph.removeNode(id);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

sontgen.prototype.removeEdge = function(id, id2) {

    if(this.getEdge(id, id2)){
        this.viz.graph.removeAdjacence(id, id2);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

sontgen.prototype.remove = function(id) {
    this.removeNode(id);

    return false;
};

sontgen.prototype.getNode = function(id) {

    return this.viz.graph.getNode(id);
};

sontgen.prototype.getNodeByName = function(name) {
    return this.viz.graph.getByName(name);
};

sontgen.prototype.getEdge = function(id, id2) {

    return this.viz.graph.getAdjacence(id, id2);
};

sontgen.prototype.editNode = function(id, name, data) {

    var node = this.getNode(id);
    if (node) {
        node.name = name;
        node.data = data;
    }
};

sontgen.prototype.editEdge = function(node, node2, data) {

    var edge = this.getEdge(node.id, node2.id);
    if (edge) {
        edge.data = data;
    }
};

sontgen.prototype.addEventToObj = function(obj, type, fn) {

    $jit.util.addEvent(obj, type, fn);
};

sontgen.prototype.addEvent = function(type, fn) {

    this.viz.config.Events[type] = fn;
};

sontgen.prototype.animate = function(trans, way, dur) {

    dur = typeof dur !== 'undefined' ? dur : 500;

    //if (trans && way) {
    this.viz.compute('end');
    this.viz.fx.animate({
        modes: [
            'linear'
        ],
        duration: dur,
        transition: $jit.Trans[trans][way]
    });
    //} else 
};

sontgen.prototype.showTip = function(x, y, elem, html){
    if(x && y){
        if(!html){
            if(elem){
                if(elem.nodeFrom)
                    html = '<div class="tip customtip" style="top:' + y + 'px; left:' + x + 'px;">Una prueba de edge: '
                            + elem.nodeFrom.name + ' to ' + elem.nodeTo.name + '</div>';
                else
                    html = '';
            }
        }
        $('#canvas-canvaswidget').append(html);
    }
};

sontgen.prototype.hideTips = function(){
    $('.customtip').remove();
}

sontgen.prototype.isNode = function(elem){
    if(elem){
        if(elem.nodeFrom)
            return false;
        else
            return true;
    } else {
        return false;
    }
}

sontgen.prototype.isEdge = function(elem){
    if(elem)
        return !this.isNode(elem);
    else
        return false;
}

sontgen.prototype.cursor = function(type, path){
    if(type == 'custom'){
        if(path)
            sog.viz.canvas.getElement().style.cursor = 'url("'+path+'")';
    } else if(type) {
        sog.viz.canvas.getElement().style.cursor = type;
    } else {
        return sog.viz.canvas.getElement().style.cursor;
    }
}

