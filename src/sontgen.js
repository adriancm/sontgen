var labelType, useGradients, nativeTextSupport, animate, moved = true, pressed, node = false;
var autoID = 0;


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
                this.edgeTypes.arrow.render.call(this, adj, canvas);
                var data = adj.data;
                if(data.labeltext) {
                    var ctx = canvas.getCtx();
                    var posFr = adj.nodeFrom.pos.getc(true);
                    var posTo = adj.nodeTo.pos.getc(true);
		    ctx.fillStyle = "#ccc";
                    ctx.fillText(data.labeltext, (posFr.x + posTo.x)/2, (posFr.y + posTo.y)/2);
                }// if data.labeltext
            }
        }
    });

    

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
		strokeStyle: '#666',
	    },
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
	    dim: 20,
	},
	
	Edge: {
	    overridable: true,
	    color: 'green',
	    lineWidth: 2,
	    type: 'labeled',
	    
	},
	Label: { 
	    overridable: true,
	    type: 'Native',
	    color: '#fff',
	    size: 10,	    
	    
	},
	Tips: {  
	    enable: true,  
	    type: 'Native',  
	    offsetX: 10,  
	    offsetY: 10,  
	    onShow: function(tip, node) {
		//var styles = "padding: 10px; background-color: white; border-radius: 5px; ";
		console.log(tip);
		tip.innerHTML = "<div>"+
		    "<h4>URI"+node.name+"</h4>" +
		    "<p>Descripción</p>"+
		    "</div>";  
	    }  
	},  
	Events: {
	    enable: true, 
	    enableForEdges: true,
	    type: 'Native',  
	    
	    
	    onMouseEnter: function(node, eventInfo, e){
		$jit.util.event.stop(e);
		rgraph.canvas.getElement().style.cursor = 'pointer';  
	    },  
	    onMouseLeave: function(node, eventInfo, e){ 
		$jit.util.event.stop(e);
		rgraph.canvas.getElement().style.cursor = 'move';  
	    },  
	    onDragStart: function(elem, eventInfo, e){
		$jit.util.event.stop(e);
		if(elem){
		    node = elem;
		} else {
		    node = false;
		}
		console.log("Drag: "+elem.id);
		
	    },
	    onDragMove: function(elem, eventInfo, e){
		$jit.util.event.stop(e);
		
 		/*var pos = eventInfo.getPos(); 
		node.pos.setc(pos.x, pos.y);  
		rgraph.plot(); */ 
	    },  
	    onDragEnd: function(elem, eventInfo, e){
		$jit.util.event.stop(e);
		if(elem != undefined){	   
		    rgraph.graph.addAdjacence(node, elem);
		} else {
		    var newNode = rgraph.graph.addNode({'id':'_node'+autoID,'name':'_node'+autoID,'data':'data'});
		    autoID++;
		    rgraph.graph.addAdjacence(node, newNode);
		}
		
		
		console.log(elem.id);
		rgraph.fx.animate( {  
		    modes: [  
			'linear'  
		    ],  
		    duration: 700,  
		    transition: $jit.Trans.Elastic.easeOut  
		}); 
		rgraph.refresh();
		node = false;
	    },  
	    //touch events  
	    onTouchStart: function(node, eventInfo, e) {  
		//stop the default event  
		$jit.util.event.stop(e);  
	    },  
	    onTouchMove: function(node, eventInfo, e){  
		//stop the default event  
		$jit.util.event.stop(e);  
		var pos = eventInfo.getPos();  
		node.pos.setc(pos.x, pos.y);  
		rgraph.plot();  
	    },  
	    onTouchEnd: function(node, eventInfo, e){  
		//stop the default event  
		$jit.util.event.stop(e);  
		rgraph.compute('end');  
		rgraph.fx.animate( {  
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
	duration: 1500,	
    });

    

    this.viz = rgraph;
    this.canvas = canvas;
    this.mode = mode;
    this.view = view;

    console.log(rgraph);
}


sontgen.prototype.fromJSON = function(file){ 
    var that = this;
    this.viz.loadJSON(file); 
    
    /*var superNode = this.viz.graph.addNode({'id':'_superNode','name':'_superNode'});
      //trigger small animation
    var joined = false;*/
    console.log(this.viz.compute);
    this.viz.compute('end');
    this.viz.fx.animate({
	modes:['polar'],
	duration: 1000
     });
    //end
    var that = this;
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

sontgen.prototype.toJSON = function(type){ 
    
    return this.viz.toJSON(type); 
};

sontgen.prototype.addNode = function(name, data){ 
    
    this.viz.graph.addNode({'id':'_n_'+autoID,'name':name,'data':data}); 
    autoID++;
};
   
sontgen.prototype.addEdge = function(node, node2, data){ 
    
    this.viz.graph.addAdjacence(node, node2, data); 
};

sontgen.prototype.removeNode = function(id){ 

    if(this.getNode(id)){
	this.viz.graph.removeNode(id); 
    }
};

sontgen.prototype.removeEdge = function(id, id2){ 
    
    if(this.getEdge(id, id2)){
	this.viz.graph.removeAdjacence(id, id2); 
    }
};

sontgen.prototype.getNode = function(id){ 
    
    return this.viz.graph.getNode(id); 
};

sontgen.prototype.getNodeByName = function(name){ 
    return this.viz.graph.getByName(name); 
}

sontgen.prototype.getEdge = function(id, id2){ 

    return this.viz.graph.getAdjacence(id, id2); 
};

sontgen.prototype.editNode = function(id, name, data){ 
    
    var node = this.getNode(id);
    if(node){
	node.name = name;
	node.data = data;
    }
}

sontgen.prototype.editEdge = function(node, node2, data){

    var edge = this.getEdge(node.id,node2.id);
    if(edge){
	edge.data = data;
    }
}; 

sontgen.prototype.addEventToObj = function(obj, type, fn){

    $jit.util.addEvent(obj, type, fn);
}

sontgen.prototype.addEvent = function(type, fn){
    
    this.viz.config.Events[type] = fn;
}
