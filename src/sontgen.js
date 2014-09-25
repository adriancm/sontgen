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

//Snippet for ajax
var ajax = {};
ajax.x = function() {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for(var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

ajax.send = function(url, callback, method, data, sync) {
    var x = ajax.x();
    x.open(method, url, sync);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
};

ajax.post = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), sync)
};

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
 * Constructor
 * @class Sontgen
 * @param {String} canvas
 * @return {Sontgen} Sontgen instance
 */
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

    /**
     * @property {$jit.Rgraph}
     * @memberof! Sontgen#
     * @alias viz 
     */
    this.viz = rgraph;

    /**
     * @property {String}
     * @memberof! Sontgen#
     * @alias canvas 
     */
    this.canvas = canvas;
    this.mode = mode;
    this.view = view;

     /**
     * @property {Object}
     * @memberof! Sontgen#
     * @alias namespaces 
     */
    this.namespaces = {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
    };

    console.log(rgraph);
}


Sontgen.prototype.namespaces = function(prefix, uri){
  if(prefix)
    if(uri)
        this.namespaces[prefix] = uri;
    else
        return this.namespaces[prefix];
  else
    return this.namespaces;
};

/**
 * Description
 * @method fromJSON
 * @memberof Sontgen.prototype
 * @param {JSON} json
 */
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

/**
 * Description
 * @method toJSON
 * @memberof Sontgen.prototype
 * @param {String} type
 * @return {JSON} A JSON graph representation
 */
Sontgen.prototype.toJSON = function() {
    var json = {};
    json.namespaces = this.namespaces;
    json.graph = this.viz.toJSON('graph');
    return json;
};

/**
 * Description
 * @method fromRDF
 * @memberof Sontgen.prototype
 * @param {String} rdf
 * @param {String} type
 * @return {Boolean}
 */
Sontgen.prototype.fromRDF = function(rdf, type){
    var that = this;
    var store = rdfstore.create();
    var json = {
        namespaces: {},
        graph: []
    };
    var n3 = "";

    switch (type) {
        case 'xml':
        case 'rdfa':
        case 'microdata':
        case 'rdf-json':
        case 'nt':
            ajax.post('http://rdf-translator.appspot.com/convert/'+type+'/n3/content',
                { content: rdf }, function (resp) {
                    rdf = resp;
                    type = 'text/n3';
                }, false);
            break;
    }

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

/**
 * Description
 * @method objToStore
 * @memberof Sontgen.prototype
 * @param {rdfstore.Store} store
 * @param {Node|Edge} elem
 * @return {RDFNode}
 */
Sontgen.prototype.objToStore = function(store, elem){
    var name = this.isNode(elem) ? elem.name : elem.data.name;
    if(!name){
        return store.rdf.createBlankNode();
    } else if(name.match(/^http:\/\//) || store.rdf.resolve(name)){
        return store.rdf.createNamedNode(name);
    } else {
        return store.rdf.createLiteral(name);
    }
};

/**
 * Description
 * @method toRDF
 * @memberof Sontgen.prototype
 * @param {String} type
 * @return {String} CallExpression
 */
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
            if(adj.data.$direction.toString() == [node.id, adj.nodeTo.id]) {
                var s = that.objToStore(store, node);
                var p = that.objToStore(store, adj);
                var o = that.objToStore(store, adj.nodeTo);

                rdfgraph.add(store.rdf.createTriple(s, p, o));
            }
        });
    });

    console.log(rdfgraph);
    return rdfgraph.toNT();
};

/**
 * Description
 * @method openFile
 * @memberof Sontgen.prototype
 * @param {String} path
 * @param {String} type
 * @param {Boolean} local
 * @return {Boolean} Literal
 */
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

/**
 * Description
 * @method saveAs
 * @memberof Sontgen.prototype
 * @param {String} type
 */
Sontgen.prototype.saveAs = function(type){
    //var b = new Blob([JSON.stringify(this.toJSON('graph'))], {type: "text/plain;charset=utf-8"});
    var b = new Blob([this.toRDF('nt')], {type: "text/nt;charset=utf-8"});
    saveAs(b, "myfile.nt");
};

/**
 * Description
 * @method addNode
 * @memberof Sontgen.prototype
 * @param {String} name
 * @param {Object} data
 * @return {Node} n
 */
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

/**
 * Description
 * @method addEdge
 * @memberof Sontgen.prototype
 * @param {Node} node
 * @param {Node} node2
 * @param {Object} data
 * @return {Edge} e
 */
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

/**
 * Description
 * @method removeNode
 * @memberof Sontgen.prototype
 * @param {String} id
 * @return {Boolean} Literal
 */
Sontgen.prototype.removeNode = function(id) {
    //TODO Root or Last node case
    if (this.getNode(id) && id != this.viz.root) {
        this.viz.graph.removeNode(id);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

/**
 * Description
 * @method removeEdge
 * @memberof Sontgen.prototype
 * @param {String} id
 * @param {String} id2
 * @return {Boolean} Literal
 */
Sontgen.prototype.removeEdge = function(id, id2) {

    if(this.getEdge(id, id2)){
        this.viz.graph.removeAdjacence(id, id2);
        this.animate('Elastic', 'easeOut');
        return true;
    }
    return false;
};

/**
 * Description
 * @method remove
 * @memberof Sontgen.prototype
 * @param {Node|Edge} elem
 * @return {Boolean} added?
 */
Sontgen.prototype.remove = function(elem) {

    if(this.isNode(elem)){
        this.removeNode(elem.id);
        return true;
    }else{
        this.removeEdge(elem.nodeFrom.id,elem.nodeTo.id);
        return true;
    }
};

/**
 * Description
 * @method getNode
 * @memberof Sontgen.prototype
 * @param {String} id
 * @return {Node} node
 */
Sontgen.prototype.getNode = function(id) {

    return this.viz.graph.getNode(id);
};

/**
 * Description
 * @method getNodeByName
 * @memberof Sontgen.prototype
 * @param {String} name
 * @return {Node} node
 */
Sontgen.prototype.getNodeByName = function(name) {
    return this.viz.graph.getByName(name);
};

/**
 * Description
 * @method getEdge
 * @memberof Sontgen.prototype
 * @param {String} id
 * @param {String} id2
 * @return {Edge} edge
 */
Sontgen.prototype.getEdge = function(id, id2) {

    return this.viz.graph.getAdjacence(id, id2);
};

/**
 * Description
 * @method editNode
 * @memberof Sontgen.prototype
 * @param {String} id
 * @param {String} name
 * @param {Object} data
 * @return {Node|Boolean} node or false
 */
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

/**
 * Description
 * @method editEdge
 * @memberof Sontgen.prototype
 * @param {Node} node
 * @param {Node} node2
 * @param {Object} data
 * @return {Edge|Boolean} edge or false
 */
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

/**
 * Description
 * @method addEventToObj
 * @memberof Sontgen.prototype
 * @param {Node|Edge} obj
 * @param {String} event
 * @param {Function} fn
 */
Sontgen.prototype.addEventToObj = function(obj, event, fn) {

    $jit.util.addEvent(obj, event, fn);
};

/**
 * Description
 * @method addEvent
 * @memberof Sontgen.prototype
 * @param {String} event
 * @param {Function} fn
 */
Sontgen.prototype.addEvent = function(event, fn) {

    this.viz.config.Events[event] = fn;
};

/**
 * Description
 * @method animate
 * @memberof Sontgen.prototype
 * @param {String} trans
 * @param {String} way
 * @param {Number} dur
 */
Sontgen.prototype.animate = function(trans, way, dur) {

    dur = dur || 500;

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

/**
 * Description
 * @method showTip
 * @memberof Sontgen.prototype
 * @param {Number} x
 * @param {Number} y
 * @param {Object} elem
 * @param {String} html
 */
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
        var div = document.createElement('div');
        div.innerHTML = html;
        document.getElementById('canvas-canvaswidget').appendChild(div);
    }
};

/**
 * Description
 * @method hideTips
 * @memberof Sontgen.prototype
 */
Sontgen.prototype.hideTips = function(){
    var tips = document.getElementsByClassName('customtip');
    for (var i = 0; i < tips.length; i++){
       tips[i].parentNode.remove();
    }
};

/**
 * Description
 * @method isNode
 * @memberof Sontgen.prototype
 * @param {Node|Edge} elem
 * @return {Boolean} bool
 */
Sontgen.prototype.isNode = function (elem) {
    if (elem) return elem.nodeFrom ? false : true;
    return false;
};

/**
 * Description
 * @method isEdge
 * @memberof Sontgen.prototype
 * @param {Node|Edge} elem
 * @return {Boolean} bool
 */
Sontgen.prototype.isEdge = function (elem) {
    if (elem)
        return !this.isNode(elem);
    else
        return false;
};

/**
 * Description
 * @method cursor
 * @memberof Sontgen.prototype
 * @param {String} type
 * @param {String} path
 * @return {String} cursor
 */
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

/**
 * Description
 * @method root
 * @memberof Sontgen.prototype
 * @param {String} id
 * @return {Node} root
 */
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
