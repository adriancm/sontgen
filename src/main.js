var labelType, useGradients, nativeTextSupport, animate;

/*var Log = {
    elem: false,
    write: function(text){
	if (!this.elem) 
	    this.elem = document.getElementById('log');
	this.elem.innerHTML = text;
	this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};*/


function init(){
    //init data
    
    //end

    var sog = new sontgen();
    console.log(sog);
    sog.fromJSON(json);
    //console.log(sog.toJSON('tree'));
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}
