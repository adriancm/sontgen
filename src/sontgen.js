var labelType, useGradients, nativeTextSupport, animate;


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
		strokeStyle: '#444',
	    },
	},
	//Add navigation capabilities:
	//zooming by scrolling and panning.
	Navigation: {
	    enable: true,
	    panning: true,
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
	    type: 'Native',
	    color: 'green',
	    lineWidth:1.5,
	    type: 'labeled',
	    
	},
	Label: { 
	    overridable: true,
	    type: 'Native',
	    
	    
	    
	},
	Events: {
	    enable: true, 
	    enableForEdges: false,
	    type: 'Native',  
	    onClick: function(node, eventInfo, e){
		$jit.util.event.stop(e);
		if(node){
		    rgraph.onClick(node.id);
		}else{
		    var newNode = new $jit.Node('id','name','data');
		    rgraph.graph.addNode(newNode);
		    newNode.pos.setc(eventInfo.getPos());
		}
		
	    },
	    onMouseEnter: function(node, eventInfo, e){ 
		$jit.util.event.stop(e);
		rgraph.config.Navigation.panning = false;
		rgraph.canvas.getElement().style.cursor = 'pointer';  
	    },  
	    onMouseLeave: function(node, eventInfo, e){ 
		$jit.util.event.stop(e);
		rgraph.config.Navigation.panning = true;
		rgraph.canvas.getElement().style.cursor = 'move';  
	    },  
	    onDragMove: function(node, eventInfo, e){  
		$jit.util.event.stop(e);
		rgraph.config.Navigation.panning = false;
 		var pos = eventInfo.getPos(); 
		console.log(eventInfo);
		console.log(e);
		node.pos.setc(pos.x, pos.y);  
		rgraph.plot();  
	    },  
	    onDragEnd: function(node, eventInfo, e){
		rgraph.config.Navigation.panning = true;
		$jit.util.event.stop(e);
		rgraph.compute('end');  
		rgraph.fx.animate( {  
		    modes: [  
			'linear'  
		    ],  
		    duration: 700,  
		    transition: $jit.Trans.Elastic.easeOut  
		}); 
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
    
    this.viz.loadJSON(file); 
    
    
      //trigger small animation
    this.viz.graph.eachNode(function(n) {
	var pos = n.getPos();
	pos.setc(-200, -200);
    });
    this.viz.compute('end');
    this.viz.fx.animate({
	modes:['polar'],
	duration: 2000
     });
    //end
};

sontgen.prototype.toJSON = function(type){ return this.viz.toJSON(type); };

sontgen.prototype.addNode = function(id, name, data){ this.viz.graph.addNode({'id':id,'name':name,'data':data}); };
   
sontgen.prototype.addEdge = function(node, node2, data){ this.viz.graph.addAdjacence(node, node2, data); };

sontgen.prototype.removeNode = function(id){ this.viz.graph.removeNode(id); };

sontgen.prototype.removeEdge = function(id, id2){ this.viz.graph.removeAdjacence(id, id2); };

sontgen.prototype.getNode = function(id){ return this.viz.graph.getNode(id); };

sontgen.prototype.getNodeByName = function(name){ return this.viz.graph.getByName(name); }

sontgen.prototype.getEdge = function(id, id2){ return this.viz.graph.getAdjacence(id, id2); };

sontgen.prototype.editNode = function(id, name, data){ 
    
    if( this.viz.graph.getNode(id) !== '' ); 
    
}

sontgen.prototype.editEdge = function(node, node2, data){}; 
