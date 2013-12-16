var labelType, useGradients, nativeTextSupport, animate;

/**
 * Create a new sontgen object.
 * @class sontgen
 * @param {} canvas
 * @param {} mode
 */
function sontgen(canvas, mode) {
    /** @lends sontgen.prototype */
    /**
     * Description
     * @method sog_init
     * @return rgraph
     */
    function sog_init(){
        var rgraph = new $jit.RGraph({
	    //Where to append the visualization
	    injectInto: 'canvas',
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
		panning: true,
		zooming: 50
	    },
	    //Set Node and Edge styles.
	    Node: {
		color: 'purple',
	    },
	    
	    Edge: {
		color: 'green',
		lineWidth:1.5
	    },

	    /**
    	     * Description
    	     * @method onBeforeCompute
    	     * @param {} node
    	     * @return void
    	     */
    	    onBeforeCompute: function(node){
		//Log.write("centering " + node.name + "...");
		//Add the relation list in the right column.
		//This list is taken from the data property of each JSON node.
		//$jit.id('inner-details').innerHTML = node.data.relation;
	    },
	    
	    //
	    /**
    	     * Add the name of the node in the correponding label and a click handler to move the graph. This method is called once, on label creation.
    	     * @method onCreateLabel
    	     * @param {} domElement
    	     * @param {} node
    	     */
    	    onCreateLabel: function(domElement, node){
		domElement.innerHTML = node.name;
		/**
		 * Description
		 * @method onclick
		 */
		domElement.onclick = function(){
		    rgraph.onClick(node.id, {
			//onComplete: function() {
			//Log.write("done");
			//}
		    });
		};
	    },
	    //Change some label dom properties.
	    //This method is called each time a label is plotted.
	    /**
    	     * Description
    	     * @method onPlaceLabel
    	     * @param {} domElement
    	     * @param {} node
    	     */
    	    onPlaceLabel: function(domElement, node){
		var style = domElement.style;
		style.display = '';
		style.cursor = 'pointer';

		if (node._depth < 1) {
		    style.fontSize = "1em";
		    style.color = "#ccc";
		    
		} else if (node._depth < 2) {
		    style.fontSize = "0.8em";
		    style.color = "#ccc";
		    
		} else if (node._depth < 3) {
		    style.fontSize = "0.6em";
		    style.color = "#ccc";	
		} else {
		    style.fontSize = "0.4em";
		    style.color = "#ccc";	
		}

		var left = parseInt(style.left);
		var w = domElement.offsetWidth;
		style.left = (left - w / 2) + 'px';
	    }
	});
	console.log(rgraph);
	return rgraph;
    };

    this.viz = sog_init();
    
    /**
     * Description
     * @method fromJSON
     * @param {} file
     */
    this.fromJSON = function(file){ 
	
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
	//append information about the root relations in the right column
	// $jit.id('inner-details').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
    };


    /**
     * Description
     * @method toJSON
     * @param {} type
     * @return JSON Object
     */
    this.toJSON = function(type){ return this.viz.toJSON(type); };
    /**
     * Description
     * @method addNode
     * @param {} id
     * @param {} name
     * @param {} data
     * @return void
     */
    this.addNode = function(id, name, data){ this.viz.graph.addNode({'id':id,'name':name,'data':data}); };
    /**
     * Description
     * @method addEdge
     * @param {} node1
     * @param {} node2
     * @return void
     */
    this.addEdge = function(node1, node2){};
    this.removeNode = '';
    this.removeEdge = '';
    this.getNode = '';
    this.getEdge = '';
    this.editNode = '';
    this.editEdge = ''; 

    
}

