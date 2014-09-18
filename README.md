SONTGEN
=======

Sontgen.js is a free js library that make easier build a Linked Data visualizer and editor. This projects 
also contains a demo app, open index.html to start. For more information visit http://sontgen.org.

##Getting Started

######Including sontgen.js:   
   
    //Minified version already include all resources required. It is located in 'src/sontgen.min.js'.
    <script src='/path/to/sontgen.min.js'></script>
    

######Creating a new visualization:

    <script>
    //The canvas will be injected into 'div_id'.
    var sog = new Sontgen('div_id')
    </script>   

######Loading some resources:
 
    <script>sog.openFile(localpath_or_URI, type, local)</script>

