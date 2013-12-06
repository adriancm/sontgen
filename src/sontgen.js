
function sontgen(canvas, mode) {

    this.graph = rgraph;
    this.fromJSON = rgraph.loadJSON(json);
    this.toJSON = '';
    this.addNode = '';
    this.addEdge = '';
    this.removeNode = '';
    this.removeEdge = '';
    this.getNode = '';
    this.getEdge = '';
    this.editNode = '';
    this.editEdge = '';

}

 var rgraph =  new $jit.RGraph({
        //Where to append the visualization
        injectInto: 'canvas',
        //Optional: create a background canvas that plots
        //concentric circles.
        background: {
            CanvasStyles: {
		strokeStyle: '#555'
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

        onBeforeCompute: function(node){
            //Log.write("centering " + node.name + "...");
            //Add the relation list in the right column.
            //This list is taken from the data property of each JSON node.
            //$jit.id('inner-details').innerHTML = node.data.relation;
        },
        
        //Add the name of the node in the correponding label
        //and a click handler to move the graph.
        //This method is called once, on label creation.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.onclick = function(){
                rgraph.onClick(node.id, {
                    onComplete: function() {
                        //Log.write("done");
                    }
                });
            };
        },
        //Change some label dom properties.
        //This method is called each time a label is plotted.
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
