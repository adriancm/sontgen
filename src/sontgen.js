/*
 Sontgen is an app for graphical management of linked data.
 Copyright (C) 2014  Adrian Cepillo Macias

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see {http://www.gnu.org/licenses/}.
 */

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

function Sontgen(canvas, mode, view) {

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
            color: '#284C94',
            dim: 10
        },

        Edge: {
            overridable: true,
            color: '#3388CC',
            lineWidth: 4,
            type: 'arrow',
            dim: 13

        },
        Label: {
            overridable: true,
            type: 'Native',
            color: '#fff',
            size: 8

        },
        Tips: {
            enable: true,
            type: 'Native',
            offsetX: 0,
            offsetY: 0,
            onShow: function(tip, node) {
                //var styles = "padding: 10px; background-color: white; border-radius: 5px; ";
                that.hideTips();
                tip.innerHTML = '<div class="tip">' +
                    "<span>" + node.name + "</span>" +
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

        levelDistance: 600,
        //iterations: 100,
        fps: 30,
        duration: 1500

    });

    this.viz = rgraph;
    this.canvas = canvas;
    this.mode = mode;
    this.view = view;
    this.namespaces = {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
    };

    console.log(rgraph);
}


Sontgen.prototype.fromJSON = function(json) {
    //var that = this;
    this.namespaces = json.namespaces;

    this.viz.loadJSON(json.graph);

    this.viz.compute('end');
    this.viz.fx.animate({
        modes: ['polar'],
        duration: 1000
    });
};

Sontgen.prototype.toJSON = function(type) {

    return this.viz.toJSON(type);
};

Sontgen.prototype.fromRDF = function(rdf, type){
    var that = this;
    var store = rdfstore.create();
    var json = {
        namespaces: {},
        graph: []
    };
    var n3 = "";

    store.load(type, rdf.toString(), function(success, results) {
        store.graph(function(success, graph){
            json.namespaces = store.rdf.prefixes.values();

            json.graph.push({
                'id': '_n_' + autoID,
                'name': graph.triples[0].subject.nominalValue,
                'data': {},
                'adjacencies': []
            });
            that.fromJSON(json);

            graph.forEach(function(t){
                n3 = n3 + t.toString();
                var s = that.getNodeByName(t.subject.nominalValue) || that.addNode(t.subject.nominalValue);
                var p = t.predicate.nominalValue;
                var o = that.getNodeByName(t.object.nominalValue) || that.addNode(t.object.nominalValue);

                that.addEdge(s,o,{ name: p });
            });
        });
    });
    console.log(n3);
    return n3;
};

Sontgen.prototype.objToStore = function(store, elem){
    if(elem.data.literal){
        return store.rdf.createLiteral(elem.data.literal);
    } else if(elem.data.iri){
        var res = elem.data.namespace ? elem.data.namespace+":"+elem.data.iri : elem.data.iri;
        return store.rdf.createNamedNode(store.rdf.resolve(res));
    } else {
        return store.rdf.createBlankNode();
    }
};

Sontgen.prototype.toRDF = function(type){
    var that = this;
    var store = rdfstore.create();
    var rdfgraph = store.rdf.createGraph();
    var ns = this.namespaces;

    for (var key in ns) {
        store.rdf.setPrefix(key, ns[key]);
    }

    this.viz.graph.each(function(node){
        node.eachAdjacency(function(adj){
            var s = that.objToStore(store, node);
            var p = that.objToStore(store, adj);
            var o = that.objToStore(store, adj.nodeTo);

            rdfgraph.add(store.rdf.createTriple(s, p, o));
        });
    });

    console.log(rdfgraph);
    return rdfgraph.toNT();
};

Sontgen.prototype.openFile = function(path, type, local){
    that = this;
    if (path){
        if(local){
            console.log(path);
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                // Great success! All the File APIs are supported.
                var reader = new FileReader();

                reader.onload = function(e){
                    if(type == 'jit-json')
                        that.fromJSON(JSON.parse(reader.result));
                    else
                        that.fromRDF(reader.result, type);
                };

                reader.readAsText(path);
                return true;
            } else {
                alert('The File APIs are not fully supported. Please upgrade your browser.');
                return false;
            }
        }else {
            $.ajax({
                type:    "GET",
                url:     path,
                success: function(text) {
                    switch (type){
                        case 'jit-json': that.fromJSON(text); break;
                        default: that.fromRDF(text, type); break;
                    }

                    return true
                },
                error:   function() {
                    console.log('error to load data');
                    return false;
                }
            })
        }
    }
    return false;
};

Sontgen.prototype.saveAs = function(type){
    //var b = new Blob([JSON.stringify(this.toJSON('graph'))], {type: "text/plain;charset=utf-8"});
    var b = new Blob([this.toRDF('n3')], {type: "text/n3;charset=utf-8"});
    saveAs(b, "myfile.nt");
};

Sontgen.prototype.addNode = function(name, data) {

    var n = this.viz.graph.addNode({
        'id': '_n_' + autoID,
        'name': name?name:'',
        'data': data || {}
    });
    autoID++;
    this.animate('Elastic', 'easeOut');
    return n;
};

Sontgen.prototype.addEdge = function(node, node2, data) {
    data = data || {};
    //TODO Hidden edge case
    var e = this.getEdge(node.id,node2.id);
    if(e && e.getData('_rootsAdj')){
        this.viz.graph.removeAdjacence(e.nodeFrom.id, e.nodeTo.id);
    }
    data.$direction = [node.id, node2.id];
    e = this.viz.graph.addAdjacence(node, node2, data);
    this.animate('Elastic', 'easeOut');
    return e;
};

Sontgen.prototype.removeNode = function(id) {
    //TODO Root or Last node case
    if (this.getNode(id) && id != this.viz.root) {
        this.viz.graph.removeNode(id);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

Sontgen.prototype.removeEdge = function(id, id2) {

    if(this.getEdge(id, id2)){
        this.viz.graph.removeAdjacence(id, id2);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

Sontgen.prototype.remove = function(elem) {

    if(this.isNode(elem)){
        this.removeNode(elem.id);
        return true;
    }else{
        this.removeEdge(elem.nodeFrom.id,elem.nodeTo.id);
        return true;
    }
};

Sontgen.prototype.getNode = function(id) {

    return this.viz.graph.getNode(id);
};

Sontgen.prototype.getNodeByName = function(name) {
    return this.viz.graph.getByName(name);
};

Sontgen.prototype.getEdge = function(id, id2) {

    return this.viz.graph.getAdjacence(id, id2);
};

Sontgen.prototype.editNode = function(id, name, data) {

    var node = this.getNode(id);
    if (node) {
        node.name = name?name:'';
        node.data = data;
        this.animate('Elastic', 'easeOut');
        return node;
    } else {
        return false;
    }
};

Sontgen.prototype.editEdge = function(node, node2, data) {

    var edge = this.getEdge(node.id, node2.id);
    if (edge) {
        $.each(data, function(index, value){
           edge.data[index] = value;
        });
        this.animate('Elastic', 'easeOut');
        return edge;
    } else {
        return false;
    }
};

Sontgen.prototype.addEventToObj = function(obj, type, fn) {

    $jit.util.addEvent(obj, type, fn);
};

Sontgen.prototype.addEvent = function(type, fn) {

    this.viz.config.Events[type] = fn;
};

Sontgen.prototype.animate = function(trans, way, dur) {

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

Sontgen.prototype.showTip = function(x, y, elem, html){
    if(x && y){
        if(!html){
            if(elem){
                if(elem.nodeFrom)
                    html = '<div class="tip customtip" style="top:' + y + 'px; left:' + x + 'px;">' +
                        elem.data.name + '</div>';
                else
                    html = '';
            }
        }
        $('#canvas-canvaswidget').append(html);
    }
};

Sontgen.prototype.hideTips = function(){
    $('.customtip').remove();
};

Sontgen.prototype.isNode = function (elem) {
    if (elem) return elem.nodeFrom ? false : true;
    return false;
};

Sontgen.prototype.isEdge = function (elem) {
    if (elem)
        return !this.isNode(elem);
    else
        return false;
};

Sontgen.prototype.cursor = function(type, path){
    if(type == 'custom'){
        if(path)
            return sog.viz.canvas.getElement().style.cursor = 'url("'+path+'")';
        else
            return false;
    } else if(type) {
        return sog.viz.canvas.getElement().style.cursor = type;
    } else {
        return sog.viz.canvas.getElement().style.cursor;
    }
};

Sontgen.prototype.root = function(id){
    if(id){
        this.getNode(this.viz.root).setData('color', this.viz.config.Node.color);
        this.getNode(id).setData('color', '#7A6752');
        sog.viz.onClick(id);
        return this.getNode(id);
    } else {
        return this.getNode(this.viz.root);
    }
};
